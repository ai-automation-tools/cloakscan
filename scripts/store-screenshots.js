// Takes the Chrome Web Store screenshots (1280x800 PNG) from the demo in src/index.html and
// writes them to docs/store/. Run by hand when the popup or the demo changes:
//   node scripts/store-screenshots.js
// Needs Playwright's Chromium (npx playwright install chromium). The demo's source bar,
// theme switch and harness notes are hidden so the shot shows only the mock browser.
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs", "store");
const demoUrl = pathToFileURL(join(root, "src", "index.html")).href;
const hideChrome = ".src-bar, .theme-toggle, .harness-note { display: none !important; }";

const shots = [
  { file: "screenshot-1-scan-light.png", theme: "light", scrollList: false },
  // Dark, with the findings list scrolled to its end so it shows the other four findings.
  { file: "screenshot-2-scan-dark.png", theme: "dark", scrollList: true },
];

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
try {
  for (const shot of shots) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.addInitScript((theme) => localStorage.setItem("cloakscan.theme", theme), shot.theme);
    await page.goto(demoUrl);
    await page.addStyleTag({ content: hideChrome });
    await page.click("#toolbar-btn");
    await page.click("#cs-scan-btn");
    await page.waitForSelector("#cs-findings li");
    if (shot.scrollList) {
      await page.$eval("#cs-findings", (list) => { list.scrollTop = list.scrollHeight; });
    }
    await page.screenshot({ path: join(outDir, shot.file) });
    await page.close();
    console.log(`Wrote docs/store/${shot.file}`);
  }
} finally {
  await browser.close();
}
