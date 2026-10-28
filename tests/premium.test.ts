import { test } from "node:test";
import assert from "node:assert/strict";
import {
  wheelPositionFromDrag,
  materialResponse,
  wrapIndex,
  wheelPose,
  nearestWheelPosition,
  normalizeDegrees,
  cardOrientation,
  projectedYaw,
} from "../src/interaction/spatial.ts";
import {
  collectionStats,
  filterCollection,
  relatedCards,
  validProfileName,
} from "../src/domain/collection.ts";
import { CARDS, EXTENSIONS } from "../src/domain/catalog.ts";
import { initialState, purchase } from "../src/domain/boosters.ts";
import { chooseGraphicsTier } from "../src/performance/graphicsProfiles.ts";
import { summarizeFrameTimes } from "../src/performance/frameMetrics.ts";

test("roue infinie : chaque tour complet conserve la pose, dans les deux sens", () => {
  for (const turns of [-100, -3, -1, 1, 4, 100])
    for (let index = 0; index < 4; index++) {
      const a = wheelPose(index, 0.43, 160);
      const b = wheelPose(index, 0.43 + turns * 4, 160);
      for (const key of ["x", "y", "z", "scale", "opacity", "rotateY"] as const)
        assert.ok(Math.abs(a[key] - b[key]) < 1e-8);
    }
});
test("roue : sens du glissement, sélection de proximité et recentrage sans rupture", () => {
  const positionFromDrag = (dx: number) => wheelPositionFromDrag(0, dx);
  assert.equal(wrapIndex(positionFromDrag(-115)), 1);
  assert.equal(wrapIndex(positionFromDrag(115)), 3);
  for (const position of [-400.1, -2.1, -0.49, 0.3, 3.9, 17.2, 401.4])
    for (let i = 0; i < 4; i++) {
      const target = nearestWheelPosition(i, position);
      assert.equal(wrapIndex(target), i);
      assert.ok(Math.abs(target - position) <= 2);
      assert.ok(Math.abs(wheelPose(i, target, 160).x) < 1e-8);
      assert.ok(Math.abs(wheelPose(i, target, 160).scale - 1) < 1e-8);
    }
});
test("roue : le booster ouvert appartient toujours à l’extension sélectionnée", () => {
  for (const position of [-101, -4, -1, 0, 3, 7, 1002]) {
    const extension = EXTENSIONS[wrapIndex(position)]!;
    const bought = purchase(
      initialState(0),
      extension.id,
      "paid",
      `wheel-${position}`,
      0,
      () => 0,
    );
    assert.equal(bought.pending!.extension, extension.id);
    assert.equal(bought.pending!.cards.length, 7);
    assert.ok(
      bought.pending!.cards.every((card) => card.extension === extension.id),
    );
  }
});
test("visualiseur : 360 degrés sans limite, inclinaison bornée, inertie modérée", () => {
  for (const yaw of [-1080, -360, 0, 360, 1080])
    assert.equal(normalizeDegrees(yaw), 0);
  assert.equal(cardOrientation(380, 90).pitch, 35);
  assert.equal(cardOrientation(-370, -70).pitch, -35);
  assert.equal(projectedYaw(0, 999999), 100);
  assert.equal(projectedYaw(0, -999999), -100);
});
test("recto/verso : une seule face visible, le verso est retourné de 180 degrés", () => {
  for (let yaw = -1080; yaw <= 1080; yaw += 3) {
    const front = cardOrientation(yaw, 0).front;
    const backSurfaceAngle = normalizeDegrees(yaw + 180);
    if (!front) assert.ok(backSurfaceAngle < 90 || backSurfaceAngle > 270);
    if (front)
      assert.ok(normalizeDegrees(yaw) <= 90 || normalizeDegrees(yaw) >= 270);
  }
  assert.equal(cardOrientation(0, 0).front, true);
  assert.equal(cardOrientation(180, 0).front, false);
  assert.equal(cardOrientation(360, 0).front, true);
});
test("album : recherche accentuée, numéro, extension, rareté, possession, doublons et tris", () => {
  const collection = { "olympe-30": 2, "titans-1": 1, "heros-30": 3 };
  assert.equal(filterCollection(collection, { possession: "owned" }).length, 3);
  assert.equal(
    filterCollection(collection, { possession: "duplicates" }).length,
    2,
  );
  assert.equal(
    filterCollection(collection, { possession: "missing" }).length,
    117,
  );
  assert.equal(
    filterCollection(collection, { query: "Hebe" })[0]!.name,
    "Hébé",
  );
  assert.equal(
    filterCollection(collection, { query: "OLY-001" })[0]!.id,
    "olympe-1",
  );
  assert.equal(
    filterCollection(collection, { query: "OLY-030" })[0]!.id,
    "olympe-30",
  );
  const divine = filterCollection(collection, {
    extension: "olympe",
    rarity: 6,
  });
  assert.equal(divine.length, 1);
  assert.equal(divine[0]!.id, "olympe-30");
  const sorted = filterCollection(collection, { sort: "number" });
  assert.equal(sorted[0]!.id, "olympe-1");
  assert.equal(sorted.at(-1)!.id, "creatures-30");
  assert.equal(filterCollection(collection, { sort: "rarity" })[0]!.rarity, 6);
});
test("progression : découvertes, exemplaires, cartes manquantes et compteurs par extension/rareté", () => {
  const stats = collectionStats({
    "olympe-30": 2,
    "titans-1": 1,
    "heros-30": 3,
  });
  assert.equal(stats.owned, 3);
  assert.equal(stats.missing, 117);
  assert.equal(stats.copies, 6);
  assert.equal(stats.duplicates, 3);
  assert.equal(
    stats.byRarity.reduce((sum, r) => sum + r.owned, 0),
    3,
  );
  assert.equal(
    stats.byExtension.reduce((sum, e) => sum + e.owned, 0),
    3,
  );
});
test("encyclopédie : relations réelles du catalogue et variantes, sans personnages inventés", () => {
  assert.ok(relatedCards("Hera").every((card) => card.name === "Héra"));
  assert.equal(relatedCards("Zeus").length, 2);
  assert.equal(relatedCards("Personnage absent").length, 0);
  assert.equal(
    relatedCards("Zeus").find((c) => c.rarity === 6)!.history,
    CARDS.find((c) => c.id === "olympe-30")!.history,
  );
});
test("profil : nom validé, progression et reçu persistants inchangés", () => {
  assert.equal(validProfileName("  Ariane  "), "Ariane");
  assert.throws(() => validProfileName("   "));
  assert.throws(() => validProfileName("A".repeat(31)));
  const state = purchase(
    initialState(0),
    "olympe",
    "paid",
    "persist-premium",
    0,
    () => 0,
  );
  const restored = JSON.parse(
    JSON.stringify({ ...state, playerName: validProfileName("Ariane") }),
  );
  assert.deepEqual(restored.pending, state.pending);
  assert.deepEqual(restored.collection, state.collection);
  assert.equal(restored.playerName, "Ariane");
});

