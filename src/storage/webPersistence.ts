import { initialState, type GameState } from "../domain/boosters.ts";
import type { StatePersistence } from "./coordinator.ts";

interface BrowserStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const STORAGE_KEY = "olympus.game.v1";

export function createWebPersistence(
  provided?: BrowserStorage,
  now = Date.now,
): StatePersistence {
  let volatileValue: string | null = null;

  function storage(): BrowserStorage | null {
    if (provided) return provided;
    try {
      return globalThis.localStorage;
    } catch {
      return null;
    }
  }

  function readCurrent(): GameState {
    let raw: string | null;
    try {
      raw = storage()?.getItem(STORAGE_KEY) ?? volatileValue;
    } catch {
      raw = volatileValue;
    }
    if (!raw) return initialState(now());
    try {
      return JSON.parse(raw) as GameState;
    } catch {
      return initialState(now());
    }
  }

  function writeCurrent(state: GameState) {
    const serialized = JSON.stringify(state);
    volatileValue = serialized;
    try {
      storage()?.setItem(STORAGE_KEY, serialized);
    } catch {
      // Safari private mode can reject persistent writes. The current session
      // remains usable through the in-memory fallback.
    }
  }

  return {
    async read() {
      return readCurrent();
    },
    async transact(update) {
      const current = readCurrent();
      const next = update(current);
      if (next !== current) writeCurrent(next);
      return next;
    },
  };
}
