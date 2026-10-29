<h1 align="center">🗺️ Roadmap</h1>

<p align="center">
  <em>Everything between a working prototype and a public, demoable CloakScan, in the order it has to happen.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/now-public_release-F59E0B?style=for-the-badge" alt="Now: public release">
  <img src="https://img.shields.io/badge/stage-incubating-2ea44f?style=for-the-badge" alt="Stage: incubating">
  <a href="README.md"><img src="https://img.shields.io/badge/↩-docs_home-6B7280?style=for-the-badge" alt="Back to docs"></a>
</p>

---

The CloakScan Weekly Roadmap routine works this file top to bottom every Tuesday, Thursday and Saturday:
it takes the first open item that isn't `🔒 Needs Mike` (or up to six `small` ones), builds
it, ticks it and opens a `roadmap/auto-<date>` PR. **Every item above `## After public
release` is a release gate.** CloakScan goes public when all of them are ticked and Mike
says so. Ticking an item adds its line to the [changelog](CHANGELOG.md) and updates any doc
it made stale, in the same commit.

Markers: `- [ ]` open, `- [-]` claimed by a run in progress, `- [x]` done, `- [!]` blocked
(the reason follows on the line). `small` marks docs or config a run can batch, up to six
per PR (untagged means a feature, one per run); `🔒 Needs Mike` marks one only Mike can do.

The slices come from [product/build-plan.md](product/build-plan.md). Slice 0, the
prototype, is already in `src/`. The Chrome Web Store listing (Slice 3) and the launch
(Slice 4) sit below the release line: both need Mike's account and money, and the repo
plus its demo can go public without them. Since 2026-10-19 the store package and the submission
kit sit below the line too, at the top of Listing and launch: the repo and its demo go
public at the MVP, and the listing work follows before Mike submits.

## 🔨 Slice 1: Harden and test what already works

- [x] **Slice 1a: trim the prototype to the spec.** The popup footnote stops advertising a Pro tier and an agent-block mode (both on the spec's Won't list), in `src/extension/popup.html` and in the demo's copy of the popup markup in `src/script.js`. The manifest gets a 16/32/48/128 px icon set under `src/extension/icons/` and an `action.default_icon`. `tests/manifest.test.js` fails if the manifest declares any permission other than `activeTab`, `scripting` and `storage`, or any `host_permissions` or `content_scripts` entry. — done 2026-09-29: footnote rewritten in both copies, icon set drawn by `scripts/icons.js`, manifest test covers permissions, icons and the footnote
- [x] **Slice 1b: fixture detection test in a real browser.** A headless Chromium test (Playwright as a dev dependency) loads a fixture page carrying one planted example of each of the six techniques, injects `src/extension/content.js`, and asserts all six come back with the right `type`. jsdom won't do here: the detectors read computed styles and layout boxes, which jsdom doesn't calculate. `npm test` runs it. — done 2026-10-06: `tests/detection.test.js` runs `content.js` on `tests/fixtures/hidden-text.html` in headless Chromium and asserts exactly the six planted types, each from its planted element
- [x] **Slice 1c: copy-visible-only and scan latency.** Tests assert the fixture scan's `cleanedText` contains none of the six planted strings and no zero-width characters, and that a scan of a generated page of about 5,000 DOM nodes finishes in under 2 seconds. — done 2026-10-13: `tests/detection.test.js` checks the fixture's `cleanedText` holds no planted string or zero-width character, and that a clean 5,000-element page scans in about 0.2 s with zero findings
- [x] **Decide how the aria-hidden check spots instruction-like text.** The spec's open question, due before the public release. Write `docs/decisions/adr-003-instruction-phrasing.md` comparing the current hand-written keyword list with at least one alternative, pick one, and implement it with tests for phrasings it catches and ones it knowingly misses. English only, per the spec. — done 2026-10-16: [ADR-003](decisions/adr-003-instruction-phrasing.md) picks word-bounded patterns that need a model addressee or an override over the substring list; `tests/detection.test.js` covers 13 phrasings caught, 5 ordinary sentences the old list flagged, and 3 known misses
- [x] **No network code in the shipped extension.** The demo-only `loadSampleData` (it calls `fetch`) moves out of `src/extension/popup.js` into the demo harness. A test fails if any file under `src/extension/` contains `fetch(`, `XMLHttpRequest`, `WebSocket`, `sendBeacon` or `EventSource`. — done 2026-10-20: the loader lives in `src/script.js` now, and `tests/manifest.test.js` scans every file under `src/extension/` for the five network APIs

## 🚦 Public release