test("matière : les reflets suivent réellement l’orientation et restent continus à 360°", () => {
  assert.notEqual(materialResponse(0, 0), materialResponse(50, 0));
  assert.notEqual(materialResponse(0, 0), materialResponse(0, 35));
  assert.ok(Math.abs(materialResponse(0, 0) - materialResponse(360, 0)) < 1e-8);
  assert.notEqual(materialResponse(0, 0, 0), materialResponse(0, 0, 1));
});

test("qualité graphique : adaptation déterministe à la charge d'affichage", () => {
  assert.equal(chooseGraphicsTier({ width: 390, height: 844, pixelRatio: 3, platform: "ios" }), "high");
  assert.equal(chooseGraphicsTier({ width: 1024, height: 1366, pixelRatio: 2, platform: "ios" }), "balanced");
  assert.equal(chooseGraphicsTier({ width: 1440, height: 2960, pixelRatio: 3, platform: "android" }), "economy");
  assert.equal(chooseGraphicsTier({ width: 390, height: 844, pixelRatio: 3, reducedMotion: true }), "economy");
});

test("diagnostic : FPS, P95 et images longues restent des mesures séparées", () => {
  const metrics = summarizeFrameTimes([16, 16, 17, 18, 40]);
  assert.equal(metrics.samples, 5);
  assert.equal(metrics.longFrames, 1);
  assert.equal(metrics.p95FrameMs, 40);
  assert.ok(metrics.fps > 40 && metrics.fps < 60);
});
