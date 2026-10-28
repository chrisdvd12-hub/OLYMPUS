import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";
import { UNLIMITED_DRACHMAS } from "../config/testing";
import { purchase, type BoosterSource } from "../domain/boosters";
import { validProfileName } from "../domain/collection";
import { createStateCoordinator } from "./coordinator";
import { createSqlitePersistence } from "./sqlitePersistence";
import { createWebPersistence } from "./webPersistence";

const persistence =
  Platform.OS === "web"
    ? createWebPersistence()
    : createSqlitePersistence(() => SQLite.openDatabaseAsync("olympus.db"));
// Prepare the native connection while local fonts load; web persistence is
// immediately available and does not depend on SQLite WebAssembly startup.
if (Platform.OS !== "web")
  void (persistence as ReturnType<typeof createSqlitePersistence>)
    .prepare()
    .catch(() => {});
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
