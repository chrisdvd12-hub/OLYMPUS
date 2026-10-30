import assert from "node:assert/strict";
import { test } from "node:test";
import {
  COLLECTION_EFFECTS,
  COLLECTION_GRID_INTENSITY,
  COLLECTION_TILT_LIMITS,
  clampCollectionPointer,
  collectionParticleOrigin,
  collectionTilt,
} from "../src/domain/collectionEffects.ts";

test("the seven collection rarities use the approved foil calibration", () => {
  assert.equal(COLLECTION_EFFECTS.length, 7);
  assert.deepEqual(
    COLLECTION_EFFECTS.map(({ foil, bands, beam }) => [foil, bands, beam]),
    [
      [0, 0, 0],
      [0, 0, 0],
      [0.26, 0.12, 0.2],
      [0.45, 0.26, 0.35],
      [0.68, 0.48, 0.55],
      [0.9, 0.78, 0.8],
      [1, 0.95, 1],
    ],
  );
  assert.equal(COLLECTION_GRID_INTENSITY.maxParticles, 4);
});

test("collection pointer calibration is constrained to the card rectangle", () => {
  assert.equal(clampCollectionPointer(-4), -1);
  assert.equal(clampCollectionPointer(4), 1);
  assert.deepEqual(collectionTilt(5, -5), {
    yaw: COLLECTION_TILT_LIMITS.yaw,
    pitch: COLLECTION_TILT_LIMITS.pitch,
  });
});

test("ambient particles originate on one of the four card borders", () => {
  for (let index = 0; index < 64; index += 1) {
    const { x, y } = collectionParticleOrigin(index);
    assert.ok(x === 0 || x === 1 || y === 0 || y === 1);
    assert.ok(x >= 0 && x <= 1);
    assert.ok(y >= 0 && y <= 1);
  }
});
