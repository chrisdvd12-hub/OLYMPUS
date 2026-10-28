import type { GameState } from "../domain/boosters.ts";
import { grantDailyBoosters } from "../domain/daily.ts";
export interface StatePersistence {
  read(): Promise<GameState>;
  transact(update: (state: GameState) => GameState): Promise<GameState>;
}
function equalRecord(a: Record<string, number>, b: Record<string, number>) {
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => a[key] === b[key])
  );
}
function equalValue(a: unknown, b: unknown) {
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}
// Keep unchanged branches stable so an offering/profile update does not repaint the album.
export function shareCommittedState(
  previous: GameState | null,
  next: GameState,
): GameState {
  if (!previous) return next;
  const shared = { ...next };
  if (equalRecord(previous.collection, next.collection))
    shared.collection = previous.collection;
  if (equalValue(previous.pending, next.pending))
    shared.pending = previous.pending;
  if (equalValue(previous.lastReceipt, next.lastReceipt))
    shared.lastReceipt = previous.lastReceipt;
  if (equalValue(previous.dailyPacks, next.dailyPacks) && "dailyPacks" in next)
    shared.dailyPacks = previous.dailyPacks;
  const keys = Object.keys(shared) as (keyof GameState)[];
  return keys.length === Object.keys(previous).length &&
    keys.every((key) => Object.is(previous[key], shared[key]))
    ? previous
    : shared;
}
export function createStateCoordinator(
  persistence: StatePersistence,
  now = Date.now,
  rng = Math.random,
) {
  let snapshot: GameState | null = null;
  let queue: Promise<unknown> = Promise.resolve();
  const listeners = new Set<() => void>();
  const refreshes = new Map<string, Promise<GameState>>();
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const task = queue.then(operation);
    queue = task.catch(() => {});
    return task;
  }
  function publish(state: GameState): GameState {
    const next = shareCommittedState(snapshot, state);
    if (snapshot !== next) {
      snapshot = next;
      for (const listener of listeners) {
        // A subscriber error must never turn a successfully committed purchase into a failure.
        try {
          listener();
        } catch {
          /* React will report its own rendering errors. */
        }
      }
    }
    return next;
  }
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    mutate: (update: (state: GameState) => GameState) =>
      enqueue(async () => publish(await persistence.transact(update))),
    refresh(dailyVisit = false, reload = false): Promise<GameState> {
      const key = `${dailyVisit}:${reload}`;
      const existing = refreshes.get(key);
      if (existing) return existing;
      const task = enqueue(async () => {
        let state = snapshot && !reload ? snapshot : await persistence.read();
        const timestamp = now();
        if (
          dailyVisit &&
          (state.dailyNextAt === undefined || timestamp >= state.dailyNextAt)
        ) {
          // Recheck in the transaction: overlapping requests cannot award twice.
          state = await persistence.transact((current) =>
            grantDailyBoosters(current, timestamp, rng),
          );
        }
        return publish(state);
      });
      refreshes.set(key, task);
      const clear = () => {
        if (refreshes.get(key) === task) refreshes.delete(key);
      };
      void task.then(clear, clear);
      return task;
    },
  };
}
