// Harness only. Renders the mock page, opens/closes the popup panel, and — where noted —
// fakes what extension/content.js would have done to a real page, since there's no live
// tab here for chrome.scripting to inject into.

async function loadData() {
  // extension/popup.js defines this loader (fetch, falling back to the inline
  // <script type="application/json"> block for file:// pages); reused here so
  // the harness and the popup never disagree about where the demo data lives.
  return window.__cloakscanLoadSampleData();
}

function renderMockPage(mockPage) {
  const article = document.getElementById("mock-page");
  article.innerHTML = mockPage.articleHtml;
  document.getElementById("url-bar").textContent = mockPage.url;
}

// Simulates content.js's on-page annotation step: a dashed outline plus a small red
// label dropped next to each hidden element it found. The real content script positions
// these with getBoundingClientRect against the live viewport; here a simpler inline badge
// does the same job against the mock article's own layout.
function annotateFindings(findings) {
  const article = document.getElementById("mock-page");
  article.querySelectorAll(".cs-mock-badge").forEach((el) => el.remove());
  article.querySelectorAll("[data-cs-flagged]").forEach((el) => {
    el.removeAttribute("data-cs-flagged");
    el.style.outline = "";
  });

  findings.forEach((f, i) => {
    if (!f.id) return; // html-comment findings have no element to point at
    const target = article.querySelector(`[data-finding-id="${f.id}"]`);
    if (!target) return;
    target.setAttribute("data-cs-flagged", "1");
    target.style.outline = "2px dashed #ef4444";
    target.style.outlineOffset = "2px";
    const badge = document.createElement("span");
    badge.className = "cs-mock-badge";
    badge.textContent = `hidden text #${i + 1}`;
    target.insertAdjacentElement("beforebegin", badge);
  });
}

function mountPopup(popupHtml) {
  const panel = document.getElementById("popup-panel");
  panel.innerHTML = popupHtml;
  window.initCloakScanPopup(document);
}

async function main() {
  const data = await loadData();
  renderMockPage(data.mockPage);

  const popupHtml = `
    <header class="cs-header">
      <span class="cs-mark" aria-hidden="true"></span>
      <div>
        <h1>CloakScan</h1>
        <p class="cs-sub">Hidden-instruction scanner</p>
      </div>
    </header>
    <button id="cs-scan-btn" class="cs-scan-btn" type="button">Scan this page</button>
    <p id="cs-status" class="cs-status">Not scanned yet</p>
    <p id="cs-summary" class="cs-summary"></p>
    <ul id="cs-findings" class="cs-findings"></ul>
    <button id="cs-copy-btn" class="cs-copy-btn" type="button" disabled>Copy visible-only text</button>
    <p class="cs-footnote">Free: manual scans on the tab you're viewing. Pro: continuous scanning + agent-block mode.</p>
  `;

  const toolbarBtn = document.getElementById("toolbar-btn");
  const panel = document.getElementById("popup-panel");
  let mounted = false;

  toolbarBtn.addEventListener("click", () => {
    if (!mounted) {
      mountPopup(popupHtml);
      mounted = true;
    }
    panel.hidden = !panel.hidden;
  });

  document.addEventListener("cloakscan:scanned", (event) => {
    annotateFindings(event.detail.findings);
  });
}

main();
