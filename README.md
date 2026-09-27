<a id="readme-top"></a>

<h1 align="center">🕵️ CloakScan</h1>

<p align="center">
  <em>Checks the page you're on for text you can't see<br>but the AI agent reading it can.</em>
</p>

<p align="center">
  <a href="docs/README.md"><strong>Explore the docs »</strong></a>
</p>

<p align="center">
  <a href="docs/ROADMAP.md">Roadmap</a>
  ·
  <a href="https://github.com/ai-automation-tools/cloakscan/issues">Report Bug</a>
  ·
  <a href="https://github.com/ai-automation-tools/cloakscan/issues">Request Feature</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-MVP_Prototype-F59E0B?style=for-the-badge" alt="Status: MVP prototype">
  <a href="docs/ROADMAP.md"><img src="https://img.shields.io/badge/plan-ROADMAP-8B5CF6?style=for-the-badge" alt="Roadmap"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2ea44f?style=for-the-badge" alt="License: MIT"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Manifest_V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome Manifest V3">
  <img src="https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="Vanilla JavaScript">
  <img src="https://img.shields.io/badge/permissions-activeTab_·_scripting_·_storage-6B7280?style=flat-square" alt="Permissions: activeTab, scripting, storage">
  <img src="https://img.shields.io/badge/network_calls-none-2ea44f?style=flat-square" alt="No network calls">
</p>

---

> [!WARNING]
> **Not in the Chrome Web Store yet.** This is the working prototype, loadable unpacked.
> Tests for the detectors, the store package, and the public demo are next on the
> [roadmap](docs/ROADMAP.md).

## 💡 What it's for

If you hand pages to an agentic browser or paste them into a chatbot, the page can carry
instructions meant for the model and hidden from you: white text on a white background, a
div parked 9,999 pixels off-screen, a 1px font, an HTML comment. Brave showed attackers
doing exactly this to Perplexity's Comet. CloakScan reads the tab you're on, outlines each
piece of hidden text on the page, and lists what it found in plain language. Then it can
copy the page's visible text with the hidden parts stripped, so you paste only what you
actually read.

It runs when you click it and at no other time. There's no `host_permissions` entry, no
background script, and nothing leaves your browser.

## 📊 What it detects

| Technique | How it's spotted |
|:---|:---|
| **Color-matched text** | Contrast between the text and its nearest background under 1.15:1 |
| **Off-screen positioning** | Absolutely or fixed-positioned and more than 200px outside the viewport |
| **Shrunk to invisible** | Font size of 1px or less, or a 1x1 box with overflow hidden |
| **Hidden from screen readers** | `aria-hidden="true"` on text that reads like an instruction |
| **HTML comments** | Comments whose text reads like an instruction |
| **Zero-width characters** | U+200B, U+200C, U+200D, U+FEFF or U+2060 inside ordinary text |

## 🚀 Quick start

```bash
# 1. Install dev dependencies (Node 22 or newer)
npm install

# 2. Copy the extension into dist/extension/
npm run build

# 3. In Chrome: chrome://extensions, turn on Developer mode, Load unpacked, pick dist/extension/

# 4. Tests and lint
npm test && npm run lint
```

To try it without installing anything, open `src/index.html` in a browser, click the
CloakScan icon in the mock toolbar, then **Scan this page**.

## 🗂️ What's in here

| Folder | What's inside |
|:---|:---|
| [**🧰 src/**](src/README.md) | The extension and the demo page. |
| [**📚 docs/**](docs/README.md) | The roadmap, the changelog, and the product spec and build plan. |
| [**🧪 test/**](test/manifest.test.js) | Tests for `node --test`. |
| [**🤖 CLAUDE.md**](CLAUDE.md) | Standing orders for the agent that works the roadmap each week. |

---

<p align="center">
  Built with plain JavaScript on <a href="https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3">Manifest V3</a> · <a href="docs/README.md">Docs</a> · <a href="LICENSE">MIT License</a>
</p>

<p align="right">(<a href="#readme-top">back to top</a>)</p>
