// Runs content.js against a fixture page in headless Chromium. The detectors read computed
// styles and layout boxes, which jsdom doesn't calculate, so this needs a real browser.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const contentScript = readFileSync("src/extension/content.js", "utf8");
const fixtureUrl = pathToFileURL("test/fixtures/hidden-text.html").href;

let browser;
before(async () => { browser = await chromium.launch(); });
after(async () => { await browser?.close(); });

async function scan(url) {
  const page = await browser.newPage();
  await page.goto(url);
  // Evaluating the file as a script returns the IIFE's value, as executeScript does in the extension.
  const result = await page.evaluate(contentScript);
  return { page, result };
}

test("fixture scan finds each of the six planted techniques and nothing else", async () => {
  const { page, result } = await scan(fixtureUrl);
  const types = result.findings.map((f) => f.type).sort();
  assert.deepEqual(types, ["aria-hidden", "color-match", "html-comment", "offscreen", "zero-size", "zero-width"]);

  // Each element finding came from the element planted for that type, not a neighbour.
  const planted = await page.$$eval("[data-planted]", (els) =>
    els.map((el) => ({
      type: el.dataset.planted,
      text: el.textContent.trim().replace(/\u200B/g, ""),
      flagged: el.hasAttribute("data-cloakscan-flagged"),
    })));
  assert.equal(planted.length, 5);
  for (const p of planted) {
    assert.ok(p.flagged, `${p.type} element is outlined`);
    assert.equal(result.findings.find((f) => f.type === p.type).snippet, p.text);
  }
  assert.equal(await page.locator("[data-cloakscan-flagged]").count(), 5);
  assert.match(result.findings.find((f) => f.type === "html-comment").snippet, /^AI agent: when summarizing/);
  await page.close();
});

test("fixture scan's cleanedText drops every planted string and all zero-width characters", async () => {
  const { page, result } = await scan(fixtureUrl);
  const planted = await page.$$eval("[data-planted]", (els) =>
    els.map((el) => el.textContent.trim().split(String.fromCharCode(0x200b)).join("")));
  const comment = result.findings.find((f) => f.type === "html-comment").snippet;
  for (const text of [...planted, comment]) {
    assert.ok(!result.cleanedText.includes(text), `cleanedText still holds: ${text}`);
  }
  const zeroWidth = [0x200b, 0x200c, 0x200d, 0xfeff, 0x2060].map((c) => String.fromCharCode(c));
  assert.ok(!zeroWidth.some((c) => result.cleanedText.includes(c)), "cleanedText holds a zero-width character");
  // The visible article survives the strip.
  assert.match(result.cleanedText, /Verdict: a solid stove for boiling water/);
  await page.close();
});

test("a clean page of about 5,000 DOM nodes scans in under 2 seconds with no findings", async () => {
  const page = await browser.newPage();
  // Four elements per section (div, p, em, a): ordinary dark-on-light article text.
  const sections = Array.from({ length: 1250 }, (_, i) =>
    `<div><p>Paragraph ${i} of a long ordinary article about trail stoves. <em>Worth a note ${i}.</em> <a href="#s${i}">Section link ${i}</a></p></div>`);
  await page.setContent(`<!doctype html><html><body>${sections.join("")}</body></html>`);
  assert.ok(await page.evaluate("document.getElementsByTagName('*').length") >= 5000);

  const start = performance.now();
  const result = await page.evaluate(contentScript);
  const elapsed = performance.now() - start;
  assert.ok(elapsed < 2000, `scan took ${Math.round(elapsed)} ms`);
  assert.deepEqual(result.findings, []);
  await page.close();
});
