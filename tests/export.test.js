// "Export findings" writes an Agent Security Suite inventory document. These tests validate
// the export against the vendored schema (schemas/agent-inventory/v0.1.json, never edited)
// from both hosts' data: a real content.js scan of the fixture, and a download from the demo.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const schema = JSON.parse(readFileSync("schemas/agent-inventory/v0.1.json", "utf8"));
const contentScript = readFileSync("src/extension/content.js", "utf8");
const popupScript = readFileSync("src/extension/popup.js", "utf8");
const fixtureUrl = pathToFileURL("tests/fixtures/hidden-text.html").href;
const demoUrl = pathToFileURL("src/index.html").href;
const SIX = ["aria-hidden", "color-match", "html-comment", "offscreen", "zero-size", "zero-width"];

// ponytail: a JSON Schema 2020-12 subset, just the keywords this schema uses. Any other keyword
// throws, so a schema bump can't pass silently; swap in a full validator if the schema outgrows it.
const ANNOTATIONS = new Set(["$schema", "$id", "$defs", "title", "description", "examples", "default"]);
const TYPES = {
  object: (v) => v !== null && typeof v === "object" && !Array.isArray(v),
  array: Array.isArray,
  string: (v) => typeof v === "string",
  integer: Number.isInteger,
  boolean: (v) => typeof v === "boolean",
  null: (v) => v === null,
};
const FORMATS = {
  "date-time": (v) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(v) && !Number.isNaN(Date.parse(v)),
  uri: (v) => URL.canParse(v),
  email: (v) => /^[^@\s]+@[^@\s]+$/.test(v),
};

function validate(value, node = schema, path = "$", errors = []) {
  for (const [key, rule] of Object.entries(node)) {
    if (ANNOTATIONS.has(key)) continue;
    switch (key) {
      case "$ref":
        validate(value, rule.slice(2).split("/").reduce((n, k) => n[k], schema), path, errors);
        break;
      case "type": {
        const types = [rule].flat();
        if (!types.some((t) => TYPES[t](value))) errors.push(`${path}: not ${types.join("|")}`);
        break;
      }
      case "const":
        if (value !== rule) errors.push(`${path}: not ${JSON.stringify(rule)}`);
        break;
      case "enum":
        if (!rule.includes(value)) errors.push(`${path}: ${JSON.stringify(value)} not in enum`);
        break;
      case "pattern":
        if (typeof value === "string" && !new RegExp(rule, "u").test(value)) errors.push(`${path}: fails ${rule}`);
        break;
      case "format":
        if (typeof value === "string" && !FORMATS[rule](value)) errors.push(`${path}: not a ${rule}`);
        break;
      case "minimum":
        if (typeof value === "number" && value < rule) errors.push(`${path}: below ${rule}`);
        break;
      case "required":
        if (TYPES.object(value)) for (const k of rule) if (!(k in value)) errors.push(`${path}: missing ${k}`);
        break;
      case "properties":
        if (TYPES.object(value)) {
          for (const [k, sub] of Object.entries(rule)) if (k in value) validate(value[k], sub, `${path}.${k}`, errors);
        }
        break;
      case "additionalProperties":
        if (rule !== false) throw new Error(`unsupported additionalProperties at ${path}`);
        if (TYPES.object(value)) {
          for (const k of Object.keys(value)) if (!(k in (node.properties || {}))) errors.push(`${path}: extra property ${k}`);
        }
        break;
      case "items":
        if (Array.isArray(value)) value.forEach((v, i) => validate(v, rule, `${path}[${i}]`, errors));
        break;
      default:
        throw new Error(`schema keyword "${key}" at ${path} isn't supported by this validator`);
    }
  }
  return errors;
}

let browser;
before(async () => { browser = await chromium.launch(); });
after(async () => { await browser?.close(); });

test("the validator rejects documents that break the schema", () => {
  const bad = {
    schemaVersion: "0.2",
    generatedAt: "yesterday",
    producer: { name: "cloakscan" },
    identities: [],
    findings: [{ id: "1", identityId: "x", ruleId: "cloakscan/offscreen", severity: "urgent", title: "t", note: "" }],
  };
  const errors = validate(bad);
  for (const want of ["$.schemaVersion", "$.generatedAt", "$.producer: missing version", "severity", "extra property note"]) {
    assert.ok(errors.some((e) => e.includes(want)), `expected an error for ${want}, got ${errors.join("; ")}`);
  }
});

test("a fixture scan exports as a valid inventory, one finding per hit", async () => {
  const page = await browser.newPage();
  await page.goto(fixtureUrl);
  const result = await page.evaluate(contentScript);
  await page.addScriptTag({ content: popupScript });
  const doc = await page.evaluate((r) => globalThis.toInventory(r, "0.1.0"), result);
  await page.close();

  assert.deepEqual(validate(doc), []);
  assert.deepEqual(doc.identities, []);
  assert.deepEqual(doc.findings.map((f) => f.ruleId.replace("cloakscan/", "")).sort(), SIX);
  for (const [i, f] of doc.findings.entries()) {
    assert.ok(f.ruleId.startsWith("cloakscan/"));
    assert.equal(f.identityId, fixtureUrl);
    assert.ok(f.evidence.includes(fixtureUrl) && f.evidence.includes(result.findings[i].snippet), "evidence holds the URL and hidden text");
    assert.equal(f.severity, result.findings[i].confidence === "high" ? "high" : "medium");
  }
});

test("a clean page exports a valid inventory with no findings", async () => {
  const page = await browser.newPage();
  await page.setContent("<article><h1>Weather</h1><p>Light rain this afternoon, clearing by evening.</p></article>");
  const result = await page.evaluate(contentScript);
  await page.addScriptTag({ content: popupScript });
  const doc = await page.evaluate((r) => globalThis.toInventory(r, "0.1.0"), result);
  await page.close();
  assert.deepEqual(validate(doc), []);
  assert.deepEqual(doc.findings, []);
});

test("the demo's Export findings button downloads a valid inventory", async () => {
  const page = await browser.newPage();
  await page.goto(demoUrl);
  await page.click("#toolbar-btn");
  assert.ok(await page.isDisabled("#cs-export-btn"), "export waits for a scan");
  await page.click("#cs-scan-btn");
  await page.waitForSelector("#cs-findings li");
  const [download] = await Promise.all([page.waitForEvent("download"), page.click("#cs-export-btn")]);
  assert.match(download.suggestedFilename(), /^cloakscan-findings-\d{4}-\d{2}-\d{2}\.json$/);
  const doc = JSON.parse(readFileSync(await download.path(), "utf8"));
  await page.close();

  assert.deepEqual(validate(doc), []);
  assert.equal(doc.producer.name, "cloakscan");
  assert.deepEqual(doc.findings.map((f) => f.ruleId).sort(), SIX.map((t) => `cloakscan/${t}`));
});
