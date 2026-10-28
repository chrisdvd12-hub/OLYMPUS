const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PNG } = require('pngjs');
const root = path.resolve(__dirname, '..');
const entries = JSON.parse(fs.readFileSync(path.join(root, 'assets/artwork.manifest.json'), 'utf8'));
for (const entry of entries) {
  assert.match(entry.path, /\.png$/, entry.path);
  const png = PNG.sync.read(fs.readFileSync(path.join(root, entry.path)));
  const alpha = (x, y) => png.data[(Math.floor(y * (png.height - 1)) * png.width + Math.floor(x * (png.width - 1))) * 4 + 3];
  for (const [x, y] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    assert.ok(alpha(x, y) <= 8, `${entry.path}: coin extérieur opaque (${x}, ${y})`);
  }
  assert.ok(png.data.some((value, index) => index % 4 === 3 && value >= 240), `${entry.path}: aucun contenu opaque`);
  if (entry.kind === 'frame') {
    assert.ok(alpha(0.5, 0.33) <= 8, `${entry.path}: fenêtre d’illustration opaque`);
    assert.ok(alpha(0.5, 0.8) >= 240, `${entry.path}: panneau de texte effacé`);
  } else {
    assert.ok(alpha(0.5, 0.5) >= 240, `${entry.path}: intérieur de carte ou sachet effacé`);
  }
}
console.log(`${entries.length} ressources : transparence et panneaux vérifiés.`);
