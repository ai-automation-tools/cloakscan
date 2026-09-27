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
