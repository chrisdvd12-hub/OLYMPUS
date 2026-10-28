import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import {
  ARTWORK_FOCUS,
  FRAME_APERTURES,
  artworkLayout,
} from "../src/domain/artworkLayout.ts";
import { CARDS } from "../src/domain/catalog.ts";
const { PNG } = createRequire(import.meta.url)("pngjs");

test("chaque fenêtre peinte couvre intégralement le trou réel de son cadre PNG", () => {
  const frames = [
    "commune",
    "peu-commune",
    "rare",
    "epique",
    "legendaire",
    "mythique",
    "divine",
  ];
  for (const [rarity, name] of frames.entries()) {
    const png = PNG.sync.read(
      readFileSync(new URL(`../assets/frames/${name}.png`, import.meta.url)),
    );
    const { width, height, data } = png;
    const seed = Math.floor(height / 3) * width + Math.floor(width / 2);
    const visited = new Uint8Array(width * height);
    const queue = new Uint32Array(width * height);
    queue[0] = seed;
    visited[seed] = 1;
    let head = 0,
      tail = 1,
      minX = width,
      maxX = 0,
      minY = height,
      maxY = 0;
    while (head < tail) {
      const pixel = queue[head++]!;
      const x = pixel % width,
        y = Math.floor(pixel / width);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      for (const neighbor of [
        x > 0 ? pixel - 1 : -1,
        x < width - 1 ? pixel + 1 : -1,
        y > 0 ? pixel - width : -1,
        y < height - 1 ? pixel + width : -1,
      ]) {
        if (neighbor >= 0 && !visited[neighbor]) {
          visited[neighbor] = 1;
          if (data[neighbor * 4 + 3] <= 12) queue[tail++] = neighbor;
        }
      }
    }
    const aperture = FRAME_APERTURES[rarity]!;
    assert.ok(aperture.x <= minX / width && aperture.y <= minY / height, name);
    assert.ok(aperture.x + aperture.width >= (maxX + 1) / width, name);
    assert.ok(aperture.y + aperture.height >= (maxY + 1) / height, name);
  }
});

test("les 29 illustrations ont un cadrage explicite et un personnage visible", () => {
  assert.equal(Object.keys(ARTWORK_FOCUS).length, 29);
  for (const [id, focus] of Object.entries(ARTWORK_FOCUS)) {
    const card = CARDS.find((c) => c.id === id)!;
    assert.ok(card);
    for (const width of [72, 195, 320, 440, 1500]) {
      const { image, viewport } = artworkLayout(id, card.rarity, width);
      // The image covers the aperture and is never stretched.
      assert.ok(image.left <= 1e-8 && image.top <= 1e-8);
      assert.ok(image.left + image.width >= viewport.width - 1e-8);
      assert.ok(image.top + image.height >= viewport.height - 1e-8);
      assert.ok(Math.abs(image.width / image.height - 5 / 7) < 1e-10);
      // Face/upper body is centred horizontally in the opening, away from the rim.
      const x = (image.left + image.width * focus.x) / viewport.width;
      const y = (image.top + image.height * focus.y) / viewport.height;
      assert.ok(Math.abs(x - 0.5) < 0.005, `${id}: x=${x}`);
      assert.ok(y >= 0.2 && y <= 0.4, `${id}: y=${y}`);
    }
  }
});

test("le placement reste proportionnel entre vignette et carte plein écran", () => {
  for (let rarity = 0; rarity < FRAME_APERTURES.length; rarity++) {
    const small = artworkLayout("olympe-7", rarity, 100);
    const large = artworkLayout("olympe-7", rarity, 400);
    for (const part of ["viewport", "image"] as const)
      for (const key of ["width", "height", "left", "top"] as const)
        assert.ok(Math.abs(large[part][key] - 4 * small[part][key]) < 1e-8);
  }
});

test("un format d’illustration différent reste proportionnel, dimensions invalides refusées", () => {
  const { image } = artworkLayout("olympe-30", 6, 320, 914 / 1280);
  assert.ok(Math.abs(image.width / image.height - 914 / 1280) < 1e-10);
  assert.throws(() => artworkLayout("olympe-1", 7, 320));
  assert.throws(() => artworkLayout("olympe-1", 0, 0));
});
