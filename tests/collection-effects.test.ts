import assert from "node:assert/strict";
import { test } from "node:test";
import {
  COLLECTION_EFFECTS,
  COLLECTION_GRID_INTENSITY,
  COLLECTION_TEXTURE_GEOMETRY,
  COLLECTION_TILT_LIMITS,
  clampCollectionPointer,
  collectionParticleOrigin,
  collectionTexturePosition,
  collectionTilt,
} from "../src/domain/collectionEffects.ts";

test("the seven collection rarities use the approved foil calibration", () => {
  assert.equal(COLLECTION_EFFECTS.length, 7);
  assert.deepEqual(
    COLLECTION_EFFECTS.map(({ illustrationIntensity, frameIntensity }) => [
      illustrationIntensity,
      frameIntensity,
    ]),
    [
      [0, 0],
      [0, 0],
      [0.1, 0.3],
      [0.15, 0.45],
      [0.18, 0.65],
      [0.2, 0.85],
      [0.25, 1],
    ],
  );
  assert.ok(
    COLLECTION_EFFECTS.every(
      ({ illustrationIntensity, frameIntensity }) =>
        illustrationIntensity <= 0.25 && frameIntensity <= 1,
    ),
  );
  assert.equal(COLLECTION_GRID_INTENSITY.maxParticles, 4);
});

test("oversized collection textures cover the whole card at every pointer extreme", () => {
  for (const layer of ["foil", "bands"] as const) {
    const { width, height } = COLLECTION_TEXTURE_GEOMETRY[layer];
    for (const grid of [false, true]) {
      for (const pointerX of [-1, 0, 1]) {
        for (const pointerY of [-1, 0, 1]) {
          for (const ambient of [0, 1]) {
            const { x, y } = collectionTexturePosition(
              layer,
              pointerX,
              pointerY,
              ambient,
              grid,
            );
            assert.ok(x <= 0, `${layer} starts inside the card at x=${x}`);
            assert.ok(y <= 0, `${layer} starts inside the card at y=${y}`);
            assert.ok(x + width >= 500, `${layer} leaves a right-side gap`);
            assert.ok(y + height >= 700, `${layer} leaves a bottom gap`);
          }
        }
      }
    }
  }
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
