import { test } from "node:test";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import {
  generatePack,
  rarityDraw,
  initialState,
  purchase,
  recharge,
  RECHARGE_MS,
} from "../src/domain/boosters.ts";
import {
  CARDS,
  EXTENSIONS,
  WEIGHTS,
  resolveCard,
} from "../src/domain/catalog.ts";
function seeded(seed = 1) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
test("7 cartes de la bonne extension et garantie rare sur 10000 boosters", () => {
  const rng = seeded();
  for (let i = 0; i < 10000; i++) {
    const e = EXTENSIONS[i % 4]!;
    const cards = generatePack(e.id, i % 20, rng);
    assert.equal(cards.length, 7);
    assert.ok(cards.every((c) => c.extension === e.id));
    assert.ok(cards.some((c) => c.rarity >= 2));
  }
});
test("probabilités initiales exactes sur les 10000 points médians", () => {
  const counts = Array(7).fill(0);
  for (let i = 0; i < 10000; i++)
    counts[rarityDraw(0, () => (i + 0.5) / 10000)]++;
  assert.deepEqual(counts, [...WEIGHTS]);
});
test("poids relatifs des remplacements", () => {
  for (const min of [2, 4]) {
    const total = WEIGHTS.slice(min).reduce((a, b) => a + b, 0);
    const counts = Array(7).fill(0);
    for (let i = 0; i < total; i++)
      counts[rarityDraw(min, () => (i + 0.5) / total)]++;
    assert.deepEqual(counts.slice(min), WEIGHTS.slice(min));
  }
});
test("vingtième booster, puis remise à zéro", () => {
  let s = initialState(0);
  s.drachmas = 10000;
  for (let i = 0; i < 20; i++) {
    s = purchase(s, "olympe", "paid", String(i), 0, () => 0);
    assert.equal(s.pending!.cards.length, 7);
    if (i < 19) assert.equal(s.pity, i + 1);
    else {
      assert.ok(s.pending!.cards.some((c) => c.rarity >= 4));
      assert.equal(s.pity, 0);
    }
    s = { ...s, pending: null };
  }
});
test("débit, attribution unique, doublons et refus sans solde", () => {
  const before = initialState(0);
  const after = purchase(before, "olympe", "paid", "a", 0, () => 0);
  assert.equal(after.drachmas, 400);
  assert.equal(
    Object.values(after.collection).reduce((a, b) => a + b, 0),
    7,
  );
  assert.equal(after.pending!.discoveries.filter(Boolean).length, 2);
  assert.equal(after.collection["olympe-1"], 6);
  assert.throws(() => purchase(after, "olympe", "paid", "a", 0));
  assert.throws(() =>
    purchase({ ...after, pending: null }, "olympe", "paid", "a", 0),
  );
  assert.throws(() =>
    purchase({ ...before, drachmas: 99 }, "olympe", "paid", "b", 0),
  );
  assert.equal(before.drachmas, 500);
});
test("charges toutes les 12h, plafond et absence de débit", () => {
  let s = purchase(initialState(0), "titans", "free", "a", 0, () => 0);
  assert.equal(s.drachmas, 500);
  assert.equal(s.freeCharges, 1);
  s = { ...s, pending: null };
  s = purchase(s, "titans", "free", "b", 1, () => 0);
  assert.equal(s.freeCharges, 0);
  assert.throws(() =>
    purchase({ ...s, pending: null }, "titans", "free", "c", 2),
  );
  assert.equal(recharge(s, RECHARGE_MS - 1).freeCharges, 0);
  assert.equal(recharge(s, RECHARGE_MS).freeCharges, 1);
  assert.equal(recharge(s, 5 * RECHARGE_MS).freeCharges, 2);
  assert.equal(recharge(s, -1).freeCharges, 0);
});
test("transaction SQLite : reprise du reçu après fermeture et rollback", () => {
  const db = new DatabaseSync(":memory:");
  db.exec("CREATE TABLE game (id INTEGER PRIMARY KEY,data TEXT)");
  const saved = purchase(
    initialState(0),
    "creatures",
    "paid",
    "persist",
    0,
    seeded(),
  );
  db.prepare("INSERT INTO game VALUES(1,?)").run(JSON.stringify(saved));
  const restored = JSON.parse(
    (db.prepare("SELECT data FROM game").get() as { data: string }).data,
  );
  assert.deepEqual(restored.pending, saved.pending);
  assert.deepEqual(restored.collection, saved.collection);
  db.exec("BEGIN");
  db.prepare("UPDATE game SET data=?").run("{}");
  db.exec("ROLLBACK");
  assert.deepEqual(
    JSON.parse(
      (db.prepare("SELECT data FROM game").get() as { data: string }).data,
    ),
    saved,
  );
  db.close();
});

test("mode test : ouvertures illimitées à solde nul, attribution persistante et garanties", () => {
  let state = { ...initialState(0), drachmas: 0 };
  for (let i = 0; i < 25; i++) {
    state = purchase(state, "olympe", "paid", `test-${i}`, 0, () => 0, {
      unlimitedDrachmas: true,
    });
    assert.equal(state.drachmas, 0);
    assert.equal(state.freeCharges, 2);
    assert.equal(state.pending!.cards.length, 7);
    assert.ok(state.pending!.cards.every((c) => c.extension === "olympe"));
    assert.ok(state.pending!.cards.some((c) => c.rarity >= 2));
    if (i === 19) assert.ok(state.pending!.cards.some((c) => c.rarity >= 4));
    assert.equal(
      Object.values(state.collection).reduce((a, b) => a + b, 0),
      (i + 1) * 7,
    );
    state = JSON.parse(JSON.stringify({ ...state, pending: null }));
  }
  // Removing the temporary option restores normal refusal without touching saves.
  assert.throws(
    () => purchase(state, "olympe", "paid", "normal", 0),
    /Drachmes insuffisantes/,
  );
});

