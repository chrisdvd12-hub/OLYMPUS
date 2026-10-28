import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { setImmediate } from "node:timers/promises";
import {
  initialState,
  purchase,
  type GameState,
} from "../src/domain/boosters.ts";
import { DAILY_REWARD_MS } from "../src/domain/daily.ts";
import {
  createStateCoordinator,
  type StatePersistence,
} from "../src/storage/coordinator.ts";
import {
  createSqlitePersistence,
  type StateDatabase,
} from "../src/storage/sqlitePersistence.ts";

async function harness(
  seed: GameState = { ...initialState(0), dailyNextAt: DAILY_REWARD_MS },
) {
  const db = new DatabaseSync(":memory:");
  const counts = { opens: 0, init: 0, reads: 0, writes: 0 };
  const control = { fail: false, gate: null as Promise<void> | null, now: 0 };
  const getFirstAsync = async <T>(sql: string): Promise<T | null> => {
    counts.reads++;
    return (db.prepare(sql).get() as T) ?? null;
  };
  const runAsync = async (sql: string, value: string) => {
    counts.writes++;
    return db.prepare(sql).run(value);
  };
  const connection: StateDatabase = {
    getFirstAsync,
    runAsync,
    execAsync: async (sql) => {
      counts.init++;
      db.exec(sql);
    },
    closeAsync: async () => db.close(),
    withExclusiveTransactionAsync: async (update) => {
      db.exec("BEGIN");
      try {
        await update({ getFirstAsync, runAsync });
        if (control.gate) await control.gate;
        if (control.fail) {
          control.fail = false;
          throw Error("Échec de transaction simulé");
        }
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
  };
  const persistence = createSqlitePersistence(
    async () => {
      counts.opens++;
      return connection;
    },
    () => control.now,
  );
  await persistence.prepare();
  db.prepare("INSERT INTO game(id,data) VALUES(1,?)").run(JSON.stringify(seed));
  const store = createStateCoordinator(
    persistence,
    () => control.now,
    () => 0,
  );
  return { store, persistence, db, counts, control };
}

test("synchronisation : une seule initialisation SQLite et lecture pour 20 demandes simultanées", async () => {
  const { store, db, counts } = await harness();
  let notifications = 0;
  store.subscribe(() => notifications++);
  const requests = Array.from({ length: 20 }, () => store.refresh(true, true));
  assert.ok(requests.every((request) => request === requests[0]));
  const states = await Promise.all(requests);
  assert.ok(states.every((state) => state === states[0]));
  assert.deepEqual(counts, { opens: 1, init: 1, reads: 1, writes: 0 });
  assert.equal(notifications, 1);
  db.close();
});

test("veille active : 20 actualisations sans changement ne lisent ni ne réécrivent la sauvegarde", async () => {
  const { store, db, counts } = await harness();
  const initial = await store.refresh(true, true);
  const before = { ...counts };
  let notifications = 0;
  store.subscribe(() => notifications++);
  for (let i = 0; i < 20; i++) assert.equal(await store.refresh(true), initial);
  assert.deepEqual(counts, before);
  assert.equal(notifications, 0);
  assert.equal(await store.refresh(true, true), initial);
  assert.equal(counts.reads, before.reads + 1);
  assert.equal(counts.writes, 0);
  assert.equal(notifications, 0);
  db.close();
});

test("offrande à échéance : deux boosters attribués une seule fois, y compris pendant une ouverture", async () => {
  const seed = purchase(
    initialState(0),
    "olympe",
    "paid",
    "receipt",
    0,
    () => 0,
  );
  const { store, db, counts, control } = await harness({
    ...seed,
    dailyNextAt: DAILY_REWARD_MS,
  });
  const previous = await store.refresh(true, true);
  control.now = DAILY_REWARD_MS;
  const states = await Promise.all(
    Array.from({ length: 20 }, (_, index) =>
      store.refresh(true, index % 2 === 0),
    ),
  );
  assert.equal(counts.writes, 1);
  assert.equal(states[0]!.dailyPacks?.length, 2);
  assert.equal(states[0]!.pending, previous.pending);
  assert.equal(states[0]!.collection, previous.collection);
  assert.equal(states[0]!.drachmas, previous.drachmas);
  assert.equal(states[0]!.dailyNextAt, 2 * DAILY_REWARD_MS);
  db.close();
});

test("achat : l’interface attend le COMMIT, jamais d’attribution optimiste", async () => {
  const { store, db, control } = await harness();
  const previous = await store.refresh();
  let release!: () => void;
  control.gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const bought = store.mutate((state) =>
    purchase(state, "olympe", "paid", "one", 0, () => 0),
  );
  await setImmediate();
  assert.equal(store.getSnapshot(), previous);
  assert.equal(store.getSnapshot()!.pending, null);
  release();
  await bought;
  assert.equal(store.getSnapshot()!.pending!.cards.length, 7);
  assert.equal(store.getSnapshot()!.drachmas, 400);
  db.close();
});

test("transactions concurrentes : un seul achat, puis la file reste utilisable", async () => {
  const { store, db } = await harness();
  await store.refresh();
  const results = await Promise.allSettled(
    ["one", "two"].map((id) =>
      store.mutate((state) =>
        purchase(state, "olympe", "paid", id, 0, () => 0),
      ),
    ),
  );
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(store.getSnapshot()!.drachmas, 400);
  assert.equal(
    Object.values(store.getSnapshot()!.collection).reduce((a, b) => a + b, 0),
    7,
  );
  await store.mutate((state) => ({ ...state, pending: null }));
  await store.mutate((state) =>
    purchase(state, "titans", "paid", "three", 0, () => 0),
  );
  assert.equal(store.getSnapshot()!.drachmas, 300);
  db.close();
});

test("erreur de sauvegarde : rollback sans notification, reprise sans double débit", async () => {
  const { store, db, control } = await harness();
  const previous = await store.refresh();
  let notifications = 0;
  store.subscribe(() => notifications++);
  control.fail = true;
  await assert.rejects(
    store.mutate((state) =>
      purchase(state, "olympe", "paid", "one", 0, () => 0),
    ),
  );
  assert.equal(store.getSnapshot(), previous);
  assert.equal(notifications, 0);
  await store.refresh(false, true);
  assert.equal(store.getSnapshot(), previous);
  const next = await store.mutate((state) =>
    purchase(state, "olympe", "paid", "one", 0, () => 0),
  );
  assert.equal(next.drachmas, 400);
  assert.equal(next.pending!.cards.length, 7);
  db.close();
});

test("profil et notifications : collection/reçu stables, erreur d’abonné sans faux échec d’achat", async () => {
  const { store, db } = await harness();
  await store.mutate((state) =>
    purchase(state, "olympe", "paid", "one", 0, () => 0),
  );
  const previous = store.getSnapshot()!;
  store.subscribe(() => {
    throw Error("Abonné défaillant");
  });
  await store.mutate((state) => ({ ...state, playerName: "Ariane" }));
  assert.equal(store.getSnapshot()!.collection, previous.collection);
  assert.equal(store.getSnapshot()!.pending, previous.pending);
  assert.equal(store.getSnapshot()!.playerName, "Ariane");
  db.close();
});

test("reprise à froid : même reçu et progression ; actualisation forcée sans état périmé", async () => {
  const { store, persistence, db } = await harness();
  const bought = await store.mutate((state) =>
    purchase(state, "creatures", "paid", "persist", 0, () => 0),
  );
  const resumed = createStateCoordinator(
    persistence,
    () => 0,
    () => 0.9,
  );
  const restored = await resumed.refresh(true, true);
  assert.deepEqual(restored.pending, bought.pending);
  assert.deepEqual(restored.collection, bought.collection);
  const updated = { ...restored, playerName: "Iris" };
  db.prepare("UPDATE game SET data=? WHERE id=1").run(JSON.stringify(updated));
  await resumed.refresh(false, true);
  assert.equal(resumed.getSnapshot()!.playerName, "Iris");
  assert.equal(resumed.getSnapshot()!.pending, restored.pending);
  db.close();
});

test("échec de lecture : demandes groupées rejetées, tentative suivante possible", async () => {
  let fail = true;
  const state = initialState(0);
  const persistence: StatePersistence = {
    read: async () => {
      if (fail) throw Error("Lecture impossible");
      return state;
    },
    transact: async (update) => update(state),
  };
  const store = createStateCoordinator(persistence, () => 0);
  await assert.rejects(store.refresh());
  assert.equal(store.getSnapshot(), null);
  fail = false;
  assert.equal(await store.refresh(), state);
});

test("connexion SQLite : initialisation défaillante fermée, puis réouverture unique", async () => {
  let opens = 0,
    setups = 0,
    closes = 0;
  const persistence = createSqlitePersistence(
    async () => {
      opens++;
      return {
        execAsync: async () => {
          setups++;
          if (setups === 1) throw Error("Verrou temporaire");
        },
        getFirstAsync: async () => null,
        runAsync: async () => {},
        closeAsync: async () => {
          closes++;
        },
        withExclusiveTransactionAsync: async () => {},
      };
    },
    () => 0,
  );
  await assert.rejects(persistence.prepare());
  await Promise.all([
    persistence.prepare(),
    persistence.prepare(),
    persistence.read(),
  ]);
  assert.equal(opens, 2);
  assert.equal(setups, 2);
  assert.equal(closes, 1);
});

test("SQLite web : la table existe même si le pilote n’exécute que la première instruction", async () => {
  const db = new DatabaseSync(":memory:");
  const persistence = createSqlitePersistence(
    async () => ({
      execAsync: async (sql) => {
        const firstStatement = sql.split(";").find((part) => part.trim());
        if (firstStatement) db.exec(firstStatement);
      },
      getFirstAsync: async <T>(sql: string) =>
        (db.prepare(sql).get() as T) ?? null,
      runAsync: async (sql, value) => db.prepare(sql).run(value),
      closeAsync: async () => db.close(),
      withExclusiveTransactionAsync: async (update) => {
        await update({
          getFirstAsync: async <T>(sql: string) =>
            (db.prepare(sql).get() as T) ?? null,
          runAsync: async (sql, value) => db.prepare(sql).run(value),
        });
      },
    }),
    () => 123,
  );
  await persistence.prepare();
  assert.deepEqual(await persistence.read(), initialState(123));
  db.close();
});
