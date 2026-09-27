// Shared by the real popup (extension/popup.html) and the demo harness (../index.html).
// inExtension tells us which host we're in — every chrome.* call is guarded by it.
const inExtension = typeof chrome !== "undefined" && !!chrome?.scripting && !!chrome?.tabs;

// Demo-only: sample-data.json first, falling back to the inline copy in index.html
// for browsers that block fetch() on file:// pages.
async function loadSampleData() {
  try {
    const res = await fetch("sample-data.json");
    if (res.ok) return await res.json();
  } catch {
    // fall through to inline fallback
  }
  const inline = document.getElementById("cloakscan-sample-data");
  return inline ? JSON.parse(inline.textContent) : { mockPage: null, scanResult: { findings: [], cleanedText: "" } };
}
window.__cloakscanLoadSampleData = loadSampleData;

const LABELS = {
  "color-match": "Color-matched text",
  offscreen: "Positioned off-screen",
  "zero-size": "Shrunk to invisible",
  "aria-hidden": "Hidden from screen readers",
  "html-comment": "Hidden in an HTML comment",
  "zero-width": "Zero-width characters",
};

function initCloakScanPopup(root = document) {
  const scanBtn = root.getElementById("cs-scan-btn");
  const copyBtn = root.getElementById("cs-copy-btn");
  const statusEl = root.getElementById("cs-status");
  const summaryEl = root.getElementById("cs-summary");
  const listEl = root.getElementById("cs-findings");

  if (!scanBtn) return; // markup not mounted yet (demo panel starts closed)

  let lastResult = null;

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function riskClass(count) {
    if (count === 0) return "clear";
    if (count <= 2) return "caution";
    return "high";
  }

  function render(result) {
    lastResult = result;
    const { findings } = result;
    summaryEl.textContent = findings.length === 0
      ? "Nothing hidden found"
      : `${findings.length} hidden instruction${findings.length === 1 ? "" : "s"} found`;
    summaryEl.className = `cs-summary ${riskClass(findings.length)}`;

    listEl.innerHTML = "";
    findings.forEach((f) => {
      const li = document.createElement("li");
      li.className = `cs-finding confidence-${f.confidence}`;
      li.innerHTML = `<span class="cs-tag">${LABELS[f.type] || f.type}</span><p>"${escapeHtml(f.snippet)}"</p>`;
      listEl.appendChild(li);
    });

    copyBtn.disabled = !result.cleanedText;
    statusEl.textContent = `Scanned at ${new Date(result.scannedAt).toLocaleTimeString()}`;
  }

  async function scanExtension() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
    await chrome.storage.local.set({ cloakscanLastResult: result });
    render(result);
  }

  async function scanDemo() {
    const data = await loadSampleData();
    const result = { ...data.scanResult, scannedAt: new Date().toISOString() };
    render(result);
    // The real extension would have just modified the live page via content.js.
    // Here we tell the harness to fake that same effect on the mock page below.
    document.dispatchEvent(new CustomEvent("cloakscan:scanned", { detail: result }));
  }

  scanBtn.addEventListener("click", async () => {
    scanBtn.disabled = true;
    statusEl.textContent = "Scanning…";
    try {
      await (inExtension ? scanExtension() : scanDemo());
    } catch (err) {
      statusEl.textContent = "Scan failed — reload the page and try again";
      console.error("CloakScan scan failed", err);
    } finally {
      scanBtn.disabled = false;
    }
  });

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // fall through to the execCommand fallback below
      }
    }
    if (typeof document.execCommand !== "function") return false;
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    textarea.remove();
    return ok;
  }

  copyBtn.addEventListener("click", async () => {
    if (!lastResult?.cleanedText) return;
    const ok = await copyText(lastResult.cleanedText);
    const original = copyBtn.textContent;
    copyBtn.textContent = ok ? "Copied" : "Copy failed — select manually";
    setTimeout(() => { copyBtn.textContent = original; }, 1200);
  });

  if (inExtension) {
    chrome.storage.local.get("cloakscanLastResult").then(({ cloakscanLastResult }) => {
      if (cloakscanLastResult) render(cloakscanLastResult);
    });
  }
}

if (inExtension) {
  document.addEventListener("DOMContentLoaded", () => initCloakScanPopup(document));
} else if (typeof window !== "undefined") {
  // The demo harness mounts the popup markup dynamically, then calls this itself.
  window.initCloakScanPopup = initCloakScanPopup;
}
