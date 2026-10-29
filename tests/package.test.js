import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

// Reads a zip through its central directory, the way the Chrome Web Store does.
function unzip(zip) {
  const end = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  assert.ok(end >= 0, "zip has an end-of-central-directory record");
  const count = zip.readUInt16LE(end + 10);
  let at = zip.readUInt32LE(end + 16);
  const files = new Map();
  for (let i = 0; i < count; i++) {
    assert.equal(zip.readUInt32LE(at), 0x02014b50, "central directory entry");
    const size = zip.readUInt32LE(at + 20);
    const nameLength = zip.readUInt16LE(at + 28);
    const name = zip.toString("utf8", at + 46, at + 46 + nameLength);
    const local = zip.readUInt32LE(at + 42);
    assert.equal(zip.readUInt32LE(local), 0x04034b50, `local header for ${name}`);
    const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    files.set(name, inflateRawSync(zip.subarray(start, start + size)));
    at += 46 + nameLength + zip.readUInt16LE(at + 30) + zip.readUInt16LE(at + 32);
  }
  return files;
}

test("npm run build writes a store zip of exactly the extension's files", () => {
  execFileSync(process.execPath, ["scripts/build.js"]);
  const { version } = JSON.parse(readFileSync("src/extension/manifest.json", "utf8"));
  const files = unzip(readFileSync(`dist/cloakscan-${version}.zip`));

  const expected = readdirSync("src/extension", { recursive: true })
    .map((name) => name.replaceAll("\\", "/"))
    .filter((name) => statSync(`src/extension/${name}`).isFile())
    .sort();
  assert.ok(expected.includes("manifest.json"), "manifest.json sits at the zip root");
  assert.deepEqual([...files.keys()].sort(), expected);
  for (const [name, data] of files) {
    assert.ok(data.equals(readFileSync(`src/extension/${name}`)), `${name} unpacks to the source bytes`);
  }
});
