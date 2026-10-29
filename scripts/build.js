// Copies the unpacked extension into dist/extension/, ready for "Load unpacked", and zips
// the same files into dist/cloakscan-<version>.zip with manifest.json at the root, ready for
// the Chrome Web Store. Fails if the manifest isn't valid MV3 JSON.
import { cpSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { crc32, deflateRawSync } from "node:zlib";

const manifest = JSON.parse(readFileSync("src/extension/manifest.json", "utf8"));
if (manifest.manifest_version !== 3) {
  throw new Error(`manifest_version is ${manifest.manifest_version}, expected 3`);
}

rmSync("dist", { recursive: true, force: true });
cpSync("src/extension", "dist/extension", { recursive: true });

// A plain deflate zip, written by hand so the build needs no dependency. Every entry gets
// the date 1980-01-01, so the same source always gives the same bytes.
const names = readdirSync("dist/extension", { recursive: true })
  .map((name) => name.replaceAll("\\", "/"))
  .filter((name) => statSync(`dist/extension/${name}`).isFile())
  .sort();
const DOS_DATE = 0x21;
const locals = [];
const centrals = [];
let offset = 0;
for (const name of names) {
  const data = readFileSync(`dist/extension/${name}`);
  const packed = deflateRawSync(data, { level: 9 });
  const nameBytes = Buffer.from(name, "utf8");
  const head = Buffer.alloc(30);
  head.writeUInt32LE(0x04034b50, 0);
  head.writeUInt16LE(20, 4); // version needed: 2.0, plain deflate
  head.writeUInt16LE(0x0800, 6); // names are UTF-8
  head.writeUInt16LE(8, 8); // deflate
  head.writeUInt16LE(0, 10);
  head.writeUInt16LE(DOS_DATE, 12);
  head.writeUInt32LE(crc32(data), 14);
  head.writeUInt32LE(packed.length, 18);
  head.writeUInt32LE(data.length, 22);
  head.writeUInt16LE(nameBytes.length, 26);
  locals.push(head, nameBytes, packed);

  const entry = Buffer.alloc(46);
  entry.writeUInt32LE(0x02014b50, 0);
  entry.writeUInt16LE(20, 4); // made by
  head.copy(entry, 6, 4, 30); // version needed through name length match the local header
  entry.writeUInt32LE(offset, 42);
  centrals.push(entry, nameBytes);
  offset += head.length + nameBytes.length + packed.length;
}
const central = Buffer.concat(centrals);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(names.length, 8);
end.writeUInt16LE(names.length, 10);
end.writeUInt32LE(central.length, 12);
end.writeUInt32LE(offset, 16);
const zipPath = `dist/cloakscan-${manifest.version}.zip`;
writeFileSync(zipPath, Buffer.concat([...locals, central, end]));

console.log(`Built CloakScan ${manifest.version} into dist/extension/ and ${zipPath} (${names.length} files)`);
