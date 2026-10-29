import { CARDS, EXTENSIONS } from "./catalog.ts";

export interface OpeningHistoryEntry {
  id: string;
  extension: string;
  createdAt: number;
  cardIds: string[];
  rarities: number[];
  discoveries: number;
}

export interface PeriodProgress {
  key: string;
  boostersOpened: number;
  cardsDiscovered: number;
  mythologyCardIds: string[];
  loggedIn: number;
}

export interface ProgressionState {
  startedAt: number;
  xp: number;
  boostersOpened: number;
  mythologyViews: number;
  recentDiscoveries: string[];
  history: OpeningHistoryEntry[];
  daily: PeriodProgress;
  weekly: PeriodProgress;
  claimedMissions: string[];
  unlockedAchievements: Record<string, number>;
  claimedAchievements: string[];
}

export interface GameSettings {
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
  vibrationsEnabled: boolean;
  volume: number;
}

export const DEFAULT_SETTINGS: GameSettings = {
  musicEnabled: false,
  soundEffectsEnabled: false,
  vibrationsEnabled: true,
  volume: 0.55,
};

export const DAILY_MISSIONS = [
  { id: "daily-login", title: "Présence au sanctuaire", description: "Se connecter au jeu", target: 1, reward: 20 },
  { id: "daily-open", title: "Offrande quotidienne", description: "Ouvrir un booster", target: 1, reward: 40 },
  { id: "daily-discover", title: "Nouvelle légende", description: "Découvrir une nouvelle carte", target: 1, reward: 50 },
  { id: "daily-read", title: "Mémoire des anciens", description: "Consulter trois fiches mythologiques", target: 3, reward: 30 },
] as const;

export const WEEKLY_MISSIONS = [
  { id: "weekly-open", title: "Rituel des sept", description: "Ouvrir sept boosters", target: 7, reward: 120 },
  { id: "weekly-discover", title: "Cartographe des mythes", description: "Découvrir dix nouvelles cartes", target: 10, reward: 180 },
  { id: "weekly-read", title: "Archiviste de l’Olympe", description: "Consulter douze fiches mythologiques", target: 12, reward: 100 },
  { id: "weekly-extension", title: "Fragment de collection", description: "Réunir cinq cartes d’une même extension", target: 5, reward: 150 },
] as const;

export const ACHIEVEMENTS = [
  { id: "first-card", title: "Premier vestige", description: "Obtenir une première carte", target: 1, reward: 25 },
  { id: "first-booster", title: "Première offrande", description: "Ouvrir un premier booster", target: 1, reward: 25 },
  { id: "ten-boosters", title: "Rituel accompli", description: "Ouvrir dix boosters", target: 10, reward: 100 },
  { id: "first-legendary", title: "Éclat légendaire", description: "Obtenir une carte Légendaire", target: 1, reward: 75 },
  { id: "first-mythic", title: "Constellation mythique", description: "Obtenir une carte Mythique", target: 1, reward: 125 },
  { id: "first-divine", title: "Faveur divine", description: "Obtenir une carte Divine", target: 1, reward: 250 },
  { id: "complete-extension", title: "Gardien d’un sanctuaire", description: "Compléter une extension", target: 30, reward: 300 },
  { id: "complete-collection", title: "Collectionneur Éternel", description: "Réunir les 120 cartes", target: 120, reward: 1000 },
] as const;

export type MissionDefinition = (typeof DAILY_MISSIONS)[number] | (typeof WEEKLY_MISSIONS)[number];
export type AchievementDefinition = (typeof ACHIEVEMENTS)[number];

