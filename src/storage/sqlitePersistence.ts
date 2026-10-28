import { initialState, type GameState } from "../domain/boosters.ts";
import type { StatePersistence } from "./coordinator.ts";
export interface SqlTransaction {
  getFirstAsync<T>(query: string): Promise<T | null>;
  runAsync(query: string, value: string): Promise<unknown>;
}
export interface StateDatabase extends SqlTransaction {
  execAsync(sql: string): Promise<unknown>;
  withExclusiveTransactionAsync(
    update: (tx: SqlTransaction) => Promise<void>,
  ): Promise<void>;
  closeAsync(): Promise<void>;
}
export function createSqlitePersistence(
  open: () => Promise<StateDatabase>,
  now = Date.now,
): StatePersistence & { prepare(): Promise<void> } {
  let opening: Promise<StateDatabase> | null = null;
  function database(): Promise<StateDatabase> {
    if (!opening) {
      opening = (async () => {
        const db = await open();
        try {
          // Initialise once. FULL preserves durability; WAL allows readers alongside a write.
          await db.execAsync(
            "CREATE TABLE IF NOT EXISTS game (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL); PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL",
          );
          return db;
        } catch (error) {
          await db.closeAsync().catch(() => {});
          throw error;
        }
      })();
      const attempt = opening;
      void attempt.catch(() => {
        if (opening === attempt) opening = null;
      });
    }
    return opening;
  }
  return {
    async prepare() {
      await database();
    },
    async read() {
      const db = await database();
      const row = await db.getFirstAsync<{ data: string }>(
        "SELECT data FROM game WHERE id=1",
      );
      return row ? (JSON.parse(row.data) as GameState) : initialState(now());
    },
    async transact(update) {
      const db = await database();
      let result: GameState | undefined;
      await db.withExclusiveTransactionAsync(async (tx) => {
        const row = await tx.getFirstAsync<{ data: string }>(
          "SELECT data FROM game WHERE id=1",
        );
        const current = row
          ? (JSON.parse(row.data) as GameState)
          : initialState(now());
        result = update(current);
        const serialized = JSON.stringify(result);
        if (serialized !== row?.data) {
          await tx.runAsync(
            "INSERT INTO game(id,data) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data",
            serialized,
          );
        }
      });
      // Notify only once the exclusive transaction has actually committed.
      return result!;
    },
  };
}
