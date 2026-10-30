export type CollectionParticleKind =
  | "none"
  | "motes"
  | "frost"
  | "runes"
  | "embers"
  | "stars"
  | "gold";

export interface CollectionEffectProfile {
  accent: string;
  secondary: string;
  illustrationIntensity: number;
  frameIntensity: number;
  particles: number;
  glyphs: readonly string[];
  kind: CollectionParticleKind;
  label: string;
}

// Values supplied with the approved "Cartes vivantes + Ultra Holographic" pack.
export const COLLECTION_EFFECTS: readonly CollectionEffectProfile[] = [
  {
    accent: "#b9c0c7",
    secondary: "#e5dfd2",
    illustrationIntensity: 0,
    frameIntensity: 0,
    particles: 0,
    glyphs: [],
    kind: "none",
    label: "Pierre antique mate",
  },
  {
    accent: "#76c8a4",
    secondary: "#d5b878",
    illustrationIntensity: 0,
    frameIntensity: 0,
    particles: 9,
    glyphs: ["·"],
    kind: "motes",
    label: "Bronze patiné vivant",
  },
  {
    accent: "#70d5ff",
    secondary: "#d8f4ff",
    illustrationIntensity: 0.1,
    frameIntensity: 0.3,
    particles: 17,
    glyphs: ["◆"],
    kind: "frost",
    label: "Ultra foil argent et saphir",
  },
  {
    accent: "#b68aff",
    secondary: "#f0c8ff",
    illustrationIntensity: 0.15,
    frameIntensity: 0.45,
    particles: 14,
    glyphs: ["Ω", "Δ", "Φ", "Λ", "Σ"],
    kind: "runes",
    label: "Ultra foil améthyste irisé",
  },
  {
    accent: "#f3aa55",
    secondary: "#ffe3a1",
    illustrationIntensity: 0.18,
    frameIntensity: 0.65,
    particles: 23,
    glyphs: ["·"],
    kind: "embers",
    label: "Ultra foil or royal",
  },
  {
    accent: "#c5a3ff",
    secondary: "#f3cf75",
    illustrationIntensity: 0.2,
    frameIntensity: 0.85,
    particles: 26,
    glyphs: ["✦"],
    kind: "stars",
    label: "Ultra foil obsidienne cosmique",
  },
  {
    accent: "#f2ce7b",
    secondary: "#fff8d6",
    illustrationIntensity: 0.25,
    frameIntensity: 1,
    particles: 32,
    glyphs: ["✧"],
    kind: "gold",
    label: "Ultra foil marbre et or céleste",
  },
] as const;

export const COLLECTION_GRID_INTENSITY = {
  illustration: 0.28,
  frame: 0.24,
  maxParticles: 4,
} as const;

export const COLLECTION_TEXTURE_GEOMETRY = {
  foil: {
    width: 1000,
    height: 950,
    baseX: -300,
    baseY: -125,
    pointerX: 80,
    pointerY: 50,
    ambientX: 60,
  },
  bands: {
    width: 1100,
    height: 980,
    baseX: -360,
    baseY: -140,
    pointerX: 90,
    pointerY: 40,
    ambientX: 80,
  },
} as const;

export type CollectionTextureLayer = keyof typeof COLLECTION_TEXTURE_GEOMETRY;

export function clampCollectionPointer(value: number) {
  "worklet";
  return Math.max(-1, Math.min(1, value));
}

export function collectionTexturePosition(
  layer: CollectionTextureLayer,
  pointerX: number,
  pointerY: number,
  ambient: number,
  grid = false,
) {
  "worklet";
  const geometry = COLLECTION_TEXTURE_GEOMETRY[layer];
  const motionScale = grid ? 0.45 : 1;
  return {
    x:
      geometry.baseX +
      clampCollectionPointer(pointerX) * geometry.pointerX * motionScale +
      clampCollectionPointer(ambient) * geometry.ambientX * motionScale,
    y:
      geometry.baseY +
      clampCollectionPointer(pointerY) * geometry.pointerY * motionScale,
  };
}

export const COLLECTION_TILT_LIMITS = {
  yaw: 18,
  pitch: 13,
} as const;

export function collectionEffectFor(rarity: number) {
  return COLLECTION_EFFECTS[rarity] ?? COLLECTION_EFFECTS[0]!;
}

export function collectionTilt(x: number, y: number) {
  "worklet";
  return {
    yaw: clampCollectionPointer(x) * COLLECTION_TILT_LIMITS.yaw,
    pitch: -clampCollectionPointer(y) * COLLECTION_TILT_LIMITS.pitch,
  };
}

// Deterministic placement keeps particles stable while a card moves.
export function seededCollectionValue(index: number, salt: number) {
  const value = Math.sin((index + 1) * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

export function collectionParticleOrigin(index: number) {
  const side = index % 4;
  const along = seededCollectionValue(index, 1);
  if (side === 0) return { side, x: along, y: 0 } as const;
  if (side === 1) return { side, x: 1, y: along } as const;
  if (side === 2) return { side, x: along, y: 1 } as const;
  return { side, x: 0, y: along } as const;
}
