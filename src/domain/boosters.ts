import { CARDS, EXTENSIONS, WEIGHTS, type Card } from "./catalog.ts";
export const PACK_SIZE = 7;
export const PRICE = 100;
export const RECHARGE_MS = 12 * 60 * 60 * 1000;
export interface Receipt {
  id: string;
  extension: string;
  cards: Card[];
  discoveries: boolean[];
  quantities: number[];
  createdAt: number;
  source: "paid" | "free";
}
export interface GameState {
  version: 1;
  drachmas: number;
  freeCharges: number;
  rechargeAt: number;
  pity: number;
  collection: Record<string, number>;
  pending: Receipt | null;
  lastReceipt: Receipt | null;
}
export const initialState = (now: number): GameState => ({
  version: 1,
  drachmas: 500,
  freeCharges: 2,
  rechargeAt: now,
  pity: 0,
  collection: {},
  pending: null,
  lastReceipt: null,
});
export function rarityDraw(min = 0, rng: () => number = Math.random): number {
  const value = rng();
  if (value < 0 || value >= 1 || !Number.isFinite(value))
    throw Error("Aléatoire invalide");
  let target = value * WEIGHTS.slice(min).reduce((a, b) => a + b, 0);
  for (let i = min; i < WEIGHTS.length; i++) {
    target -= WEIGHTS[i]!;
    if (target < 0) return i;
  }
  return 6;
}
export function generatePack(
  extension: string,
  pity: number,
  rng: () => number = Math.random,
): Card[] {
  if (!EXTENSIONS.some((e) => e.id === extension))
    throw Error("Extension inconnue");
  const pick = (min = 0) => {
    const rarity = rarityDraw(min, rng);
    const pool = CARDS.filter(
      (c) => c.extension === extension && c.rarity === rarity,
    );
    return pool[Math.floor(rng() * pool.length)]!;
  };
  const cards = Array.from({ length: PACK_SIZE }, () => pick());
  if (!cards.some((c) => c.rarity >= 2)) cards[6] = pick(2);
  if (pity >= 19 && !cards.some((c) => c.rarity >= 4)) cards[6] = pick(4);
  return cards;
}
export function recharge(state: GameState, now: number): GameState {
  if (now < state.rechargeAt) return state;
  if (state.freeCharges >= 2) return { ...state, rechargeAt: now };
  const gained = Math.floor((now - state.rechargeAt) / RECHARGE_MS);
  if (gained <= 0) return state;
  const freeCharges = Math.min(2, state.freeCharges + gained);
  return {
    ...state,
    freeCharges,
    rechargeAt:
      freeCharges === 2 ? now : state.rechargeAt + gained * RECHARGE_MS,
  };
}
export function purchase(
  input: GameState,
  extension: string,
  source: "paid" | "free",
  id: string,
  now: number,
  rng: () => number = Math.random,
): GameState {
  if (input.pending) throw Error("Une ouverture est déjà en cours");
  if (input.lastReceipt?.id === id) throw Error("Achat déjà traité");
  const state = recharge(input, now);
  if (source === "paid" && state.drachmas < PRICE)
    throw Error("Drachmes insuffisantes");
  if (source === "free" && state.freeCharges < 1)
    throw Error("Aucune charge gratuite disponible");
  const cards = generatePack(extension, state.pity, rng);
  const collection = { ...state.collection };
  const discoveries = cards.map((card) => {
    const fresh = !collection[card.id];
    collection[card.id] = (collection[card.id] ?? 0) + 1;
    return fresh;
  });
  const receipt: Receipt = {
    id,
    extension,
    cards,
    discoveries,
    quantities: cards.map((c) => collection[c.id]!),
    createdAt: now,
    source,
  };
  return {
    ...state,
    drachmas: state.drachmas - (source === "paid" ? PRICE : 0),
    freeCharges: state.freeCharges - (source === "free" ? 1 : 0),
    rechargeAt:
      source === "free" && state.freeCharges === 2 ? now : state.rechargeAt,
    pity: cards.some((c) => c.rarity >= 4) ? 0 : state.pity + 1,
    collection,
    pending: receipt,
    lastReceipt: receipt,
  };
}
