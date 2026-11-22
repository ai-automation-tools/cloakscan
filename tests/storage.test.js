// What the popup keeps between opens. It runs the real popup.html from file:// with a stand-in
// `chrome` object, fed a real content.js scan of the fixture, and reads what lands in storage.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const contentScript = readFileSync("src/extension/content.js", "utf8");
const fixtureUrl = pathToFileURL("tests/fixtures/hidden-text.html").href;
const popupUrl = pathToFileURL("src/extension/popup.html").href;

let browser;
let scan;
before(async () => {
  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(fixtureUrl);
  scan = await page.evaluate(contentScript);
  await page.close();
});
after(async () => { await browser?.close(); });

// Opens the popup on `tab` with `session` as chrome.storage.session; resolves to the page.
async function openPopup(tab, session = {}) {
  const page = await browser.newPage();
  await page.addInitScript(({ tab, session, scan }) => {
    globalThis.__session = session;
    const storage = {
      get: async (key) => ({ [key]: globalThis.__session[key] }),
      set: async (items) => { Object.assign(globalThis.__session, items); },
      remove: async (key) => { delete globalThis.__session[key]; },
    };
    Object.defineProperty(globalThis, "chrome", {
      value: {
        tabs: { query: async () => [tab] },
        scripting: { executeScript: async () => [{ result: scan }] },
        storage: { session: storage }, // no storage.local: a call to it would throw
        runtime: { getManifest: () => ({ version: "0.1.0" }) },
      },
    });
  }, { tab, session, scan });
  await page.goto(popupUrl);
  return page;
}

const tab = { id: 7, url: fixtureUrl };

test("a scan stores capped snippets and no page text, tied to its tab", async () => {
  assert.ok(scan.findings.some((f) => f.snippet.length > 60), "the fixture has a snippet long enough to cap");
  const page = await openPopup(tab);
  await page.click("#cs-scan-btn");
  await page.waitForSelector("#cs-findings li");
  assert.equal(await page.isDisabled("#cs-copy-btn"), false, "the fresh scan can still copy");
  const stored = await page.evaluate(() => globalThis.__session.cloakscanLastResult);
  await page.close();

  assert.deepEqual(Object.keys(stored).sort(), ["findings", "scannedAt", "tabId", "url"]);
  assert.equal(stored.tabId, 7);
  assert.equal(stored.url, fixtureUrl);
  assert.equal(stored.findings.length, scan.findings.length);
  for (const [i, f] of stored.findings.entries()) {
    assert.deepEqual(Object.keys(f).sort(), ["confidence", "snippet", "type"]);
    assert.ok(f.snippet.length <= 61, `snippet ${i} is ${f.snippet.length} characters`);
    assert.ok(scan.findings[i].snippet.startsWith(f.snippet.replace(/…$/, "")));
  }
  assert.ok(!JSON.stringify(stored).includes(scan.cleanedText.slice(0, 200)), "no visible page text stored");
});

test("reopening on the same tab and page shows the stored findings, without copy", async () => {
  const saved = { cloakscanLastResult: { tabId: 7, url: fixtureUrl, scannedAt: scan.scannedAt, findings: scan.findings } };
  const page = await openPopup(tab, saved);
  await page.waitForSelector("#cs-findings li");
  assert.equal(await page.locator("#cs-findings li").count(), scan.findings.length);
  assert.ok(await page.isDisabled("#cs-copy-btn"));
  assert.match(await page.textContent("#cs-status"), /Scan again to copy/);
  await page.close();
});

for (const [why, elsewhere] of [
  ["another tab, or the scanned one closed", { id: 8, url: fixtureUrl }],
  ["the same tab on a new page", { id: 7, url: "https://example.com/next" }],
]) {
  test(`reopening on ${why} drops the stored scan`, async () => {
    const saved = { cloakscanLastResult: { tabId: 7, url: fixtureUrl, scannedAt: scan.scannedAt, findings: scan.findings } };
    const page = await openPopup(elsewhere, saved);
    await page.waitForFunction(() => !("cloakscanLastResult" in globalThis.__session));
    assert.equal(await page.locator("#cs-findings li").count(), 0);
    await page.close();
  });
}
