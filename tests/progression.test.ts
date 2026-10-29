import { test } from "node:test";
import assert from "node:assert/strict";
import { initialState, purchase, type GameState } from "../src/domain/boosters.ts";
import {
  achievementStatuses,
  claimAchievement,
  claimMission,
  currentProgression,
  missionStatuses,
  recordLogin,
  recordMythologyVisit,
} from "../src/domain/progression.ts";

const DAY = 24 * 60 * 60 * 1000;

test("progression : une ouverture enregistrée alimente historique, XP et missions", () => {
  const opened = purchase(initialState(0), "olympe", "paid", "progress-1", 1000, () => 0);
  const progress = currentProgression(opened.progression, 1000);
  assert.equal(progress.boostersOpened, 1);
  assert.equal(progress.history.length, 1);
  assert.equal(progress.history[0]!.cardIds.length, 7);
  assert.ok(progress.xp > 0);
  assert.equal(missionStatuses(opened, 1000).find((item) => item.definition.id === "daily-open")!.complete, true);
});

test("missions : récompense persistante attribuée une seule fois", () => {
  const opened = purchase(initialState(0), "olympe", "paid", "progress-2", 1000, () => 0);
  const rewarded = claimMission(opened, "daily-open", 1000);
  assert.equal(rewarded.drachmas, opened.drachmas + 40);
  assert.throws(() => claimMission(rewarded, "daily-open", 1000), /déjà/);
  assert.equal(missionStatuses(rewarded, 1000).find((item) => item.definition.id === "daily-open")!.claimed, true);
});

test("missions : les consultations sont uniques par période et se réinitialisent", () => {
  let state = recordLogin(initialState(0), 1000);
  state = recordMythologyVisit(state, "olympe-1", 1000);
  state = recordMythologyVisit(state, "olympe-1", 1200);
  state = recordMythologyVisit(state, "olympe-2", 1400);
  assert.equal(currentProgression(state.progression, 1400).daily.mythologyCardIds.length, 2);
  assert.equal(currentProgression(state.progression, DAY + 1000).daily.mythologyCardIds.length, 0);
});

test("succès : déblocage daté, récompense unique et collection intacte", () => {
  const opened = purchase(initialState(0), "olympe", "paid", "progress-3", 1000, () => 0);
  const status = achievementStatuses(opened, 1000).find((item) => item.definition.id === "first-booster")!;
  assert.equal(status.complete, true);
  const rewarded = claimAchievement(opened, "first-booster", 1000);
  assert.deepEqual(rewarded.collection, opened.collection);
  assert.equal(rewarded.drachmas, opened.drachmas + 25);
  assert.throws(() => claimAchievement(rewarded, "first-booster", 1000), /déjà/);
});

test("migration : une sauvegarde antérieure reste exploitable sans perte", () => {
  const old = {
    version: 1,
    drachmas: 300,
    freeCharges: 1,
    rechargeAt: 0,
    pity: 7,
    collection: { "olympe-1": 2 },
    pending: null,
    lastReceipt: null,
  } as GameState;
  const visited = recordMythologyVisit(old, "olympe-1", 5000);
  assert.equal(visited.collection["olympe-1"], 2);
  assert.equal(visited.drachmas, 300);
  assert.equal(visited.pity, 7);
  assert.ok(visited.progression);
});
