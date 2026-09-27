// Copies the unpacked extension into dist/extension/, ready for "Load unpacked" or zipping
// for the Chrome Web Store. Fails if the manifest isn't valid MV3 JSON.
import { cpSync, readFileSync, rmSync } from "node:fs";

const manifest = JSON.parse(readFileSync("src/extension/manifest.json", "utf8"));
if (manifest.manifest_version !== 3) {
  throw new Error(`manifest_version is ${manifest.manifest_version}, expected 3`);
}

rmSync("dist", { recursive: true, force: true });
cpSync("src/extension", "dist/extension", { recursive: true });
console.log(`Built CloakScan ${manifest.version} into dist/extension/`);
