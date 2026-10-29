export type SupportedRevealRarity = 2 | 3 | 4 | 5;
export type RarityParticleEdge = "top" | "right" | "bottom" | "left";
export type RarityParticleKind = "frost" | "rune" | "ember" | "star";

export interface RarityParticleConfig {
  count: number;
  kind: RarityParticleKind;
  colors: readonly string[];
  duration: number;
}

export interface RarityParticle {
  edge: RarityParticleEdge;
  x: number;
  y: number;
  size: number;
  cohort: number;
  symbol: string;
}

export const RARITY_PARTICLE_EFFECTS: Readonly<
  Record<SupportedRevealRarity, RarityParticleConfig>
> = {
  2: {
    count: 65,
    kind: "frost",
    colors: ["#e7fbff", "#79d6ff", "#3074b7"],
    duration: 1900,
  },
  3: {
    count: 28,
    kind: "rune",
    colors: ["#eadcff", "#c6a0ff", "#9f6de5"],
    duration: 2200,
  },
  4: {
    count: 100,
    kind: "ember",
    colors: ["#ffd18a", "#ff9d42", "#ef6b29"],
    duration: 2300,
  },
  5: {
    count: 120,
    kind: "star",
    colors: ["#f3e5ff", "#c9a1ff", "#9d6dff"],
    duration: 2600,
  },
};

const EDGES: readonly RarityParticleEdge[] = [
  "top",
  "right",
  "bottom",
  "left",
];
const RUNES = ["Ω", "Δ", "Φ", "Λ", "Σ"] as const;

export function rarityParticleWaves(tier: "high" | "balanced" | "economy") {
  return tier === "high" ? 2 : 1;
}

export function isSupportedRevealRarity(
  rarity: number,
): rarity is SupportedRevealRarity {
  return rarity >= 2 && rarity <= 5 && Number.isInteger(rarity);
}

export function createRarityParticles(
  rarity: SupportedRevealRarity,
  width: number,
  height: number,
  waves: number,
): RarityParticle[] {
  if (width <= 0 || height <= 0 || waves < 1)
    throw Error("Dimensions d’effet de rareté invalides");
  const config = RARITY_PARTICLE_EFFECTS[rarity];
  const margin = Math.max(4, width * 0.025);
  return Array.from({ length: config.count }, (_, index) => {
    const edgeIndex = index % EDGES.length;
    const edge = EDGES[edgeIndex]!;
    const localIndex = Math.floor(index / EDGES.length);
    const edgeCount = Math.ceil((config.count - edgeIndex) / EDGES.length);
    const offset = (((localIndex * 17) % edgeCount) + 0.5) / edgeCount;
    return {
      edge,
      x:
        edge === "left"
          ? -margin
          : edge === "right"
            ? width + margin
            : offset * width,
      y:
        edge === "top"
          ? -margin
          : edge === "bottom"
            ? height + margin
            : offset * height,
      size: 2 + ((index * 7) % 5) * 0.7,
      cohort: edgeIndex + EDGES.length * (localIndex % waves),
      symbol: RUNES[index % RUNES.length]!,
    } satisfies RarityParticle;
  });
}

