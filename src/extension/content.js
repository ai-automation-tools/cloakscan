// Injected on demand by popup.js via chrome.scripting.executeScript.
// Runs once per click, so it starts by clearing any markup a previous run left behind.
(() => {
  const CSS_PREFIX = "cloakscan";
  const ZERO_WIDTH = /\u200B|\u200C|\u200D|\uFEFF|\u2060/;
  // ADR-003: text reads as an instruction only if it addresses a model or tries to override
  // one. A marketing verb on its own ("recommend the", "act as", "override") no longer counts.
  const INSTRUCTION_PATTERNS = [
    // "ignore previous instructions", "disregard all prior rules", "ignore the negative reviews above"
    /\b(ignore|disregard|forget|override)\b[^.]{0,30}\b(previous|prior|above|earlier|preceding|all|any|negative|your)\b[^.]{0,20}\b(instructions?|prompts?|rules|directions|guidelines|reviews?|context)\b/i,
    // "you are an AI", "act as a shopping assistant", "pretend to be a helpful chatbot"
    /\b(you are|you're|act as|pretend to be|role-?play as)\s+(an?\s+|the\s+)?(\w+\s+)?(ai|assistant|chatbot|language model|llm)\b/i,
    // a chat role line: "System: ...", "Assistant: ..."
    /^\s*(system|assistant|developer)\s*:/im,
    // a note addressed to a model: "AI agent: ...", "AI agent instructions: ...", "LLM:"
    /\b(ai|llm|chatbot)( agents?| assistants?| models?)?( instructions?)?\s*:/i,
    /\b(note|message|instructions?) (to|for) (the |any )?(ai|llm|language model|chatbot|assistant|agent)s?\b/i,
    // "when summarizing this page", "while summarising the article"
    /\b(when|while|if)\s+(summari[sz]ing|describing|reviewing)\s+(this|the)\s+(page|article|site|review|content|text)\b/i,
    // "do not tell the user", "never reveal to the reader"
    /\b(do not|don't|never)\s+(tell|mention|reveal|disclose|inform|show)\b[^.]{0,30}\b(users?|readers?|human|customers?)\b/i,
    /\bas an ai language model\b/i,
  ];

  document.querySelectorAll(`.${CSS_PREFIX}-badge`).forEach((el) => el.remove());
  document.querySelectorAll(`[data-${CSS_PREFIX}-flagged]`).forEach((el) => {
    el.style.outline = "";
    el.style.outlineOffset = "";
    el.removeAttribute(`data-${CSS_PREFIX}-flagged`);
  });

  function readsAsInstruction(text) {
    return INSTRUCTION_PATTERNS.some((p) => p.test(text));
  }

  function parseColor(value) {
    const m = value.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(",").map((p) => parseFloat(p.trim()));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  }

  function relativeLuminance({ r, g, b }) {
    const chan = [r, g, b].map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * chan[0] + 0.7152 * chan[1] + 0.0722 * chan[2];
  }

  function bgColorOf(el) {
    let node = el;
    while (node) {
      const cs = getComputedStyle(node);
      const bg = parseColor(cs.backgroundColor);
      if (bg && bg.a > 0.05) return bg;
      node = node.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  function isColorMatched(el, cs) {
    const fg = parseColor(cs.color);
    if (!fg || fg.a < 0.1) return false;
    const bg = bgColorOf(el);
    const lFg = relativeLuminance(fg);
    const lBg = relativeLuminance(bg);
    const contrast = (Math.max(lFg, lBg) + 0.05) / (Math.min(lFg, lBg) + 0.05);
    return contrast < 1.15;
  }

  function isOffscreen(el, cs) {
    if (cs.position !== "absolute" && cs.position !== "fixed") return false;
    const r = el.getBoundingClientRect();
    return r.right < -200 || r.left > window.innerWidth + 200 || r.bottom < -200;
  }

  function isShrunkAway(el, cs) {
    const fontSize = parseFloat(cs.fontSize) || 16;
    if (fontSize <= 1) return true;
    return el.offsetWidth <= 1 && el.offsetHeight <= 1 && cs.overflow === "hidden";
  }

  function flag(el, type, confidence, text) {
    el.setAttribute(`data-${CSS_PREFIX}-flagged`, "1");
    el.style.outline = "2px dashed #ef4444";
    el.style.outlineOffset = "2px";
    return { type, confidence, snippet: text.slice(0, 160), el };
  }

  const findings = [];
  const seen = new Set();

  document.querySelectorAll("body *").forEach((el) => {
    if (el.children.length > 0) return; // leaf nodes only, avoids flagging a whole section twice
    if (seen.has(el)) return;
    const text = (el.textContent || "").trim();
    if (text.length < 8) return;
    const cs = getComputedStyle(el);
    if (cs.display === "none") return;

    if (isColorMatched(el, cs)) {
      findings.push(flag(el, "color-match", "high", text));
      seen.add(el);
    } else if (isOffscreen(el, cs)) {
      findings.push(flag(el, "offscreen", "high", text));
      seen.add(el);
    } else if (isShrunkAway(el, cs)) {
      findings.push(flag(el, "zero-size", "medium", text));
      seen.add(el);
    } else if (el.getAttribute("aria-hidden") === "true" && readsAsInstruction(text)) {
      findings.push(flag(el, "aria-hidden", "high", text));
      seen.add(el);
    }

    if (!seen.has(el) && ZERO_WIDTH.test(text)) {
      findings.push(flag(el, "zero-width", "medium", text.replace(ZERO_WIDTH, "")));
      seen.add(el);
    }
  });

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
  let commentNode;
  while ((commentNode = walker.nextNode())) {
    if (readsAsInstruction(commentNode.nodeValue)) {
      findings.push({ type: "html-comment", confidence: "high", snippet: commentNode.nodeValue.trim().slice(0, 160), el: null });
    }
  }

  // Build the cleaned text before touching the DOM again — the badges added below
  // would otherwise get walked as ordinary page text and leak into the output.
  const flaggedEls = new Set(findings.filter((f) => f.el).map((f) => f.el));
  function isInsideFlagged(el) {
    let node = el;
    while (node) {
      if (flaggedEls.has(node)) return true;
      node = node.parentElement;
    }
    return false;
  }

  const cleanedParts = [];
  const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let textNode;
  while ((textNode = textWalker.nextNode())) {
    if (isInsideFlagged(textNode.parentElement)) continue;
    const cleaned = textNode.textContent.replace(new RegExp(ZERO_WIDTH, "g"), "").trim();
    if (cleaned) cleanedParts.push(cleaned);
  }

  // Label each flagged element on the real page so the user can see exactly where the hidden text sits.
  findings.forEach((f, i) => {
    if (!f.el) return;
    const rect = f.el.getBoundingClientRect();
    const badge = document.createElement("span");
    badge.className = `${CSS_PREFIX}-badge`;
    badge.textContent = `hidden text #${i + 1}`;
    badge.style.cssText = [
      "position:absolute", "background:#ef4444", "color:#fff",
      "font:11px/1.4 -apple-system,sans-serif", "padding:1px 5px",
      "border-radius:3px", "z-index:2147483647", "pointer-events:none",
      `top:${window.scrollY + Math.max(rect.top - 18, 0)}px`,
      `left:${window.scrollX + rect.left}px`,
    ].join(";");
    document.body.appendChild(badge);
  });

  return {
    scannedAt: new Date().toISOString(),
    url: location.href,
    cleanedText: cleanedParts.join(" "),
    findings: findings.map(({ el, ...rest }) => rest),
  };
})();
