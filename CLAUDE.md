# CLAUDE.md

Standing orders for the agent that works this repo, usually the weekly roadmap routine.

## What CloakScan is

A Chrome extension (Manifest V3) that scans the tab you're on for text hidden from a human
reader but readable by an AI agent or a copy-paste into a chatbot. Click the toolbar icon,
click Scan, and it outlines each finding on the page and lists it in plain language. Six
detectors: color-matched text, off-screen positioning, shrunk-to-invisible sizing,
aria-hidden elements with instruction-like phrasing, HTML comments with instruction-like
phrasing, and zero-width Unicode. A "copy visible-only text" button strips the flagged
content and copies the rest.

The detection logic already works; it came over from the prototype. The bet under the
project is distribution: whether the org's own channel can get this past the ~23 installs
that two earlier tools doing the same thing stalled at. So the roadmap is mostly about
making the tool verifiable, listable and demoable, not about new detectors.

Full spec: `docs/product/spec.md`. Slice order: `docs/product/build-plan.md`. Work queue:
`docs/ROADMAP.md`.

## Stack

- Plain JavaScript, no framework, no bundler, no TypeScript. Chrome loads the extension
  files exactly as they sit in `src/extension/`. **npm** for dev tooling only.
- `src/extension/` is the extension: `manifest.json`, `popup.html/css/js`, and
  `content.js`, which `popup.js` injects with `chrome.scripting.executeScript` on click.
  `content.js` is a single IIFE whose return value is the scan result. Keep it that way:
  `executeScript` hands that value back to the popup.
- `src/index.html`, `script.js`, `style.css` and `sample-data.json` are the demo. It
  loads `extension/popup.js` itself, so the popup code is shared. `popup.js` tells the two
  hosts apart with its `inExtension` check.
- `scripts/build.js` copies `src/extension/` to `dist/extension/`. `scripts/icons.js` redraws
  the committed PNGs in `src/extension/icons/`; run it by hand only when the icon changes.
- Tests: `node:test` and `node:assert/strict`, files in `test/*.test.js`. The detectors
  need real layout, so detection tests run in headless Chromium through Playwright, not
  jsdom. No Jest, no Vitest.
- Lint: ESLint 9 flat config. `src/**` is browser + webextensions script code;
  `scripts/`, `test/` and the config are Node ESM.

## Verify

Run all three from the repo root. All three must pass before a PR opens.

```
npm run lint
npm test
npm run build
```

## Architecture decisions that are already made

- **ADR-001: the listing goes under the org's Chrome Web Store developer account**, not
  Mike's personal one. Reviews and install counts can't move between accounts later.
  Registering and submitting is Mike's job; preparing everything he needs is yours.
- **ADR-002: no telemetry.** The extension makes no network calls, ever. Not usage pings,
  not error reports, not an update check. Install counts come from the store dashboard.

## Invariants

- **Permissions are `activeTab`, `scripting`, `storage` and nothing else.** No
  `host_permissions`, no `<all_urls>`, no `content_scripts` in the manifest, no background
  service worker that watches tabs. This is the product's main trust signal.
- **No network code under `src/extension/`.** No `fetch`, `XMLHttpRequest`, `WebSocket`,
  `sendBeacon`, `EventSource`, or remote script or font. (One demo-only `fetch` still sits
  in `popup.js`; a roadmap item moves it out.) The demo may load its own same-origin files.
- **The demo works from `file://` with no server**, and on GitHub Pages.
- Scans finish within 2 seconds on a page of about 5,000 DOM nodes.
- A clean page gives zero findings. A false positive on an ordinary article is a bug.

## Won't (this version)

Carried from the spec. If a roadmap item seems to need one of these, stop and flag it.

- **Screenshot or rendered-pixel detection.** DOM only.
- **"Pause the agent" or any hook into an agentic browser.** No such API exists.
- **Continuous or automatic background scanning, and any paid tier.** Scans happen on
  click. Remove copy that advertises "Pro"; never add it.
- **Non-English instruction phrasing** in the aria-hidden and comment checks.
- **Telemetry of any kind** (ADR-002).

## Standards

- No runtime dependencies. The extension ships as hand-written files. A new dev
  dependency needs a line in the PR body saying why.
- Every detector change comes with a fixture case it catches and, where there's a known
  limit, one it misses on purpose.
- Fixture and demo pages are fabricated. No real person's name, no real retailer, no
  copied third-party article.
- This repo goes public at graduation. Never commit `.env*`, tokens, real personal data,
  or local paths like `C:\Users\...` or `D:\...`.
- Commit messages: plain imperative sentences ("Add the fixture detection test"), no
  Conventional Commit prefixes.

## What "done" means for a roadmap item

1. The item's own text is true of the code, checked by running it.
2. `npm run lint`, `npm test` and `npm run build` pass, and new behavior has a test.
3. Anything the change made untrue is fixed: `README.md`, `src/README.md`, `docs/`, this
   file.
4. `docs/CHANGELOG.md` has a line for it under `## Unreleased`, tagged with the roadmap
   phase in italics, in the same commit that flips the box to `- [x]` with a dated note.
5. It's on a `roadmap/auto-<date>` branch with a PR into `main`. Never push to `main`.
