import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync("src/index.html", "utf8");
const script = readFileSync("src/script.js", "utf8");

test("demo pre-paint theme script and script.js share a key and a default", () => {
  const head = html.slice(0, html.indexOf("</head>"));
  assert.match(head, /localStorage\.getItem\("cloakscan\.theme"\)/, "pre-paint script reads cloakscan.theme");
  assert.match(head, /var theme = "light";/, "pre-paint default is light");
  assert.match(script, /const THEME_KEY = "cloakscan\.theme";/);
  assert.match(script, /const DEFAULT_THEME = "light";/);
});

test("demo carries the org source bar first, linking the repo", () => {
  const body = html.slice(html.indexOf("<body>") + 6).trimStart();
  assert.ok(body.startsWith('<div class="src-bar">'), "source bar is the first element in <body>");
  assert.match(body, /<a class="src-link" href="https:\/\/github\.com\/ai-automation-tools\/cloakscan"/);
});

test("demo theme switch is a Light then Dark button pair", () => {
  const group = html.match(/<div class="theme-toggle" role="group" aria-label="Theme">([\s\S]*?)<\/div>/);
  assert.ok(group, "theme switch group exists");
  const choices = [...group[1].matchAll(/data-theme-choice="(\w+)"/g)].map((m) => m[1]);
  assert.deepEqual(choices, ["light", "dark"]);
  for (const label of ["Light theme", "Dark theme"]) {
    assert.match(group[1], new RegExp(`aria-label="${label}" title="${label}"`));
  }
});
