const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "assets/illustrations.manifest.json"), "utf8"),
);

if (!Array.isArray(manifest) || !manifest.length)
  throw new Error("Manifeste d’illustrations vide");

const decoded = manifest.map((asset) => ({
  ...asset,
  decodedBytes: asset.width * asset.height * 4,
}));
const largest = decoded.reduce((current, asset) =>
  asset.decodedBytes > current.decodedBytes ? asset : current,
);
const totalBytes = decoded.reduce((sum, asset) => sum + asset.decodedBytes, 0);
const mib = (bytes) => (bytes / 1024 / 1024).toFixed(1);

for (const asset of decoded) {
  if (asset.width > 1500 || asset.height > 2100)
    throw new Error(`${asset.cardId}: dimensions excessives ${asset.width}×${asset.height}`);
}

console.log(
  `${decoded.length} illustrations : plus grande surface décodée ${mib(largest.decodedBytes)} MiB (${largest.width}×${largest.height}); totalité théorique ${mib(totalBytes)} MiB.`,
);
console.log(
  `Budget théorique de 12 illustrations simultanées : ${mib(largest.decodedBytes * 12)} MiB avant redimensionnement natif expo-image.`,
);
