import { EXTENSIONS } from "./catalog.ts";
import type { GameState } from "./boosters.ts";

export const DAILY_REWARD_MS = 24 * 60 * 60 * 1000;

// A visit after 24 hours grants two packs. No rewards accrue while absent.
export function grantDailyBoosters(
  state: GameState,
  now: number,
  rng: () => number = Math.random,
): GameState {
  if (!Number.isFinite(now)) throw Error("Date invalide");
  // Older saves without the offering clock start a full 24-hour countdown.
  if (state.dailyNextAt === undefined)
    return { ...state, dailyNextAt: now + DAILY_REWARD_MS };
  if (now < state.dailyNextAt) return state;
  const packs = Array.from({ length: 2 }, () => {
    const value = rng();
    if (!Number.isFinite(value) || value < 0 || value >= 1)
      throw Error("Aléatoire invalide");
    return EXTENSIONS[Math.floor(value * EXTENSIONS.length)]!.id;
  });
  return {
    ...state,
    dailyNextAt: now + DAILY_REWARD_MS,
    dailyPacks: [...(state.dailyPacks ?? []), ...packs],
  };
}

export function dailyCountdown(nextAt: number, now: number): string {
  const seconds = Math.max(0, Math.ceil((nextAt - now) / 1000));
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
}
