# Upstreams

Every external platform, tool, and service CloakScan depends on, what the code assumes about
each, and where to check whether that assumption still holds. The biweekly **CloakScan Upstream
Check** routine (`upstream/auto-*` PRs) works from this file. Keep it current by hand too: a new
API call is a new row.

The shipped extension makes no network requests (ADR-002), so it has no web service upstream:
its upstreams are the browser's extension platform and the tooling that tests and publishes it.

**Last checked** is filled in by the routine, and only with a date it actually read the
source. `—` means never checked.

## Extension platform

| Upstream | What the code assumes | Code | Check at | Last checked |
|:---|:---|:---|:---|:---|
| **Chrome Manifest V3** | `manifest_version: 3`; `action.default_popup`; `permissions` of exactly `activeTab`, `scripting`, `storage`; no `host_permissions`, `content_scripts` or `background` | `src/extension/manifest.json`, `scripts/build.js`, `tests/manifest.test.js` | developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3; developer.chrome.com/docs/extensions/reference/manifest | — |
| **`chrome.scripting.executeScript`** | Injects `content.js` into the active tab, an IIFE whose return value comes back in `result` | `src/extension/popup.js`, `src/extension/content.js`, `tests/detection.test.js` | developer.chrome.com/docs/extensions/reference/api/scripting | — |
| **`activeTab` permission** | A click on the toolbar icon grants temporary access to the current tab, enough for `executeScript` with no host permission | `src/extension/manifest.json`, `src/extension/popup.js` | developer.chrome.com/docs/extensions/develop/concepts/activeTab | — |
| **`chrome.tabs.query` / `chrome.storage.local`** | `tabs.query({ active: true, currentWindow: true })` needs no `tabs` permission for the id; `storage.local` `get`/`set` keeps the last scan | `src/extension/popup.js` | developer.chrome.com/docs/extensions/reference/api/tabs; developer.chrome.com/docs/extensions/reference/api/storage | — |
| **Chrome Web Store policies** | The store package is on the roadmap; `PRIVACY.md` says nothing is collected or sent, and the listing will link it | `PRIVACY.md`, `docs/ROADMAP.md` | developer.chrome.com/docs/webstore/program-policies | — |

## Test and build tooling

| Upstream | What the code assumes | Code | Check at | Last checked |
|:---|:---|:---|:---|:---|
| **Playwright + headless Chromium** | `playwright` `^1.63.0` as a dev dependency; `tests/detection.test.js` drives `chromium` with real layout; CI runs `npx playwright install --with-deps chromium` | `package.json`, `tests/detection.test.js`, `.github/workflows/ci.yml` | github.com/microsoft/playwright/releases; playwright.dev/docs/release-notes | — |
| **Node.js** | `engines.node: ">=22"`; CI pins Node 22; tests run on `node --test` | `package.json`, `.github/workflows/ci.yml` | nodejs.org/en/about/previous-releases; raw.githubusercontent.com/nodejs/Release/main/schedule.json | — |
| **ESLint 9 (flat config) + `globals`** | `eslint` and `@eslint/js` `^9.39.5`, `globals` `^17.12.0`, config in `eslint.config.js` | `package.json`, `eslint.config.js` | eslint.org/blog; github.com/eslint/eslint/releases | — |

## Hosting and CI

| Upstream | What the code assumes | Code | Check at | Last checked |
|:---|:---|:---|:---|:---|
| **GitHub Pages (workflow deploys)** | `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4` publish `src/` as it sits; custom domain `cloakscan-demo.ai-automation-tools.dev` | `.github/workflows/pages.yml` | github.com/actions/deploy-pages/releases; docs.github.com/en/pages | — |
| **GitHub Actions** | `actions/checkout@v4`, `actions/setup-node@v4` on `ubuntu-latest` | `.github/workflows/ci.yml`, `.github/workflows/pages.yml` | github.com/actions/setup-node/releases; github.com/actions/checkout/releases | — |

Flag breaking majors, EOL runtimes, and security advisories only. Routine bumps are
Dependabot's job.
