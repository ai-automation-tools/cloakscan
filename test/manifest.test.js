import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("src/extension/manifest.json", "utf8"));

test("manifest is Manifest V3 with a popup", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.action.default_popup, "popup.html");
});

test("manifest asks for activeTab, scripting and storage and nothing else", () => {
  assert.deepEqual([...manifest.permissions].sort(), ["activeTab", "scripting", "storage"]);
  for (const key of ["host_permissions", "optional_permissions", "optional_host_permissions", "content_scripts", "background"]) {
    assert.equal(manifest[key], undefined, `manifest must not declare ${key}`);
  }
});

test("toolbar icons exist at 16, 32, 48 and 128 px", () => {
  for (const icons of [manifest.icons, manifest.action.default_icon]) {
    assert.deepEqual(Object.keys(icons).sort(), ["128", "16", "32", "48"]);
    for (const [size, path] of Object.entries(icons)) {
      const png = readFileSync(`src/extension/${path}`);
      assert.equal(png.toString("latin1", 1, 4), "PNG", `${path} is not a PNG`);
      assert.equal(png.readUInt32BE(16), Number(size), `${path} width`);
      assert.equal(png.readUInt32BE(20), Number(size), `${path} height`);
    }
  }
});

test("popup copy advertises no paid tier or agent-block mode", () => {
  for (const file of ["src/extension/popup.html", "src/script.js"]) {
    const text = readFileSync(file, "utf8");
    assert.doesNotMatch(text, /\bPro\b|agent-block|continuous scanning/i, file);
  }
});
