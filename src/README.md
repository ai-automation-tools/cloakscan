<h1 align="center">🧰 Source</h1>

<p align="center">
  <em>The Chrome extension, and the mock-browser demo that runs the same popup code.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/manifest-V3-4285F4?style=for-the-badge" alt="Manifest V3">
  <a href="../README.md"><img src="https://img.shields.io/badge/↩-repository_root-6B7280?style=for-the-badge" alt="Repository root"></a>
</p>

---

| Path | What it is |
|:---|:---|
| [**🧩 extension/**](extension/manifest.json) | The unpacked extension. `popup.js` runs the scan by injecting `content.js` into the active tab; `content.js` holds the six detectors and draws the outlines. `icons/` is the 16/32/48/128 px toolbar icon set, drawn by `scripts/icons.js`. |
| [**🖥️ index.html**](index.html) | The demo: a fake browser window around a fabricated review article with six pieces of hidden text planted in it. Opens straight from `file://`. |
| [**script.js**](script.js) | Demo harness only. Mounts the popup, fakes the outlining `content.js` would do on a real tab, and runs the light/dark switch (stored as `cloakscan.theme`). |
| [**sample-data.json**](sample-data.json) | The demo article and its expected scan result. `index.html` carries an inline copy for browsers that block `fetch` on `file://`. |
| [**style.css**](style.css) | Demo page styles, light and dark. The popup's own styles are in `extension/popup.css`; the demo's dark overrides for its popup panel live here, so the shipped popup is untouched. |

The demo shows the popup with a canned scan result rather than running `content.js`,
because there's no real tab to inject into. The shipped extension doesn't use
`sample-data.json` at all.

---

<p align="center">
  <a href="../README.md">← Repository home</a> ·
  <a href="../docs/README.md">Docs →</a>
</p>
