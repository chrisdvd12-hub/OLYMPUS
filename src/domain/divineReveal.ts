export const DIVINE_PARTICLE_COUNT = 180;

export type DivineParticleEdge = "top" | "right" | "bottom" | "left";

export interface DivineParticle {
  edge: DivineParticleEdge;
  x: number;
  y: number;
  size: number;
  diamond: boolean;
  cohort: number;
}

const EDGES: readonly DivineParticleEdge[] = [
  "top",
  "right",
  "bottom",
  "left",
];

export function divineCohortWaves(tier: "high" | "balanced" | "economy") {
  return tier === "high" ? 2 : 1;
}

// Deterministic placement keeps every particle anchored to a card edge and
// avoids allocating random layouts during a reveal.
export function createDivineParticles(
  width: number,
  height: number,
  waves: number,
): DivineParticle[] {
  if (width <= 0 || height <= 0 || waves < 1)
    throw Error("Dimensions de révélation divine invalides");
  const perEdge = DIVINE_PARTICLE_COUNT / EDGES.length;
  return Array.from({ length: DIVINE_PARTICLE_COUNT }, (_, index) => {
    const edgeIndex = index % EDGES.length;
    const edge = EDGES[edgeIndex]!;
    const localIndex = Math.floor(index / EDGES.length);
    const offset = (((localIndex * 37) % perEdge) + 0.5) / perEdge;
    return {
      edge,
      x: edge === "left" ? 0 : edge === "right" ? width : offset * width,
      y: edge === "top" ? 0 : edge === "bottom" ? height : offset * height,
      size: 1.8 + ((index * 11) % 5) * 0.65,
      diamond: index % 3 === 0,
      cohort: edgeIndex + EDGES.length * (localIndex % waves),
    } satisfies DivineParticle;
  });
}