test("mode test : conserve le solde réel et bloque toujours les doubles achats et charges gratuites épuisées", () => {
  const options = { unlimitedDrachmas: true };
  const before = initialState(0);
  const after = purchase(
    before,
    "titans",
    "paid",
    "test-once",
    0,
    () => 0,
    options,
  );
  assert.equal(after.drachmas, before.drachmas);
  assert.equal(after.collection["titans-1"], 6);
  assert.throws(
    () => purchase(after, "titans", "paid", "other", 0, () => 0, options),
    /déjà en cours/,
  );
  assert.throws(
    () =>
      purchase(
        { ...after, pending: null },
        "titans",
        "paid",
        "test-once",
        0,
        () => 0,
        options,
      ),
    /déjà traité/,
  );
  assert.throws(
    () =>
      purchase(
        { ...before, freeCharges: 0 },
        "titans",
        "free",
        "no-free",
        0,
        () => 0,
        options,
      ),
    /Aucune charge gratuite/,
  );
});

test("Zeus divin remplace l'emplacement OLY-30 sans changer le catalogue ni les tirages divins", () => {
  assert.equal(CARDS.length, 120);
  assert.equal(new Set(CARDS.map((c) => c.id)).size, 120);
  for (const extension of EXTENSIONS)
    assert.equal(CARDS.filter((c) => c.extension === extension.id).length, 30);
  const pack = generatePack("olympe", 0, () => 0.9999);
  assert.equal(pack.length, 7);
  for (const card of pack) {
    assert.equal(card.id, "olympe-30");
    assert.equal(card.number, "OLY-30");
    assert.equal(card.name, "Zeus");
    assert.equal(card.rarity, 6);
    assert.equal(card.extension, "olympe");
    assert.ok(card.history?.includes("Cronos et de Rhéa"));
  }
});

test("un ancien reçu conserve son attribution et retrouve les informations éditoriales à jour", () => {
  const legacy = {
    id: "olympe-30",
    extension: "olympe",
    name: "Dionysos",
    rarity: 6,
  };
  const saved = { ...initialState(0), collection: { "olympe-30": 2 } };
  const card = resolveCard(legacy);
  assert.equal(card.id, legacy.id);
  assert.equal(card.name, "Zeus");
  assert.equal(card.epithet, "Le Souverain Céleste");
  assert.equal(legacy.name, "Dionysos");
  assert.deepEqual(saved.collection, { "olympe-30": 2 });
});


test("catalogue fourni : numéros uniques, 30 fiches complètes et sept raretés par extension", () => {
  assert.equal(new Set(CARDS.map((c) => c.number)).size, 120);
  for (const extension of EXTENSIONS) {
    const cards = CARDS.filter((c) => c.extension === extension.id);
    assert.equal(cards.length, 30);
    assert.deepEqual(Array.from({ length: 7 }, (_, rarity) => cards.filter((c) => c.rarity === rarity).length), [5, 6, 7, 5, 4, 2, 1]);
    for (const c of cards) {
      assert.ok(c.name && c.epithet && c.category && c.description && c.history);
      assert.ok(c.attributes?.length && c.relations?.length);
    }
  }
  assert.equal(CARDS.find((c) => c.id === "titans-30")?.name, "Chaos");
  assert.equal(CARDS.find((c) => c.id === "heros-30")?.name, "Héraclès");
  assert.equal(CARDS.find((c) => c.id === "creatures-30")?.name, "Phénix");
});

test("mise à jour du catalogue : la rareté des anciens reçus reste celle du tirage", () => {
  const legacy = { id: "olympe-12", extension: "olympe", name: "Hermès", rarity: 0 };
  assert.equal(CARDS.find((c) => c.id === legacy.id)?.rarity, 2);
  const resolved = resolveCard(legacy);
  assert.equal(resolved.name, "Déméter");
  assert.equal(resolved.rarity, 0);
  assert.equal(legacy.name, "Hermès");
});


test("les fiches importées correspondent au fichier fourni, hors Zeus approuvé", () => {
  const source = JSON.parse(readFileSync(new URL("../docs/catalogue/OLYMPUS_Catalogue_120_Cartes.json", import.meta.url), "utf8"));
  for (const row of source.cards) {
    if (row.id === "OLY-030") continue;
    const card = CARDS.find((c) => c.number === row.id)!;
    assert.ok(card, row.id);
    assert.equal(card.name, row.name);
    assert.equal(card.epithet, row.subtitle);
    assert.equal(card.category, row.type);
    assert.equal(card.description, row.shortDescription);
    assert.equal(card.history, row.lore);
    assert.deepEqual(card.attributes, row.visualAttributes.split(",").map((s: string) => s.trim()));
    assert.deepEqual(card.relations, row.relations.split(";").map((s: string) => s.trim()));
    assert.equal(card.editorialNote, row.editorialNote);
  }
});
