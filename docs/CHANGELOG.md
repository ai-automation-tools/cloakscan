<h1 align="center">📋 CloakScan Changelog</h1>

<p align="center">
  <em>What changed in CloakScan, newest first.</em>
</p>

<p align="center">
  <a href="ROADMAP.md"><img src="https://img.shields.io/badge/plan-ROADMAP-8B5CF6?style=for-the-badge" alt="Roadmap"></a>
  <a href="README.md"><img src="https://img.shields.io/badge/↩-docs-6B7280?style=for-the-badge" alt="Docs home"></a>
</p>

---

Entries that close a roadmap item carry the roadmap phase in italics.

## Unreleased

**Security**
- The popup escapes the finding label as well as the snippet before it goes into `innerHTML` (security sweep, 2026-10-26). Not reachable from a page today; defense in depth.

**Changed**
- The README links the demo at its own host, `https://cloakscan-demo.ai-automation-tools.dev/`, set at graduation; the old `ai-automation-tools.dev/cloakscan/` address redirects there.

**Added**
- Example pages at `src/examples/`: made-up articles with one hidden-text trick each, for trying the installed extension on a real page, plus a gallery linked from the demo. The first is a lentil soup recipe with an off-screen instruction. `tests/examples.test.js` scans each page in headless Chromium and checks it returns exactly the one finding its `cloakscan-example` meta names, and that the gallery lists every page. A weekly content job adds a page.
- `docs/UPSTREAMS.md` lists what CloakScan assumes about the Chrome extension platform, Playwright, Node, ESLint and GitHub Pages and Actions, and `.github/dependabot.yml` opens weekly grouped minor and patch updates for npm and GitHub Actions (majors ignored). The biweekly upstream check works from the list.
- Live demo at `https://ai-automation-tools.dev/cloakscan/`: `.github/workflows/pages.yml` publishes `src/` through `actions/deploy-pages` on every push to `main`. The demo carries the org source bar across the very top (a demo note, and View source linking this repo); the theme switch sits under it. `tests/demo-theme.test.js` checks the bar comes first and links the repo. The README hero gains a Live Demo badge and nav link. *Public release*
- `.github/workflows/ci.yml` runs `npm ci`, lint, the tests (with headless Chromium) and the build on every PR and every push to `main`, with read-only `contents` permission.
- `SECURITY.md`: report vulnerabilities through GitHub's private advisories, and what counts as one. A full-history `gitleaks` scan came back clean. *Public release*
- `PRIVACY.md`, the policy the store listing will link: nothing collected, the last scan kept in `chrome.storage.local` on the device, nothing sent anywhere. *Public release*
- Every README step checked against the real build (build, load unpacked, scan, copy, test, lint, the `file://` demo). They behave as written; the README's status note now names the demo, not the store package, as next. *Public release*
- `test/manifest.test.js` fails if any file under `src/extension/` contains `fetch(`, `XMLHttpRequest`, `WebSocket`, `sendBeacon` or `EventSource` (ADR-002). *Build*
- [ADR-003](decisions/adr-003-instruction-phrasing.md) settles the spec's open question on instruction-like phrasing, and a test in `test/detection.test.js` checks 13 phrasings the checks catch, 5 ordinary sentences they leave alone, and 3 known misses (no addressee, obfuscated, non-English). *Build*
- Two more tests in `test/detection.test.js`: the fixture scan's `cleanedText` (what the copy-visible-only button copies) holds none of the six planted strings and no zero-width characters while keeping the visible article, and a generated clean page of 5,000 elements scans in under 2 seconds with zero findings. *Build*
- `test/detection.test.js`: headless Chromium (Playwright, a new dev dependency) loads the fabricated fixture `test/fixtures/hidden-text.html`, injects `content.js` the way `executeScript` does, and asserts the scan returns exactly one finding of each of the six types, each from the element planted for it. Run `npx playwright install chromium` once before `npm test`. *Build*
- Toolbar icon set (16, 32, 48, 128 px) in `src/extension/icons/`, wired to `icons` and `action.default_icon` in the manifest. `scripts/icons.js` draws them with no dependencies. *Build*
- `test/manifest.test.js` fails on any permission beyond `activeTab`, `scripting` and `storage`, on any `host_permissions`, `content_scripts` or `background` entry, on a missing icon size, and on Pro or agent-block copy in the popup. *Build*
- A light/dark switch on the demo page (`src/index.html`), top right. It themes the page, the mock browser chrome and the demo's popup panel; the mock article stays a light page in both, since one planted finding is white-on-white text. The choice persists in `localStorage` as `cloakscan.theme`, light by default, and a pre-paint script applies it with no flash. The shipped extension popup is unchanged. `test/demo-theme.test.js` keeps the two defaults in step.

**Changed**
- Moved to the org folder layout: the agent instructions are in `AGENTS.md` now (Codex, Gemini CLI and opencode read it), and `CLAUDE.md` is a bare `@AGENTS.md` import for Claude Code. The test folder is `tests/` instead of `test/`, with every path that named it updated.
- The demo-only sample-data loader, the one `fetch` in the extension folder, moved from `src/extension/popup.js` into the demo harness `src/script.js`. The popup's demo branch reaches it through `window.__cloakscanLoadSampleData`; the shipped extension holds no network code. *Build*
- The aria-hidden and HTML-comment checks match word-bounded patterns that need a model addressee or an override ("ignore previous instructions", "you are a shopping assistant", "AI agent:", "do not tell the user") instead of bare substrings. Ordinary copy like "we recommend the", "act as" and `<!-- override default styles -->` no longer gets flagged. *Build*
- The popup footnote, in the extension and the demo, no longer advertises a Pro tier or an agent-block mode. It now says the scan runs only on click, only on this tab, and nothing leaves the browser. *Build*

**Docs**
- 2026-10-19: release scope cut to the MVP (pipeline change, Mike). The store-ready package and the Chrome Web Store submission kit moved below `## After public release`, to the top of Listing and launch; the demo-safety and README-hero items folded into the live-demo item; the routine now runs Tue/Thu/Sat and batches up to six `small` items. No item dropped.
- 2026-10-19: the roadmap moved onto the lab's roadmap standard: `now` and `stage` badges, an intro naming the CloakScan Weekly Roadmap routine, the Build section headed as Slice 1 from the build plan, done notes moved to the end of each item (`— done YYYY-MM-DD: …`), and the Should items regrouped under Later. No items added or dropped, and every state is unchanged.

## 2026-09-27

**Added**
- The prototype extension (`src/extension/`) and its mock-browser demo (`src/index.html`), carried over from the source idea with its six detectors, on-page outlines, and copy-visible-only button.
- `npm run build` copies the extension into `dist/extension/`; `npm test` checks the manifest is MV3; `npm run lint` runs ESLint. All three pass.
- MIT license.

**Changed**
- The zero-width character pattern in `content.js` is written with `\u` escapes instead of the literal invisible characters. It matches the same five characters.

**Docs**
- Root README, docs hub, roadmap with release gates, and this changelog.
- The product spec and build plan, copied from the business plan into `docs/product/`.
- `CLAUDE.md` for the weekly roadmap agent.

---

<p align="center">
  <a href="README.md">← Docs home</a> ·
  <a href="ROADMAP.md">← Roadmap</a>
</p>
