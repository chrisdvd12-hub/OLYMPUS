import { test } from "node:test";
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
import { EXTENSIONS, WEIGHTS } from "../src/domain/catalog.ts";
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
