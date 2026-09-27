<h1 align="center">🗺️ CloakScan Roadmap</h1>

<p align="center">
  <em>Everything between a working prototype and a public, demoable CloakScan, in the order it has to happen.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/stage-incubating-F59E0B?style=for-the-badge" alt="Stage: incubating">
  <a href="README.md"><img src="https://img.shields.io/badge/↩-docs-6B7280?style=for-the-badge" alt="Docs home"></a>
</p>

---

One item per weekly run. Take the first open box from the top. Every item above
[After public release](#after-public-release) is a release gate: CloakScan goes public
when all of them read `- [x]`.

Markers: `- [ ]` open · `- [-]` claimed by a run in progress · `- [x]` done ·
`- [!]` blocked, reason on the line · `🔒 Needs Mike` only Mike can do it.

The slices come from [product/build-plan.md](product/build-plan.md). Slice 0, the
prototype, is already in `src/`. The Chrome Web Store listing (Slice 3) and the launch
(Slice 4) sit below the release line: both need Mike's account and money, and the repo
plus its demo can go public without them. What the gates do include is everything the
listing needs, so submitting it is a paste job.

## 🔨 Build

- [ ] **Slice 1a: trim the prototype to the spec.** The popup footnote stops advertising a Pro tier and an agent-block mode (both on the spec's Won't list), in `src/extension/popup.html` and in the demo's copy of the popup markup in `src/script.js`. The manifest gets a 16/32/48/128 px icon set under `src/extension/icons/` and an `action.default_icon`. `test/manifest.test.js` fails if the manifest declares any permission other than `activeTab`, `scripting` and `storage`, or any `host_permissions` or `content_scripts` entry.
- [ ] **Slice 1b: fixture detection test in a real browser.** A headless Chromium test (Playwright as a dev dependency) loads a fixture page carrying one planted example of each of the six techniques, injects `src/extension/content.js`, and asserts all six come back with the right `type`. jsdom won't do here: the detectors read computed styles and layout boxes, which jsdom doesn't calculate. `npm test` runs it.
- [ ] **Slice 1c: copy-visible-only and scan latency.** Tests assert the fixture scan's `cleanedText` contains none of the six planted strings and no zero-width characters, and that a scan of a generated page of about 5,000 DOM nodes finishes in under 2 seconds.
- [ ] **Decide how the aria-hidden check spots instruction-like text.** The spec's open question, due before the public release. Write `docs/decisions/adr-003-instruction-phrasing.md` comparing the current hand-written keyword list with at least one alternative, pick one, and implement it with tests for phrasings it catches and ones it knowingly misses. English only, per the spec.
- [ ] **No network code in the shipped extension.** The demo-only `loadSampleData` (it calls `fetch`) moves out of `src/extension/popup.js` into the demo harness. A test fails if any file under `src/extension/` contains `fetch(`, `XMLHttpRequest`, `WebSocket`, `sendBeacon` or `EventSource`.
- [ ] **Store-ready package.** `npm run build` also writes `dist/cloakscan-<version>.zip` holding only the extension's files, with `manifest.json` at the zip root. A test checks the file list. No new runtime dependency.

## 🚦 Public release

- [ ] **CI.** `.github/workflows/ci.yml` runs `npm ci`, `npm run lint`, `npm test` (including the headless browser test) and `npm run build` on push to `main` and on every PR, with an explicit `permissions: contents: read` block, and the latest run on `main` is green.
- [ ] **README usage matches the code.** Every step in the README (load unpacked, scan, copy, build, test) was run against the real build and behaves as written.
- [ ] **Security.** `SECURITY.md` says how to report a vulnerability. A full-history secret scan (`gitleaks detect --log-opts="--all"` or equivalent) comes back clean, and the command and result are recorded in the PR that ticks this box.
- [ ] **Privacy policy.** `PRIVACY.md` states what the extension collects (nothing), what it stores (the last scan, in `chrome.storage.local`, on the device) and what it sends anywhere (nothing). The Chrome Web Store requires a policy URL, and this file is it.
- [ ] **Chrome Web Store submission kit.** `docs/store/` holds the listing copy (short and long description), the single-purpose statement, a justification for each of the three permissions, answers to the privacy-practices form, and at least two 1280x800 screenshots taken from the demo. Everything Mike has to paste into the developer dashboard, and nothing he has to write.
- [ ] **Live demo at `https://ai-automation-tools.dev/cloakscan/`.** Served by GitHub Pages from this repo through an `actions/deploy-pages` workflow publishing `src/`. A visitor opens the mock browser, clicks Scan, and sees the six findings outlined on the fabricated article with nothing to install. The org source bar sits across the very top, its note saying this is a demo and its View source link pointing at `https://github.com/ai-automation-tools/cloakscan`.
- [ ] **Demo is safe to publish.** The article is fabricated and names no real person or retailer. No personal data, no local paths, and no network request other than the page loading its own files.
- [ ] **README hero points at the demo.** The Live Demo badge and nav links resolve to the Pages URL above the fold.

## After public release

These don't block graduation.

### 🧩 Listing and launch (Slices 3 to 5)

- [ ] Register the org's Chrome Web Store developer account ($5 one-time, per ADR-001; not Mike's personal account). 🔒 Needs Mike
- [ ] Submit the listing using `docs/store/` and see it through review. 🔒 Needs Mike
- [ ] Once the listing is live: an "Install from Chrome Web Store" badge in the README hero, and the org front door links the listing instead of the demo alone.
- [ ] Pick the launch channel (Show HN, dev.to, r/artificial, or the front door only) and publish one launch post with a real before/after scan. 🔒 Needs Mike
- [ ] Slice 5, post-launch fixes: triage every issue opened in the first four weeks after launch, and fix the ones that block normal use.
- [ ] 2027-03-22 check against the decision memo: under 100 installs despite a real launch means the distribution bet failed, and the ledger row moves to `rejected`. 🔒 Needs Mike

### 🔭 Should, from the spec

- [ ] Firefox build from the same source, loaded as a temporary add-on and passing the same fixture test.
- [ ] A shareable "page hygiene" report for teams auditing their own pages. Needs its own scoping note first, since a link implies hosting.

### 📣 Publish & promote

- [ ] Custom subdomain `cloakscan.ai-automation-tools.dev`. 🔒 Needs Mike

### 💰 Monetize

- [ ] Decide whether continuous scanning as a paid tier is worth scoping. Only if the 2027-03-22 check passes, and with its own ADR. 🔒 Needs Mike

---

<p align="center">
  <a href="README.md">← Docs home</a> ·
  <a href="CHANGELOG.md">Next: Changelog →</a>
</p>
