// Clicks through the demo (src/index.html) the way a visitor to the live Pages site would,
// from file:// with no server, and checks it carries the org source bar and stays offline.
import { test } from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

test("demo carries the source bar, scans to six findings, and loads only its own files", async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const requests = [];
  page.on("request", (req) => requests.push(req.url()));
  await page.goto(pathToFileURL("src/index.html").href);

  // The source bar is the first thing on the page, with the demo note and the repo link.
  const first = await page.$eval("body > :first-child", (el) => ({
    cls: el.className,
    top: el.getBoundingClientRect().top,
    note: el.querySelector(".src-note").textContent,
    href: el.querySelector(".src-link").href,
  }));
  assert.equal(first.cls, "src-bar");
  assert.equal(first.top, 0);
  assert.match(first.note, /^Demo/);
  assert.equal(first.href, "https://github.com/ai-automation-tools/cloakscan");

  await page.click("#toolbar-btn");
  await page.click("#cs-scan-btn");
  await page.locator(".cs-finding").nth(5).waitFor();
  assert.equal(await page.locator(".cs-finding").count(), 6);
  // Five outlined on the article; the HTML comment has no element to outline.
  assert.equal(await page.locator("#mock-page [data-cs-flagged]").count(), 5);

  const offsite = requests.filter((url) => !url.startsWith("file:"));
  assert.deepEqual(offsite, [], "the demo requested something other than its own files");
  await browser.close();
});
