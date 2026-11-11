<a id="store-top"></a>

<h1 align="center">🧩 Chrome Web Store kit</h1>

<p align="center">
  <em>Everything the developer dashboard asks for, ready to paste.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/account-ai--automation--tools-4285F4?style=for-the-badge" alt="Account: ai-automation-tools">
  <a href="../README.md"><img src="https://img.shields.io/badge/↩-docs_home-6B7280?style=for-the-badge" alt="Back to docs"></a>
</p>

---

The listing goes under the **ai-automation-tools** developer account, not a personal one
(ADR-001): reviews and install counts can't move between accounts later. Each block below
maps to one field in the dashboard, in the order the dashboard shows them. Text in a code
block is meant to be pasted as it stands.

## 📦 Package

Run `npm run build` and upload `dist/cloakscan-<version>.zip` (today
`dist/cloakscan-0.1.0.zip`). It holds only `src/extension/`, with `manifest.json` at the
root. Bump `version` in `src/extension/manifest.json` before every resubmission; the store
rejects a version it has already seen.

## 📝 Store listing tab

### Name

```text
CloakScan
```

### Summary

The manifest `description`, which the store shows as the summary. 132 characters at most.

```text
Scans the page you're on for text hidden from view, before you hand that page to an AI agent or paste it into a chatbot.
```

### Description

```text
Web pages can carry text meant for an AI model and hidden from the person reading them: white text on a white background, a block pushed thousands of pixels off-screen, a 1px font, an HTML comment, invisible zero-width characters. An agentic browser or a chatbot you paste the page into reads all of it. You read none of it.

CloakScan checks the tab you're on before you hand it over. Click the toolbar icon, then "Scan this page". Each piece of hidden text gets a dashed outline on the page and a plain-language entry in the popup saying what it is and what it says.

What it looks for:
- Color-matched text: text that's nearly the same color as its background
- Off-screen text: positioned far outside the visible page
- Shrunk-to-invisible text: a font of 1px or less, or a 1x1 box
- Hidden from screen readers: aria-hidden text addressed to an AI model or trying to override one
- HTML comments addressed to an AI model or trying to override one
- Zero-width characters tucked inside ordinary text

"Copy visible-only text" copies the page with every flagged part removed, so what you paste into a chatbot is only what you actually saw. "Export findings (JSON)" saves the findings to a file on your device.

Private by design:
- It runs only when you click it, and only on that tab.
- Permissions are activeTab, scripting and storage. No access to all sites, no background script.
- It makes no network requests. No account, no analytics, no tracking.
- The last scan is kept on your device so the popup can show it again; the next scan replaces it.

Checks for instruction-like phrasing are English only. Open source under the MIT license: https://github.com/ai-automation-tools/cloakscan
```

### Category and language

- Category: **Developer Tools**
- Language: **English**

### Graphic assets

| Field | File |
|:---|:---|
| Store icon, 128x128 | [`src/extension/icons/icon-128.png`](../../src/extension/icons/icon-128.png) |
| Screenshot 1, 1280x800 | [`screenshot-1-scan-light.png`](screenshot-1-scan-light.png): a scan of the demo article, six findings outlined |
| Screenshot 2, 1280x800 | [`screenshot-2-scan-dark.png`](screenshot-2-scan-dark.png): the same scan in the dark theme, the list scrolled to the last findings |

Both screenshots come from the demo in `src/index.html`, an invented review site. Retake
them with `node scripts/store-screenshots.js` when the popup or the demo changes. No promo
tile or marquee image is in the kit; the dashboard treats them as optional.

### Additional fields

| Field | Value |
|:---|:---|
| Official URL | none |
| Homepage URL | `https://cloakscan.ai-automation-tools.dev/` |
| Support URL | `https://github.com/ai-automation-tools/cloakscan/issues` |
| Mature content | No |

## 🔐 Privacy practices tab

### Single purpose

```text
CloakScan scans the page in the current tab, when the user clicks Scan, for text that is hidden from a human reader but readable by an AI agent, shows each finding on the page and in its popup, and can copy the page's visible text without the hidden parts.
```

### Permission justifications

#### activeTab

```text
Gives CloakScan access to the current tab only after the user clicks its toolbar icon, so it can read that one page when the user asks for a scan. It never gets standing access to any site.
```

#### scripting

```text
Used to run the scanning script in the current tab with chrome.scripting.executeScript when the user clicks Scan. The script reads the page's layout and text to find hidden content and draws outlines around what it finds. It is bundled with the extension and runs only on that click.
```

#### storage

```text
Keeps the result of the last scan (the findings, the page's visible text and the scan time) in chrome.storage.local, so the popup can show it again when reopened. It stays on the device, and the next scan replaces it.
```

### Remote code

```text
No, I am not using remote code.
```

All JavaScript ships inside the package. Nothing is fetched or evaluated at run time.

### Data usage

Tick **none** of the data categories. CloakScan collects and transmits nothing: no personally
identifiable information, health, financial, authentication, personal communications,
location, web history, user activity or website content. It reads the page only to scan it
on the device, and that never leaves the browser.

Tick all three certifications:

- I do not sell or transfer user data to third parties, outside of the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

### Privacy policy URL

```text
https://github.com/ai-automation-tools/cloakscan/blob/main/PRIVACY.md
```

## 🌍 Distribution tab

Free, public. Regions are Mike's call; nothing in the extension limits them.

<p align="right">(<a href="#store-top">back to top</a>)</p>

---

<p align="center">
  <a href="../README.md">← Docs home</a> ·
  <a href="../ROADMAP.md">Roadmap →</a>
</p>