- [x] `small` **CI.** `.github/workflows/ci.yml` runs `npm ci`, `npm run lint`, `npm test` (including the headless browser test) and `npm run build` on push to `main` and on every PR, with an explicit `permissions: contents: read` block, and the latest run on `main` is green. — 2026-10-22: `.github/workflows/ci.yml` added and green on its PR run; tick once the first run on `main` after merge is green — done 2026-10-26: the CI run on `main` at `60319dd` (the #11 merge) is green
- [x] `small` **README usage matches the code.** Every step in the README (load unpacked, scan, copy, build, test) was run against the real build and behaves as written. — done 2026-10-22: build, load unpacked, scan, copy, test, lint and the `file://` demo all run against `dist/extension/` and behave as written; the toolbar click was stood in for by calling `executeScript` from the loaded popup page, since headless Chromium has no toolbar
- [x] `small` **Security.** `SECURITY.md` says how to report a vulnerability. A full-history secret scan (`gitleaks detect --log-opts="--all"` or equivalent) comes back clean, and the command and result are recorded in the PR that ticks this box. — done 2026-10-22: `SECURITY.md` points at GitHub private vulnerability reporting; `gitleaks detect --log-opts="--all"` scanned 17 commits, no leaks found
- [x] `small` **Privacy policy.** `PRIVACY.md` states what the extension collects (nothing), what it stores (the last scan, in `chrome.storage.local`, on the device) and what it sends anywhere (nothing). The Chrome Web Store requires a policy URL, and this file is it. — done 2026-10-22: `PRIVACY.md` at the repo root
- [x] **Live demo at `https://ai-automation-tools.dev/cloakscan/`.** Served by GitHub Pages from this repo through an `actions/deploy-pages` workflow publishing `src/`. A visitor opens the mock browser, clicks Scan, and sees the six findings outlined on the fabricated article with nothing to install. The org source bar sits across the very top, its note saying this is a demo and its View source link pointing at `https://github.com/ai-automation-tools/cloakscan`. Safe to publish: the article is fabricated and names no real person or retailer. No personal data, no local paths, and no network request other than the page loading its own files. The README hero's Live Demo badge and nav links resolve to the Pages URL above the fold. — done 2026-10-26: `.github/workflows/pages.yml` deploys `src/`; the source bar is the first element of `src/index.html`; the README hero links the demo

## After public release

Nothing below blocks go-live.

### 🧩 Listing and launch (Slices 3 to 5)

- [x] **Store-ready package.** `npm run build` also writes `dist/cloakscan-<version>.zip` holding only the extension's files, with `manifest.json` at the zip root. A test checks the file list. No new runtime dependency. — done 2026-10-27: `scripts/build.js` writes `dist/cloakscan-0.1.0.zip` (9 files, `manifest.json` at the root) with Node's `zlib`; `tests/package.test.js` checks the file list and each file's bytes, and Python's `zipfile.testzip()` reads it clean
- [ ] `small` **Chrome Web Store submission kit.** `docs/store/` holds the listing copy (short and long description), the single-purpose statement, a justification for each of the three permissions, answers to the privacy-practices form, and at least two 1280x800 screenshots taken from the demo. Everything Mike has to paste into the developer dashboard, and nothing he has to write.
- [ ] Register the org's Chrome Web Store developer account ($5 one-time, per ADR-001; not Mike's personal account). 🔒 Needs Mike
- [ ] Submit the listing using `docs/store/` and see it through review. 🔒 Needs Mike
- [ ] Once the listing is live: an "Install from Chrome Web Store" badge in the README hero, and the org front door links the listing instead of the demo alone.
- [ ] Pick the launch channel (Show HN, dev.to, r/artificial, or the front door only) and publish one launch post with a real before/after scan. 🔒 Needs Mike
- [ ] Slice 5, post-launch fixes: triage every issue opened in the first four weeks after launch, and fix the ones that block normal use.
- [ ] 2027-03-22 check against the decision memo: under 100 installs despite a real launch means the distribution bet failed, and the ledger row moves to `rejected`. 🔒 Needs Mike

### 📣 Publish and promote

- [ ] Custom subdomain `cloakscan.ai-automation-tools.dev`. 🔒 Needs Mike

### 💰 Revenue

- [ ] Decide whether continuous scanning as a paid tier is worth scoping. Only if the 2027-03-22 check passes, and with its own ADR. 🔒 Needs Mike

### 🔭 Later

- [ ] Firefox build from the same source, loaded as a temporary add-on and passing the same fixture test. (A Should from the spec.)
- [ ] A shareable "page hygiene" report for teams auditing their own pages. Needs its own scoping note first, since a link implies hosting. (A Should from the spec.)

---

<p align="center">
  <a href="README.md">← Docs home</a> ·
  <a href="CHANGELOG.md">Changelog →</a>
</p>
