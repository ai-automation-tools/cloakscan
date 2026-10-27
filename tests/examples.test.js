// Checks every example page in src/examples/: a scan returns exactly the one finding its
// cloakscan-example meta names, the planted text is stripped from cleanedText, and the
// gallery index lists every page and nothing else.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const contentScript = readFileSync("src/extension/content.js", "utf8");
const dir = "src/examples";
const types = ["aria-hidden", "color-match", "html-comment", "offscreen", "zero-size", "zero-width"];
const pages = readdirSync(dir).filter((f) => f.endsWith(".html") && f !== "index.html").sort();

let browser;
before(async () => { browser = await chromium.launch(); });
after(async () => { await browser?.close(); });

test("there is at least one example page", () => {
  assert.ok(pages.length > 0);
});

test("the gallery index links every example page once and nothing else", () => {
  const index = readFileSync(`${dir}/index.html`, "utf8");
  const list = index.slice(index.indexOf('<ul id="examples">'), index.indexOf("</ul>"));
  const linked = [...list.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).sort();
  assert.deepEqual(linked, pages);
});

for (const file of pages) {
  test(`${file}: one planted finding of the declared type`, async () => {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(`${dir}/${file}`).href);
    const expected = await page.getAttribute('meta[name="cloakscan-example"]', "content");
    assert.ok(types.includes(expected), `cloakscan-example meta names a known type, got ${expected}`);

    const result = await page.evaluate(contentScript);
    assert.deepEqual(result.findings.map((f) => f.type), [expected]);
    const snippet = result.findings[0].snippet;
    assert.ok(snippet.length > 0);
    if (expected !== "zero-width") {
      assert.ok(!result.cleanedText.includes(snippet), "cleanedText still holds the planted text");
    }
    await page.close();
  });
}