function localDayKey(now: number) {
  const date = new Date(now);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function localWeekKey(now: number) {
  const date = new Date(now);
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (local.getDay() + 6) % 7;
  local.setDate(local.getDate() - day);
  return localDayKey(local.getTime());
}

function emptyPeriod(key: string): PeriodProgress {
  return { key, boostersOpened: 0, cardsDiscovered: 0, mythologyCardIds: [], loggedIn: 0 };
}

export function createProgression(now: number): ProgressionState {
  const daily = emptyPeriod(localDayKey(now));
  const weekly = emptyPeriod(localWeekKey(now));
  return {
    startedAt: now,
    xp: 0,
    boostersOpened: 0,
    mythologyViews: 0,
    recentDiscoveries: [],
    history: [],
    daily: { ...daily, loggedIn: 1 },
    weekly: { ...weekly, loggedIn: 1 },
    claimedMissions: [],
    unlockedAchievements: {},
    claimedAchievements: [],
  };
}

export function currentProgression(input: ProgressionState | undefined, now: number): ProgressionState {
  const base = input ?? createProgression(now);
  const dailyKey = localDayKey(now);
  const weeklyKey = localWeekKey(now);
  return {
    ...base,
    daily: base.daily?.key === dailyKey ? base.daily : emptyPeriod(dailyKey),
    weekly: base.weekly?.key === weeklyKey ? base.weekly : emptyPeriod(weeklyKey),
    recentDiscoveries: base.recentDiscoveries ?? [],
    history: base.history ?? [],
    claimedMissions: base.claimedMissions ?? [],
    unlockedAchievements: base.unlockedAchievements ?? {},
    claimedAchievements: base.claimedAchievements ?? [],
  };
}

interface ProgressGame {
  drachmas: number;
  collection: Record<string, number>;
  progression?: ProgressionState;
}

function ownedAtRarity(collection: Record<string, number>, rarity: number) {
  return CARDS.some((card) => card.rarity === rarity && (collection[card.id] ?? 0) > 0) ? 1 : 0;
}

export function achievementProgress(state: ProgressGame, id: string): number {
  const progression = state.progression;
  const owned = CARDS.filter((card) => (state.collection[card.id] ?? 0) > 0).length;
  switch (id) {
    case "first-card": return owned;
    case "first-booster": return progression?.boostersOpened ?? 0;
    case "ten-boosters": return progression?.boostersOpened ?? 0;
    case "first-legendary": return ownedAtRarity(state.collection, 4);
    case "first-mythic": return ownedAtRarity(state.collection, 5);
    case "first-divine": return ownedAtRarity(state.collection, 6);
    case "complete-extension": return Math.max(0, ...EXTENSIONS.map((extension) => CARDS.filter((card) => card.extension === extension.id && (state.collection[card.id] ?? 0) > 0).length));
    case "complete-collection": return owned;
    default: return 0;
  }
}

export function syncAchievements<T extends ProgressGame>(state: T, now: number): T {
  let progression = currentProgression(state.progression, now);
  const unlocked = { ...progression.unlockedAchievements };
  for (const achievement of ACHIEVEMENTS)
    if (!unlocked[achievement.id] && achievementProgress({ ...state, progression }, achievement.id) >= achievement.target)
      unlocked[achievement.id] = now;
  progression = { ...progression, unlockedAchievements: unlocked };
  return { ...state, progression };
}

export function recordLogin<T extends ProgressGame>(state: T, now: number): T {
  const progression = currentProgression(state.progression, now);
  const next = {
    ...state,
    progression: {
      ...progression,
      daily: { ...progression.daily, loggedIn: 1 },
      weekly: { ...progression.weekly, loggedIn: 1 },
    },
  };
  return syncAchievements(next, now);
}

export interface ProgressReceipt {
  id: string;
  extension: string;
  createdAt: number;
  cards: { id: string; rarity: number }[];
  discoveries: boolean[];
}

export function recordBoosterOpening<T extends ProgressGame>(state: T, receipt: ProgressReceipt): T {
  const progression = currentProgression(state.progression, receipt.createdAt);
  const discoveries = receipt.discoveries.filter(Boolean).length;
  const discoveredIds = receipt.cards.filter((_card, index) => receipt.discoveries[index]).map((card) => card.id);
  const historyEntry: OpeningHistoryEntry = {
    id: receipt.id,
    extension: receipt.extension,
    createdAt: receipt.createdAt,
    cardIds: receipt.cards.map((card) => card.id),
    rarities: receipt.cards.map((card) => card.rarity),
    discoveries,
  };
  const rarityXp = receipt.cards.reduce((sum, card) => sum + card.rarity * 3, 0);
  const next = {
    ...state,
    progression: {
      ...progression,
      xp: progression.xp + 25 + discoveries * 20 + rarityXp,
      boostersOpened: progression.boostersOpened + 1,
      recentDiscoveries: [...discoveredIds, ...progression.recentDiscoveries.filter((id) => !discoveredIds.includes(id))].slice(0, 30),
      history: [historyEntry, ...progression.history].slice(0, 100),
      daily: { ...progression.daily, boostersOpened: progression.daily.boostersOpened + 1, cardsDiscovered: progression.daily.cardsDiscovered + discoveries },
      weekly: { ...progression.weekly, boostersOpened: progression.weekly.boostersOpened + 1, cardsDiscovered: progression.weekly.cardsDiscovered + discoveries },
    },
  };
  return syncAchievements(next, receipt.createdAt);
}

export function recordMythologyVisit<T extends ProgressGame>(state: T, cardId: string, now: number): T {
  if (!CARDS.some((card) => card.id === cardId)) return state;
  const progression = currentProgression(state.progression, now);
  const addUnique = (ids: string[]) => ids.includes(cardId) ? ids : [...ids, cardId];
  return syncAchievements({
    ...state,
    progression: {
      ...progression,
      xp: progression.xp + 2,
      mythologyViews: progression.mythologyViews + 1,
      daily: { ...progression.daily, mythologyCardIds: addUnique(progression.daily.mythologyCardIds) },
      weekly: { ...progression.weekly, mythologyCardIds: addUnique(progression.weekly.mythologyCardIds) },
    },
  }, now);
}

export interface ObjectiveStatus<T> {
  definition: T;
  value: number;
  complete: boolean;
  claimed: boolean;
  claimKey: string;
}

export function missionStatuses(state: ProgressGame, now: number): ObjectiveStatus<MissionDefinition>[] {
  const progression = currentProgression(state.progression, now);
  const extensionProgress = Math.max(0, ...EXTENSIONS.map((extension) => CARDS.filter((card) => card.extension === extension.id && (state.collection[card.id] ?? 0) > 0).length));
  const value = (id: string) => {
    if (id === "daily-login") return progression.daily.loggedIn;
    if (id === "daily-open") return progression.daily.boostersOpened;
    if (id === "daily-discover") return progression.daily.cardsDiscovered;
    if (id === "daily-read") return progression.daily.mythologyCardIds.length;
    if (id === "weekly-open") return progression.weekly.boostersOpened;
    if (id === "weekly-discover") return progression.weekly.cardsDiscovered;
    if (id === "weekly-read") return progression.weekly.mythologyCardIds.length;
    return extensionProgress;
  };
  return [...DAILY_MISSIONS, ...WEEKLY_MISSIONS].map((definition) => {
    const periodKey = definition.id.startsWith("daily-") ? progression.daily.key : progression.weekly.key;
    const claimKey = `${periodKey}:${definition.id}`;
    const current = value(definition.id);
    return { definition, value: current, complete: current >= definition.target, claimed: progression.claimedMissions.includes(claimKey), claimKey };
  });
}

export function claimMission<T extends ProgressGame>(state: T, missionId: string, now: number): T {
  const status = missionStatuses(state, now).find((item) => item.definition.id === missionId);
  if (!status || !status.complete) throw Error("Mission non terminée");
  if (status.claimed) throw Error("Récompense déjà réclamée");
  const progression = currentProgression(state.progression, now);
  return {
    ...state,
    drachmas: state.drachmas + status.definition.reward,
    progression: { ...progression, xp: progression.xp + status.definition.reward, claimedMissions: [...progression.claimedMissions, status.claimKey] },
  };
}

export function achievementStatuses(state: ProgressGame, now: number): ObjectiveStatus<AchievementDefinition>[] {
  const synced = syncAchievements(state, now);
  const progression = currentProgression(synced.progression, now);
  return ACHIEVEMENTS.map((definition) => {
    const value = achievementProgress(synced, definition.id);
    return {
      definition,
      value,
      complete: !!progression.unlockedAchievements[definition.id],
      claimed: progression.claimedAchievements.includes(definition.id),
      claimKey: definition.id,
    };
  });
}

export function claimAchievement<T extends ProgressGame>(state: T, achievementId: string, now: number): T {
  const synced = syncAchievements(state, now);
  const status = achievementStatuses(synced, now).find((item) => item.definition.id === achievementId);
  if (!status?.complete) throw Error("Succès non débloqué");
  if (status.claimed) throw Error("Récompense déjà réclamée");
  const progression = currentProgression(synced.progression, now);
  return {
    ...synced,
    drachmas: synced.drachmas + status.definition.reward,
    progression: { ...progression, xp: progression.xp + status.definition.reward, claimedAchievements: [...progression.claimedAchievements, achievementId] },
  };
}

export function collectorLevel(xp: number) {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1);
}

export function collectorTitle(level: number) {
  if (level >= 15) return "Collectionneur Éternel";
  if (level >= 10) return "Maître du Panthéon";
  if (level >= 7) return "Archiviste Divin";
  if (level >= 4) return "Gardien des Mythes";
  return "Novice de l’Olympe";
}
