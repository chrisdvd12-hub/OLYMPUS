import * as SQLite from "expo-sqlite";
import { UNLIMITED_DRACHMAS } from "../config/testing";
import { purchase, type BoosterSource } from "../domain/boosters";
import { validProfileName } from "../domain/collection";
import { createStateCoordinator } from "./coordinator";
import { createSqlitePersistence } from "./sqlitePersistence";

const persistence = createSqlitePersistence(() =>
  SQLite.openDatabaseAsync("olympus.db"),
);
// Prepare the connection while local fonts load; a failure is retried by the first sync.
void persistence.prepare().catch(() => {});
export const gameStore = createStateCoordinator(persistence);
export const subscribe = gameStore.subscribe;
export const getSnapshot = gameStore.getSnapshot;
export const transact = gameStore.mutate;
export const refresh = gameStore.refresh;
export const readState = () => refresh(false, true);
export const buy = (
  extension: string,
  source: Exclude<BoosterSource, "free">,
  id: string,
) =>
  transact((state) =>
    purchase(state, extension, source, id, Date.now(), Math.random, {
      unlimitedDrachmas: UNLIMITED_DRACHMAS,
    }),
  );
export const finish = (id: string) =>
  transact((state) =>
    state.pending?.id === id ? { ...state, pending: null } : state,
  );
export const savePlayerName = (name: string) =>
  transact((state) => {
    const playerName = validProfileName(name);
    return state.playerName === playerName ? state : { ...state, playerName };
  });
