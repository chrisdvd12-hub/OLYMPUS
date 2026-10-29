const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { PNG } = require('pngjs');
const root = path.resolve(__dirname, '..');
const entries = JSON.parse(fs.readFileSync(path.join(root, 'assets/illustrations.manifest.json'), 'utf8'));
const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'docs/catalogue/OLYMPUS_Catalogue_120_Cartes.json'), 'utf8')).cards;
const indices = [
  { file: 'assets/cards/illustrations/INDEX.csv', separator: ',', filenameColumn: 3 },
  ...[1, 2, 3, 4].map(part => ({ file: `assets/cards/illustrations/titans-partie-${part}/INDEX.csv`, separator: ';', filenameColumn: 2 })),
  { file: 'assets/cards/illustrations/heros-partie-1/INDEX.csv', separator: ';', filenameColumn: 4 },
  ...[2, 3, 4].map(part => ({ file: `assets/cards/illustrations/heros-partie-${part}/INDEX.csv`, separator: ';', filenameColumn: 4 })),
  ...[1, 2, 3, 4].map(part => ({ file: `assets/cards/illustrations/creatures-partie-${part}/INDEX.csv`, separator: ';', filenameColumn: 4 })),
];
// Preserve supplied index entries even when a source cannot be decoded.
// The import report records why it remains a placeholder instead of a live resource.
const unavailable = JSON.parse(fs.readFileSync(path.join(root, 'assets/illustrations.unavailable.json'), 'utf8'));
const unavailableIndexedCards = new Map(unavailable.map(entry => [entry.catalogueId, entry.cardId]));
assert.equal(unavailableIndexedCards.size, unavailable.length, 'État d’import dupliqué');
const indexFiles = new Map();
for (const index of indices) {
  const rows = fs.readFileSync(path.join(root, index.file), 'utf8').replace(/^\uFEFF/, '').trim().split(/\r?\n/).slice(1).filter(Boolean).map(line => line.split(index.separator));
  for (const row of rows) {
    if (!unavailableIndexedCards.has(row[0])) assert.ok(entries.some(entry => entry.catalogueId === row[0]), `Entrée ${index.file} manquante : ${row[0]}`);
    assert.ok(!indexFiles.has(row[0]), `Entrée d’index dupliquée : ${row[0]}`);
    indexFiles.set(row[0], path.resolve(root, path.dirname(index.file), row[index.filenameColumn]));
  }
}
const registryPath = path.join(root, 'src/components/illustrationArt.ts');
const registry = new Map([...fs.readFileSync(registryPath, 'utf8').matchAll(/"([^"]+)"\s*:\s*require\(\s*"([^"]+)"\s*,?\s*\)/g)].map((match) => [match[1], path.resolve(path.dirname(registryPath), match[2])]));
assert.equal(new Set(entries.map((entry) => entry.cardId)).size, entries.length);
for (const entry of unavailable) {
  const { catalogueId: id, cardId } = entry;
  const source = catalogue.find(card => card.id === id);
  assert.ok(source, id);
  const extension = ['olympe', 'titans', 'heros', 'creatures'][source.extensionNumber - 1];
  assert.equal(cardId, `${extension}-${source.numberInExtension}`);
  assert.match(entry.sha256 ?? entry.archiveSha256, /^[a-f0-9]{64}$/);
  assert.ok(entry.reason && entry.sourceArchive, `Motif ou archive source manquante : ${id}`);
  assert.ok(indexFiles.has(id), `Absence non documentée dans les index : ${id}`);
  assert.equal(path.basename(indexFiles.get(id)), entry.filename);
  assert.ok(!entries.some(entry => entry.catalogueId === id || entry.cardId === cardId), `Source invalide activée : ${id}`);
  assert.ok(!registry.has(cardId), `Illustration invalide activée dans le registre : ${id}`);
}
for (const entry of entries) {
  const source = catalogue.find((card) => card.id === entry.catalogueId);
  assert.ok(source, entry.catalogueId);
  const extension = ['olympe', 'titans', 'heros', 'creatures'][source.extensionNumber - 1];
  assert.ok(extension, 'Extension inconnue');
  assert.equal(entry.cardId, `${extension}-${source.numberInExtension}`);
  if (indexFiles.has(entry.catalogueId)) assert.equal(path.join(root, entry.path), indexFiles.get(entry.catalogueId), 'Chemin différent de celui de l’index fourni');
  assert.ok(path.basename(entry.path).startsWith(`${entry.catalogueId}_`));
  assert.equal(registry.get(entry.cardId), path.join(root, entry.path), 'Mauvaise association illustration/carte');
  const bytes = fs.readFileSync(path.join(root, entry.path));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), entry.sha256, 'Le fichier original a été modifié');
  const png = PNG.sync.read(bytes);
  assert.equal(png.width, entry.width);
  assert.equal(png.height, entry.height);
  assert.equal(png.width * 7, png.height * 5, 'Le ratio doit rester 5:7');
}
console.log(`${entries.length} illustrations originales : catalogue, index, associations, dimensions et empreintes vérifiés.`);
console.log(unavailableIndexedCards.size
  ? `Sources en attente : ${[...unavailableIndexedCards.keys()].join(', ')} (non affichées ; détails dans assets/illustrations.unavailable.json).`
  : 'Sources en attente : aucune.');
