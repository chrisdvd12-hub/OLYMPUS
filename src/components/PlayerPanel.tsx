import { useMemo, useState } from "react";
import { Pressable, Switch, TextInput, View } from "react-native";
import { collectionStats } from "../domain/collection";
import { CARDS, EXTENSIONS, RARITIES } from "../domain/catalog";
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
import { CollectionProgress } from "./CollectionProgress";
import { fonts, styles, theme } from "./theme";
import { PerformanceDiagnostics } from "./PerformanceDiagnostics";

const DATE = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

function ProgressBar({ value, max }: { value: number; max: number }) {
  const percent = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return (
    <View style={{ height: 5, backgroundColor: "#192b47", borderRadius: 3, overflow: "hidden" }}>
      <View style={{ width: `${percent}%`, height: "100%", backgroundColor: theme.gold }} />
    </View>
  );
}

export function PlayerPanel({
  state,
  onSave,
  onClaimMission,
  onClaimAchievement,
  onSaveSettings,
  missions = false,
  reduced = false,
}: {
  state: GameState;
  onSave: (name: string) => Promise<void>;
  onClaimMission: (id: string) => Promise<unknown>;
  onClaimAchievement: (id: string) => Promise<unknown>;
  onSaveSettings: (settings: Partial<GameSettings>) => Promise<unknown>;
  missions?: boolean;
  reduced?: boolean;
}) {
  const [name, setName] = useState(state.playerName ?? "Collectionneur");
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

  if (missions)
    return (
      <View style={styles.body}>
        <Text style={styles.title}>MISSIONS</Text>
        <Text style={styles.muted}>Des objectifs persistants fondés uniquement sur votre collection.</Text>
        {(["daily", "weekly"] as const).map((period) => (
          <View key={period} style={{ gap: 12 }}>
            <Text style={styles.subtitle}>{period === "daily" ? "QUOTIDIENNES" : "HEBDOMADAIRES"}</Text>
            {missionItems.filter((item) => item.definition.id.startsWith(`${period}-`)).map((item) => (
              <View key={item.definition.id} style={styles.panel}>
                <Text style={[styles.subtitle, { textAlign: "left" }]}>{item.definition.title}</Text>
                <Text style={[styles.text, { fontSize: 12 }]}>{item.definition.description}</Text>
                <ProgressBar value={item.value} max={item.definition.target} />
                <Text style={[styles.muted, { textAlign: "left", color: theme.highlight }]}>
                  {Math.min(item.value, item.definition.target)} / {item.definition.target} · {item.definition.reward} drachmes
                </Text>
                {item.complete && !item.claimed ? (
                  <Pressable accessibilityRole="button" disabled={!!busy} style={styles.button} onPress={() => void claim("mission", item.definition.id)}>
                    <Text style={styles.buttonText}>{busy === item.definition.id ? "ATTRIBUTION…" : "RÉCLAMER"}</Text>
                  </Pressable>
                ) : (
                  <Text style={styles.muted}>{item.claimed ? "RÉCOMPENSE RÉCLAMÉE" : "EN COURS"}</Text>
                )}
              </View>
            ))}
          </View>
        ))}
        <Text style={styles.title}>PANTHÉON DES SUCCÈS</Text>
        {achievements.map((item) => (
          <View key={item.definition.id} style={[styles.panel, { opacity: item.complete ? 1 : 0.72 }]}>
            <Text style={[styles.subtitle, { textAlign: "left" }]}>{item.definition.title}</Text>
            <Text style={styles.text}>{item.definition.description}</Text>
            <ProgressBar value={item.value} max={item.definition.target} />
            <Text style={[styles.muted, { textAlign: "left" }]}>
              {Math.min(item.value, item.definition.target)} / {item.definition.target}
              {item.complete ? ` · DÉBLOQUÉ LE ${DATE.format(progression.unlockedAchievements[item.definition.id] ?? Date.now())}` : ""}
            </Text>
            {item.complete && !item.claimed ? (
              <Pressable accessibilityRole="button" disabled={!!busy} style={styles.button} onPress={() => void claim("achievement", item.definition.id)}>
                <Text style={styles.buttonText}>{busy === item.definition.id ? "ATTRIBUTION…" : `RÉCLAMER · ${item.definition.reward}`}</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
        {!!message ? <Text accessibilityLiveRegion="polite" style={styles.text}>{message}</Text> : null}
      </View>
    );

  const updateSettings = (next: Partial<GameSettings>) => void onSaveSettings(next).catch((error) => setMessage(String(error)));
  return (
    <View style={styles.body}>
      <Text style={styles.title}>PROFIL DU COLLECTIONNEUR</Text>
      <View style={styles.panel}>
        <Text style={styles.subtitle}>NIVEAU {level} · {collectorTitle(level).toUpperCase()}</Text>
        <ProgressBar value={progression.xp % 100} max={100} />
        <Text style={styles.muted}>{progression.xp} XP · collection commencée le {DATE.format(progression.startedAt)}</Text>
        <Text style={styles.text}>{stats.owned} cartes uniques · {stats.duplicates} doublons</Text>
        <Text style={styles.text}>{progression.boostersOpened} boosters ouverts · {exceptional} cartes exceptionnelles</Text>
        <Text style={styles.text}>Extension favorite : {preferred?.owned ? preferred.name : "À découvrir"}</Text>
        <Text style={styles.text}>Succès : {achievements.filter((item) => item.complete).length} / {achievements.length}</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.subtitle}>PSEUDONYME</Text>
        <TextInput accessibilityLabel="Nom du joueur" value={name} onChangeText={setName} maxLength={30} style={{ color: theme.paper, fontFamily: fonts.regular, padding: 12, borderWidth: 1, borderColor: theme.line, minHeight: 48 }} />
        <Pressable accessibilityRole="button" disabled={busy === "profile"} style={styles.button} onPress={async () => {
          setBusy("profile");
          try { await onSave(name); setMessage("Profil enregistré."); } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); } finally { setBusy(""); }
        }}>
          <Text style={styles.buttonText}>{busy === "profile" ? "ENREGISTREMENT…" : "ENREGISTRER"}</Text>
        </Pressable>
      </View>
      <CollectionProgress collection={state.collection} detailed reduced={reduced} />
      <View style={styles.panel}>
        <Text style={styles.subtitle}>DOUBLONS</Text>
        {CARDS.filter((card) => (state.collection[card.id] ?? 0) > 1).slice(0, 8).map((card) => (
          <Text key={card.id} style={[styles.text, { fontSize: 12 }]}>{card.number} · {card.name} · {RARITIES[card.rarity]} · ×{state.collection[card.id]}</Text>
        ))}
        {stats.duplicates === 0 ? <Text style={styles.muted}>Aucun doublon pour le moment.</Text> : null}
      </View>
      <View style={styles.panel}>
        <Text style={styles.subtitle}>RÉGLAGES</Text>
        {([ ["musicEnabled", "Musique"], ["soundEffectsEnabled", "Effets sonores"], ["vibrationsEnabled", "Vibrations"] ] as const).map(([key, label]) => (
          <View key={key} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
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
              <Text style={styles.muted}>{quality.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.muted}>Les sons restent silencieux tant qu’aucune ressource originale ou licenciée n’est fournie.</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.subtitle}>HISTORIQUE RÉCENT</Text>
        {progression.history.slice(0, 8).map((entry) => (
          <Text key={entry.id} style={[styles.text, { fontSize: 11 }]}>{DATE.format(entry.createdAt)} · {EXTENSIONS.find((extension) => extension.id === entry.extension)?.name} · {entry.discoveries} nouvelle{entry.discoveries > 1 ? "s" : ""}</Text>
        ))}
        {!progression.history.length ? <Text style={styles.muted}>Les prochaines ouvertures apparaîtront ici.</Text> : null}
      </View>
      {!!message ? <Text accessibilityLiveRegion="polite" style={styles.text}>{message}</Text> : null}
      <PerformanceDiagnostics />
    </View>
  );
}
