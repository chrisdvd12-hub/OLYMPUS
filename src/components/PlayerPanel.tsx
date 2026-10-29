import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Switch, TextInput, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { collectionStats } from "../domain/collection";
import { CARDS, COLORS, EXTENSIONS, RARITIES } from "../domain/catalog";
import type { GameState } from "../domain/boosters";
import {
  achievementStatuses,
  collectorLevel,
  collectorTitle,
  currentProgression,
  DEFAULT_SETTINGS,
  missionStatuses,
  type GameSettings,
} from "../domain/progression";
import { useGraphicsQuality, type GraphicsPreference } from "../performance/graphicsQuality";
import { AppText as Text } from "./AppText";
import { fonts, styles, theme } from "./theme";
import { PerformanceDiagnostics } from "./PerformanceDiagnostics";
import { PACK_ART } from "./packArt";
import { OlympusIcon, OlympusMarblePanel, OlympusProgressBar, OlympusSectionTitle, OlympusStatCard } from "./OlympusUI";

const DATE = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

function ProgressBar({ value, max }: { value: number; max: number }) {
  return <OlympusProgressBar value={value} max={max} />;
}

export function PlayerPanel({
  state,
  onSave,
  onClaimMission,
  onClaimAchievement,
  onSaveSettings,
  missions = false,
  achievementsOnly = false,
  reduced = false,
}: {
  state: GameState;
  onSave: (name: string) => Promise<void>;
  onClaimMission: (id: string) => Promise<unknown>;
  onClaimAchievement: (id: string) => Promise<unknown>;
  onSaveSettings: (settings: Partial<GameSettings>) => Promise<unknown>;
  missions?: boolean;
  achievementsOnly?: boolean;
  reduced?: boolean;
}) {
  const { width } = useWindowDimensions();
  const compact = width < 420;
  const [name, setName] = useState(state.playerName ?? "Collectionneur");
  const [editingName, setEditingName] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const stats = useMemo(() => collectionStats(state.collection), [state.collection]);
  const progression = currentProgression(state.progression, Date.now());
  const missionItems = missionStatuses({ ...state, progression }, Date.now());
  const achievements = achievementStatuses({ ...state, progression }, Date.now());
  const settings = { ...DEFAULT_SETTINGS, ...state.settings };
  const level = collectorLevel(progression.xp);
  const preferred = [...stats.byExtension].sort((a, b) => b.owned - a.owned)[0];
  const exceptional = stats.byRarity.slice(4).reduce((total, rarity) => total + rarity.owned, 0);
  const { preference, automaticTier, setPreference } = useGraphicsQuality();
  const levelStartXp = (level - 1) ** 2 * 100;
  const nextLevelXp = level ** 2 * 100;
  const levelXp = Math.max(0, progression.xp - levelStartXp);
  const levelTarget = Math.max(1, nextLevelXp - levelStartXp);
  const favoriteExtension = EXTENSIONS.find((extension) => extension.id === preferred?.id);
  const completedAchievements = achievements.filter((item) => item.complete).length;

  useEffect(() => setName(state.playerName ?? "Collectionneur"), [state.playerName]);

  const claim = async (kind: "mission" | "achievement", id: string) => {
    setBusy(id);
    setMessage("");
    try {
      await (kind === "mission" ? onClaimMission(id) : onClaimAchievement(id));
      setMessage("Récompense ajoutée à votre solde.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy("");
    }
  };

  if (missions || achievementsOnly)
    return (
      <View style={[styles.body, profileStyles.body]}>
        <Text style={[styles.title, profileStyles.pageTitle]}>{achievementsOnly ? "PANTHÉON DES SUCCÈS" : "MISSIONS"}</Text>
        <Text style={styles.muted}>{achievementsOnly ? "Les hauts faits de votre collection sont gravés dans le marbre." : "Des objectifs persistants fondés uniquement sur votre collection."}</Text>
        {missions ? (["daily", "weekly"] as const).map((period) => (
          <View key={period} style={{ gap: 12 }}>
            <OlympusSectionTitle>{period === "daily" ? "OFFRANDES QUOTIDIENNES" : "RITES HEBDOMADAIRES"}</OlympusSectionTitle>
            {missionItems.filter((item) => item.definition.id.startsWith(`${period}-`)).map((item) => (
              <OlympusMarblePanel key={item.definition.id} entering style={[item.complete && !item.claimed && profileStyles.completedPanel]}>
                <View style={profileStyles.objectiveHeading}>
                  <View style={profileStyles.objectiveIcon}><OlympusIcon name="missions" size={23} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.subtitle, { textAlign: "left" }]}>{item.definition.title}</Text>
                    <Text style={[styles.text, { fontSize: 12 }]}>{item.definition.description}</Text>
                  </View>
                </View>
                <OlympusProgressBar value={item.value} max={item.definition.target} reduced={reduced} />
                <View style={profileStyles.rewardRow}>
                  <Text style={[styles.muted, { color: theme.highlight }]}>{Math.min(item.value, item.definition.target)} / {item.definition.target}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}><OlympusIcon name="drachma" size={16} /><Text style={[styles.muted, { color: theme.highlight }]}>{item.definition.reward}</Text></View>
                </View>
                {item.complete && !item.claimed ? (
                  <Pressable accessibilityRole="button" disabled={!!busy} style={styles.button} onPress={() => void claim("mission", item.definition.id)}>
                    <Text style={styles.buttonText}>{busy === item.definition.id ? "ATTRIBUTION…" : "RÉCLAMER"}</Text>
                  </Pressable>
                ) : <Text style={styles.muted}>{item.claimed ? "RÉCOMPENSE RÉCLAMÉE" : "EN COURS"}</Text>}
              </OlympusMarblePanel>
            ))}
          </View>
        )) : null}
        {achievementsOnly ? achievements.map((item, index) => (
          <OlympusMarblePanel key={item.definition.id} entering style={[profileStyles.achievementCard, { opacity: item.complete ? 1 : 0.76 }]}>
            <View style={[profileStyles.largeMedal, item.complete && profileStyles.largeMedalUnlocked]}>
              <OlympusIcon name={item.complete ? "achievements" : "lock"} size={31} color={item.complete ? theme.highlight : "#69717c"} />
              <Text style={profileStyles.medalNumber}>{String(index + 1).padStart(2, "0")}</Text>
            </View>
            <View style={{ flex: 1, gap: 7 }}>
              <Text style={[styles.subtitle, { textAlign: "left" }]}>{item.definition.title}</Text>
              <Text style={[styles.text, { fontSize: 12 }]}>{item.definition.description}</Text>
              <OlympusProgressBar value={item.value} max={item.definition.target} reduced={reduced} color={item.complete ? theme.gold : "#8290a0"} />
              <Text style={[styles.muted, { textAlign: "left" }]}>{Math.min(item.value, item.definition.target)} / {item.definition.target}{item.complete ? ` · ${DATE.format(progression.unlockedAchievements[item.definition.id] ?? Date.now())}` : ""}</Text>
              {item.complete && !item.claimed ? <Pressable accessibilityRole="button" disabled={!!busy} style={styles.button} onPress={() => void claim("achievement", item.definition.id)}><Text style={styles.buttonText}>{busy === item.definition.id ? "ATTRIBUTION…" : `RÉCLAMER · ${item.definition.reward}`}</Text></Pressable> : null}
            </View>
          </OlympusMarblePanel>
        )) : null}
        {!!message ? <Text accessibilityLiveRegion="polite" style={styles.text}>{message}</Text> : null}
      </View>
    );

  const updateSettings = (next: Partial<GameSettings>) => void onSaveSettings(next).catch((error) => setMessage(String(error)));
  const saveName = async () => {
    setBusy("profile");
    setMessage("");
    try {
      await onSave(name);
      setEditingName(false);
      setMessage("Profil enregistré.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy("");
    }
  };
  return (
    <View style={[styles.body, profileStyles.body]}>
      <View style={profileStyles.titleBlock}>
        <Text accessibilityRole="header" style={[styles.title, profileStyles.pageTitle]}>PROFIL DU COLLECTIONNEUR</Text>
        <View style={profileStyles.titleOrnament}><View style={profileStyles.ornamentDiamond} /></View>
      </View>

      <View style={[profileStyles.premiumPanel, profileStyles.identityPanel, compact && { gap: 10 }]}>
        <View style={[profileStyles.avatarRing, compact && { width: 84, height: 84, borderRadius: 42 }]}>
          <View style={profileStyles.avatarInner}>
            <Text style={profileStyles.avatarInitial}>{(state.playerName ?? "C").trim().charAt(0).toUpperCase()}</Text>
            <View style={profileStyles.avatarLaurelLeft}><OlympusIcon name="laurel" size={27} /></View>
            <View style={profileStyles.avatarLaurelRight}><OlympusIcon name="laurel" size={27} /></View>
          </View>
          <View style={profileStyles.levelSeal}><Text style={profileStyles.levelSealText}>{level}</Text></View>
        </View>
        <View style={profileStyles.identityCopy}>
          <View style={profileStyles.nameRow}>
            {editingName ? (
              <TextInput
                autoFocus
                accessibilityLabel="Nom du joueur"
                value={name}
                onChangeText={setName}
                maxLength={30}
                onSubmitEditing={() => void saveName()}
                style={profileStyles.nameInput}
              />
            ) : (
              <Text numberOfLines={1} style={[profileStyles.playerName, compact && { fontSize: 16, lineHeight: 23 }]}>{state.playerName ?? "Collectionneur"}</Text>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={editingName ? "Enregistrer le pseudonyme" : "Modifier le pseudonyme"}
              disabled={busy === "profile"}
              hitSlop={8}
              style={profileStyles.editButton}
              onPress={() => editingName ? void saveName() : setEditingName(true)}
            >
              <OlympusIcon name={editingName ? "check" : "edit"} size={19} color={theme.highlight} />
            </Pressable>
          </View>
          <Text style={profileStyles.rank}>NIVEAU {level} · {collectorTitle(level).toUpperCase()}</Text>
          <View style={profileStyles.xpRow}>
            <View style={profileStyles.xpTrack}>
              <View style={[profileStyles.xpFill, { width: `${Math.min(100, Math.round((levelXp / levelTarget) * 100))}%` }]} />
            </View>
            <Text style={profileStyles.xpText}>{levelXp} / {levelTarget} XP</Text>
          </View>
          <Text style={profileStyles.started}>Collection commencée le {DATE.format(progression.startedAt)}</Text>
        </View>
      </View>

      <View style={profileStyles.statsGrid}>
        <OlympusStatCard value={stats.owned} label="CARTES UNIQUES" icon="cards" compact={compact} />
        <OlympusStatCard value={stats.duplicates} label="DOUBLONS" icon="duplicates" compact={compact} />
        <OlympusStatCard value={progression.boostersOpened} label="BOOSTERS OUVERTS" icon="booster" compact={compact} />
        <OlympusStatCard value={exceptional} label="CARTES EXCEPTIONNELLES" icon="level" compact={compact} />
      </View>

      <View style={profileStyles.premiumPanel}>
        <OlympusSectionTitle>PROGRESSION GLOBALE</OlympusSectionTitle>
        <View style={profileStyles.globalProgressRow}>
          <View style={profileStyles.globalTrack}>
            <View style={[profileStyles.globalFill, { width: `${stats.percent}%` }]} />
          </View>
          <Text style={profileStyles.percent}>{stats.percent} %</Text>
        </View>
        <Text style={profileStyles.progressCaption}>{stats.owned} / 120 DÉCOUVERTES · {stats.missing} MANQUANTES</Text>
      </View>

      <View style={[profileStyles.featureRow, compact && profileStyles.featureColumn]}>
        <View style={[profileStyles.premiumPanel, profileStyles.favoritePanel]}>
          <OlympusSectionTitle>EXTENSION FAVORITE</OlympusSectionTitle>
          {favoriteExtension && preferred?.owned ? (
            <View style={profileStyles.favoriteContent}>
              <Image source={PACK_ART[favoriteExtension.id]} contentFit="contain" transition={120} style={profileStyles.favoritePack} />
              <View style={{ flex: 1, gap: 7 }}>
                <Text style={profileStyles.favoriteName}>{favoriteExtension.name}</Text>
                <Text style={profileStyles.favoriteCount}>{preferred.owned} / {preferred.total} CARTES</Text>
                <View style={profileStyles.miniTrack}><View style={[profileStyles.miniFill, { width: `${Math.round((preferred.owned / preferred.total) * 100)}%`, backgroundColor: favoriteExtension.color }]} /></View>
              </View>
            </View>
          ) : <Text style={styles.muted}>Ouvrez un booster pour révéler votre affinité.</Text>}
        </View>
        <View style={[profileStyles.premiumPanel, profileStyles.achievementPreview]}>
          <OlympusSectionTitle>{`SUCCÈS · ${completedAchievements}/${achievements.length}`}</OlympusSectionTitle>
          <View style={profileStyles.medalRow}>
            {achievements.slice(0, 5).map((item, index) => (
              <View key={item.definition.id} style={[profileStyles.medal, item.complete && profileStyles.medalUnlocked]}>
                <Text style={[profileStyles.medalText, !item.complete && { opacity: 0.32 }]}>{item.complete ? index + 1 : "·"}</Text>
              </View>
            ))}
          </View>
          <Text style={profileStyles.achievementHint}>{achievements.find((item) => !item.complete)?.definition.title ?? "Panthéon entièrement révélé"}</Text>
        </View>
      </View>

      <View style={profileStyles.premiumPanel}>
        <OlympusSectionTitle>RÉPARTITION DES RARETÉS</OlympusSectionTitle>
        <View style={profileStyles.rarityRow}>
          {stats.byRarity.map((rarity) => (
            <View key={rarity.rarity} style={profileStyles.rarityItem}>
              <View style={[profileStyles.gem, { backgroundColor: COLORS[rarity.rarity], shadowColor: COLORS[rarity.rarity] }]} />
              <Text numberOfLines={1} adjustsFontSizeToFit style={profileStyles.rarityName}>{RARITIES[rarity.rarity]}</Text>
              <Text style={profileStyles.rarityCount}>{rarity.owned}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={profileStyles.quotePanel}>
        <Text style={profileStyles.quote}>« Chaque carte est un fragment d’éternité. »</Text>
      </View>

      <View style={profileStyles.premiumPanel}>
        <OlympusSectionTitle>DOUBLONS</OlympusSectionTitle>
        {CARDS.filter((card) => (state.collection[card.id] ?? 0) > 1).slice(0, 8).map((card) => (
          <View key={card.id} style={profileStyles.listRow}>
            <Text style={profileStyles.listPrimary}>{card.number} · {card.name}</Text>
            <Text style={[profileStyles.listSecondary, { color: COLORS[card.rarity] }]}>{RARITIES[card.rarity]} · ×{state.collection[card.id]}</Text>
          </View>
        ))}
        {stats.duplicates === 0 ? <Text style={styles.muted}>Aucun doublon pour le moment.</Text> : null}
      </View>
      <View style={profileStyles.premiumPanel}>
        <OlympusSectionTitle>PRÉFÉRENCES</OlympusSectionTitle>
        {([ ["musicEnabled", "Musique"], ["soundEffectsEnabled", "Effets sonores"], ["vibrationsEnabled", "Vibrations"] ] as const).map(([key, label]) => (
          <View key={key} style={profileStyles.settingRow}>
            <Text style={styles.text}>{label}</Text>
            <Switch accessibilityLabel={label} value={settings[key]} onValueChange={(value) => updateSettings({ [key]: value })} trackColor={{ true: "#8f742b", false: "#283546" }} thumbColor={theme.paper} />
          </View>
        ))}
        <Text style={[styles.muted, { textAlign: "left" }]}>Volume</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {([0.25, 0.55, 1] as const).map((volume) => (
            <Pressable key={volume} accessibilityRole="button" accessibilityState={{ selected: settings.volume === volume }} style={[styles.outline, { flex: 1 }, settings.volume === volume && styles.activeTab]} onPress={() => updateSettings({ volume })}>
              <Text style={styles.muted}>{Math.round(volume * 100)} %</Text>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.muted, { textAlign: "left" }]}>Qualité graphique · automatique : {automaticTier}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(["auto", "high", "balanced", "economy"] as GraphicsPreference[]).map((quality) => (
            <Pressable key={quality} accessibilityRole="button" accessibilityState={{ selected: preference === quality }} style={[styles.outline, preference === quality && styles.activeTab]} onPress={() => setPreference(quality)}>
              <Text style={styles.muted}>{{ auto: "AUTO", high: "ÉLEVÉ", balanced: "STANDARD", economy: "ÉCONOMIQUE" }[quality]}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.muted}>Les sons restent silencieux tant qu’aucune ressource originale ou licenciée n’est fournie.</Text>
      </View>
      <View style={profileStyles.premiumPanel}>
        <OlympusSectionTitle>HISTORIQUE RÉCENT</OlympusSectionTitle>
        {progression.history.slice(0, 8).map((entry) => (
          <View key={entry.id} style={profileStyles.listRow}>
            <Text style={profileStyles.listPrimary}>{EXTENSIONS.find((extension) => extension.id === entry.extension)?.name}</Text>
            <Text style={profileStyles.listSecondary}>{DATE.format(entry.createdAt)} · {entry.discoveries} nouvelle{entry.discoveries > 1 ? "s" : ""}</Text>
          </View>
        ))}
        {!progression.history.length ? <Text style={styles.muted}>Les prochaines ouvertures apparaîtront ici.</Text> : null}
      </View>
      {!!message ? <Text accessibilityLiveRegion="polite" style={styles.text}>{message}</Text> : null}
      <PerformanceDiagnostics />
    </View>
  );
}

const profileStyles = StyleSheet.create({
  body: { maxWidth: 760, paddingHorizontal: 14, gap: 12 },
  titleBlock: { alignItems: "center", marginBottom: 2 },
  pageTitle: { fontSize: 22, lineHeight: 31, letterSpacing: 1.2 },
  titleOrnament: { width: 120, height: 14, alignItems: "center", justifyContent: "center", borderBottomWidth: 1, borderBottomColor: theme.line },
  ornamentDiamond: { width: 9, height: 9, backgroundColor: theme.ink, borderWidth: 1, borderColor: theme.gold, transform: [{ rotate: "45deg" }], marginTop: 13 },
  premiumPanel: {
    padding: 14,
    backgroundColor: "#07182aee",
    borderWidth: 1,
    borderColor: "#d4af377a",
    borderRadius: 9,
    gap: 11,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  identityPanel: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 18 },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    borderColor: theme.gold,
    padding: 5,
    shadowColor: "#efc768",
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: "#f0d59d88",
    backgroundColor: "#192b47",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarInitial: { color: theme.highlight, fontFamily: fonts.bold, fontSize: 43, textShadowColor: "#d4af37", textShadowRadius: 9 },
  avatarLaurelLeft: { position: "absolute", left: 7, bottom: 13, transform: [{ rotate: "-24deg" }] },
  avatarLaurelRight: { position: "absolute", right: 7, bottom: 13, transform: [{ rotate: "-24deg" }, { scaleX: -1 }] },
  laurelText: { color: theme.gold, fontFamily: fonts.bold, fontSize: 18 },
  levelSeal: { position: "absolute", bottom: -8, alignSelf: "center", width: 31, height: 31, borderRadius: 16, backgroundColor: "#0a1c31", borderWidth: 2, borderColor: theme.gold, alignItems: "center", justifyContent: "center" },
  levelSealText: { color: theme.highlight, fontFamily: fonts.bold, fontSize: 13 },
  identityCopy: { flex: 1, minWidth: 0, gap: 7 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  playerName: { flex: 1, color: theme.paper, fontFamily: fonts.bold, fontSize: 20, lineHeight: 28, letterSpacing: 0.6 },
  nameInput: { flex: 1, color: theme.paper, fontFamily: fonts.bold, fontSize: 18, minHeight: 42, borderBottomWidth: 1, borderBottomColor: theme.gold, paddingHorizontal: 3 },
  editButton: { width: 38, height: 38, borderRadius: 6, borderWidth: 1, borderColor: theme.line, backgroundColor: "#102741", alignItems: "center", justifyContent: "center" },
  editButtonText: { color: theme.highlight, fontFamily: fonts.bold, fontSize: 17 },
  rank: { color: theme.highlight, fontFamily: fonts.semibold, fontSize: 11, lineHeight: 17, letterSpacing: 0.5 },
  xpRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  xpTrack: { flex: 1, height: 10, borderRadius: 6, borderWidth: 1, borderColor: "#7894ac66", padding: 1, backgroundColor: "#040c16", overflow: "hidden" },
  xpFill: { height: "100%", borderRadius: 5, backgroundColor: theme.gold },
  xpText: { minWidth: 72, color: theme.paper, fontFamily: fonts.regular, fontSize: 10 },
  started: { color: theme.muted, fontFamily: fonts.regular, fontSize: 10, lineHeight: 16 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 },
  statTile: { minHeight: 126, paddingHorizontal: 7, paddingVertical: 12, borderWidth: 1, borderColor: theme.line, backgroundColor: "#08182ce8", borderRadius: 8, alignItems: "center", justifyContent: "center", gap: 5 },
  statMark: { width: 25, height: 25, borderWidth: 1, borderColor: theme.gold, transform: [{ rotate: "45deg" }], alignItems: "center", justifyContent: "center", marginBottom: 3 },
  statMarkInner: { width: 9, height: 9, backgroundColor: theme.gold },
  statValue: { color: theme.highlight, fontFamily: fonts.bold, fontSize: 21, lineHeight: 27 },
  statLabel: { color: theme.muted, fontFamily: fonts.semibold, fontSize: 8, lineHeight: 13, textAlign: "center", letterSpacing: 0.4 },
  sectionHeading: { flexDirection: "row", alignItems: "center", gap: 9 },
  headingLine: { flex: 1, height: 1, backgroundColor: theme.line },
  sectionTitle: { color: theme.highlight, fontFamily: fonts.semibold, fontSize: 11, lineHeight: 17, letterSpacing: 0.8, textAlign: "center" },
  globalProgressRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  globalTrack: { flex: 1, height: 12, padding: 2, borderRadius: 7, borderWidth: 1, borderColor: "#4c7796", backgroundColor: "#040c16", overflow: "hidden" },
  globalFill: { height: "100%", borderRadius: 5, backgroundColor: "#4aa5e9", shadowColor: "#70c6ff", shadowOpacity: 0.8, shadowRadius: 7 },
  percent: { color: theme.highlight, fontFamily: fonts.bold, fontSize: 20 },
  progressCaption: { color: theme.muted, fontFamily: fonts.regular, fontSize: 9, letterSpacing: 0.4 },
  featureRow: { flexDirection: "row", gap: 10, alignItems: "stretch" },
  featureColumn: { flexDirection: "column" },
  favoritePanel: { flex: 1.15, minWidth: 0 },
  achievementPreview: { flex: 0.85, minWidth: 0 },
  favoriteContent: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 126 },
  favoritePack: { width: 72, height: 108 },
  favoriteName: { color: theme.highlight, fontFamily: fonts.bold, fontSize: 12, lineHeight: 18 },
  favoriteCount: { color: theme.paper, fontFamily: fonts.semibold, fontSize: 10 },
  miniTrack: { height: 5, borderRadius: 3, backgroundColor: theme.navy, overflow: "hidden" },
  miniFill: { height: "100%", borderRadius: 3 },
  medalRow: { flexDirection: "row", justifyContent: "space-between", gap: 5, marginTop: 14 },
  medal: { width: 34, height: 42, borderRadius: 8, borderWidth: 1, borderColor: "#526172", backgroundColor: "#07111e", alignItems: "center", justifyContent: "center" },
  medalUnlocked: { borderColor: theme.gold, backgroundColor: "#382a10", shadowColor: theme.gold, shadowOpacity: 0.45, shadowRadius: 7 },
  medalText: { color: theme.highlight, fontFamily: fonts.bold, fontSize: 13 },
  achievementHint: { color: theme.muted, fontFamily: fonts.regular, fontSize: 9, lineHeight: 14, textAlign: "center" },
  rarityRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 7 },
  rarityItem: { width: 68, minHeight: 88, alignItems: "center", justifyContent: "center", gap: 5 },
  gem: { width: 22, height: 22, transform: [{ rotate: "45deg" }], borderWidth: 1, borderColor: "#fff9", shadowOpacity: 0.65, shadowRadius: 8 },
  rarityName: { width: "100%", color: theme.muted, fontFamily: fonts.regular, fontSize: 8, lineHeight: 12, textAlign: "center" },
  rarityCount: { color: theme.paper, fontFamily: fonts.bold, fontSize: 15 },
  quotePanel: { paddingVertical: 9, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.line },
  quote: { color: theme.muted, fontFamily: fonts.regular, fontSize: 11, lineHeight: 18, textAlign: "center", fontStyle: "italic" },
  listRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.line },
  listPrimary: { flex: 1, color: theme.paper, fontFamily: fonts.regular, fontSize: 11, lineHeight: 17 },
  listSecondary: { color: theme.muted, fontFamily: fonts.semibold, fontSize: 9, lineHeight: 15, textAlign: "right" },
  settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 44, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.line },
  completedPanel: { borderColor: "#e1c168", shadowColor: theme.gold, shadowOpacity: 0.3, shadowRadius: 12 },
  objectiveHeading: { flexDirection: "row", alignItems: "center", gap: 12 },
  objectiveIcon: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: theme.line, backgroundColor: "#10243a", alignItems: "center", justifyContent: "center" },
  rewardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  achievementCard: { flexDirection: "row", alignItems: "center", gap: 14 },
  largeMedal: { width: 76, height: 88, borderRadius: 14, borderWidth: 1, borderColor: "#586574", backgroundColor: "#07111e", alignItems: "center", justifyContent: "center", gap: 5 },
  largeMedalUnlocked: { borderColor: theme.gold, backgroundColor: "#392b12", shadowColor: theme.gold, shadowOpacity: 0.45, shadowRadius: 10 },
  medalNumber: { color: theme.muted, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1 },
});
