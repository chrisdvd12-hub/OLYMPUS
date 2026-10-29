export interface RarityRevealEffect {
  key: "stone" | "bronze" | "sapphire" | "amethyst" | "royal-gold" | "cosmic" | "divine";
  haloOpacity: number;
  rayCount: number;
  particleScale: number;
  backdropOpacity: number;
  revealDuration: number;
  constellation: boolean;
  celestialColumns: boolean;
}

export const RARITY_REVEAL_EFFECTS: readonly RarityRevealEffect[] = [
  { key: "stone", haloOpacity: 0.05, rayCount: 0, particleScale: 0.15, backdropOpacity: 0, revealDuration: 460, constellation: false, celestialColumns: false },
  { key: "bronze", haloOpacity: 0.09, rayCount: 6, particleScale: 0.30, backdropOpacity: 0.02, revealDuration: 540, constellation: false, celestialColumns: false },
  { key: "sapphire", haloOpacity: 0.15, rayCount: 12, particleScale: 0.48, backdropOpacity: 0.06, revealDuration: 650, constellation: false, celestialColumns: false },
  { key: "amethyst", haloOpacity: 0.20, rayCount: 16, particleScale: 0.62, backdropOpacity: 0.10, revealDuration: 760, constellation: false, celestialColumns: false },
  { key: "royal-gold", haloOpacity: 0.27, rayCount: 24, particleScale: 0.78, backdropOpacity: 0.18, revealDuration: 920, constellation: false, celestialColumns: false },
  { key: "cosmic", haloOpacity: 0.33, rayCount: 18, particleScale: 0.90, backdropOpacity: 0.42, revealDuration: 1120, constellation: true, celestialColumns: false },
  { key: "divine", haloOpacity: 0.44, rayCount: 32, particleScale: 1, backdropOpacity: 0.68, revealDuration: 1420, constellation: false, celestialColumns: true },
] as const;

export function rarityRevealEffect(rarity: number): RarityRevealEffect {
  return RARITY_REVEAL_EFFECTS[Math.max(0, Math.min(6, Math.trunc(rarity)))]!;
}
