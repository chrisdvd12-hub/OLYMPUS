import * as SQLite from "expo-sqlite";
import { UNLIMITED_DRACHMAS } from "../config/testing";
import {
  initialState,
  purchase,
  recharge,
  type GameState,
  type BoosterSource,
} from "../domain/boosters";
import { grantDailyBoosters } from "../domain/daily";
const dbPromise = SQLite.openDatabaseAsync("olympus.db");
async function database() {
  const db = await dbPromise;
  await db.execAsync(
    "CREATE TABLE IF NOT EXISTS game (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL)",
  );
  return db;
}
export async function readState(): Promise<GameState> {
  const db = await database();
  const row = await db.getFirstAsync<{ data: string }>(
    "SELECT data FROM game WHERE id=1",
  );
  return row ? (JSON.parse(row.data) as GameState) : initialState(Date.now());
}
// Une seule ligne transactionnelle contient le solde, la collection, les garanties et le reçu.
let queue: Promise<unknown> = Promise.resolve();
export function transact(
  update: (state: GameState) => GameState,
): Promise<GameState> {
  const task = queue.then(async () => {
    const db = await database();
    let result: GameState | undefined;
    await db.withExclusiveTransactionAsync(async (tx) => {
      const row = await tx.getFirstAsync<{ data: string }>(
        "SELECT data FROM game WHERE id=1",
      );
      const state = row
        ? (JSON.parse(row.data) as GameState)
        : initialState(Date.now());
      result = update(state);
      await tx.runAsync(
        "INSERT INTO game(id,data) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data",
        JSON.stringify(result),
      );
    });
    return result!;
  });
  queue = task.catch(() => {});
  return task;
}
export const buy = (extension: string, source: BoosterSource, id: string) =>
  transact((s) =>
    purchase(s, extension, source, id, Date.now(), Math.random, {
      unlimitedDrachmas: UNLIMITED_DRACHMAS,
    }),
  );
export const finish = (id: string) =>
  transact((s) => (s.pending?.id === id ? { ...s, pending: null } : s));
export const refresh = (dailyVisit = false) => transact((s) => {
  const now = Date.now();
  const state = recharge(s, now);
  return dailyVisit ? grantDailyBoosters(state, now) : state;
});
