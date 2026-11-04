import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const kit = readFileSync("docs/store/README.md", "utf8").replace(/\r\n/g, "\n");
const manifest = JSON.parse(readFileSync("src/extension/manifest.json", "utf8"));

// The first ```text block after a heading line, i.e. what Mike pastes into that field.
function pasteBlock(heading) {
  const at = kit.indexOf(`\n${heading}\n`);
  assert.ok(at >= 0, `kit has a "${heading}" heading`);
  const match = kit.slice(at).match(/```text\n([\s\S]*?)\n```/);
  assert.ok(match, `"${heading}" has a text block to paste`);
  return match[1];
}

test("store kit summary is the manifest description and fits the store's 132 characters", () => {
  assert.equal(pasteBlock("### Summary"), manifest.description);
  assert.ok(manifest.description.length <= 132, `${manifest.description.length} characters`);
});

test("store kit justifies every manifest permission and no other", () => {
  const justified = [...kit.matchAll(/^#### (\S+)$/gm)].map((m) => m[1]);
  assert.deepEqual(justified.sort(), [...manifest.permissions].sort());
  for (const permission of manifest.permissions) {
    assert.ok(pasteBlock(`#### ${permission}`).length > 40, `${permission} justification`);
  }
});

test("store kit holds at least two 1280x800 PNG screenshots", () => {
  const shots = readdirSync("docs/store").filter((f) => f.endsWith(".png"));
  assert.ok(shots.length >= 2, `found ${shots.length}`);
  for (const shot of shots) {
    const png = readFileSync(`docs/store/${shot}`);
    assert.equal(png.toString("latin1", 1, 4), "PNG", `${shot} is a PNG`);
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1280, 800], `${shot} size`);
    assert.ok(kit.includes(`(${shot})`), `${shot} is listed in the kit`);
  }
});
