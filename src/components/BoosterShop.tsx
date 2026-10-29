import { useCallback, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  useWindowDimensions,
  Pressable,
  ScrollView,
  Switch,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, useAnimatedStyle } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { EXTENSIONS } from "../domain/catalog";
import { PRICE, RECHARGE_MS } from "../domain/boosters";
import { collectorLevel, currentProgression } from "../domain/progression";
import { UNLIMITED_DRACHMAS } from "../config/testing";
import { useGameState, useGameSync } from "../storage/useGameState";
import {
  buy,
  claimAchievementReward,
  claimMissionReward,
  finish,
  refresh,
  savePlayerName,
  saveSettings,
} from "../storage/store";
import { selectionFeedback, setFeedbackEnabled } from "../interaction/feedback";
import { AppText as Text } from "./AppText";
import { BoosterWheelCarousel } from "./BoosterWheelCarousel";
import { BoosterOpeningSequence } from "./BoosterOpeningSequence";
import { CardCollectionGrid } from "./CardCollectionGrid";
import { CardDetailModal } from "./CardDetailModal";
import { CollectionProgress } from "./CollectionProgress";
import { PremiumButton } from "./PremiumButton";
import { PlayerPanel } from "./PlayerPanel";
import { OfferingBadge } from "./OfferingBadge";
import { SanctuaryBackdrop } from "./SanctuaryBackdrop";
import { GreekOrnament } from "./GreekOrnament";
import { styles, theme } from "./theme";
import { OlympusBottomNavigation, OlympusIcon, OlympusLoadingScreen, type OlympusIconName } from "./OlympusUI";
import { useOpeningLoop } from "../animations/openingMotion";

type Page = "home" | "album" | "missions" | "success" | "profile";
const PAGES = [
  ["home", "SANCTUAIRE", "sanctuary"],
  ["album", "ALBUM", "album"],
  ["missions", "MISSIONS", "missions"],
  ["success", "SUCCÈS", "achievements"],
  ["profile", "PROFIL", "profile"],
] as const satisfies readonly (readonly [Page, string, OlympusIconName])[];
const DESCRIPTIONS = [
  "Les divinités qui veillent sur le ciel, les mers et les mortels.",
  "Les puissances primordiales et les ancêtres des dieux.",
  "Les figures dont les récits traversent les siècles.",
  "Les êtres fascinants des légendes grecques.",
];
const PAGE_OVERLAYS: Record<Page, readonly [string, string, string]> = {
  home: ["#06101a00", "#0b142622", "#06101a88"],
  album: ["#071426aa", "#102842c7", "#07111ee8"],
  missions: ["#21170788", "#0b1b2dcc", "#07111eee"],
  success: ["#1a10298f", "#151d36d8", "#070d19ee"],
  profile: ["#0714267a", "#0b1d32c4", "#07111edb"],
};
export default function BoosterShop() {
  const { width } = useWindowDimensions();
  const state = useGameState();
  const [selected, setSelected] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [wheelBusy, setWheelBusy] = useState(false);
  const [wheelVisible, setWheelVisible] = useState(true);
  const wheelVisibleRef = useRef(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState<Page>("home");
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const logoClock = useOpeningLoop(!reduced, 6500, true);
  const logoGlow = useAnimatedStyle(() => ({ opacity: 0.92 + logoClock.value * 0.08, transform: [{ scale: 1 + logoClock.value * 0.006 }] }));
  const lock = useRef(false);
  const reportError = useCallback(
    (error: unknown) =>
      setError(error instanceof Error ? error.message : String(error)),
    [],
  );
  const freeNextAt =
    state && state.freeCharges < 2 ? state.rechargeAt + RECHARGE_MS : undefined;
  const nextSyncAt =
    state?.dailyNextAt === undefined
      ? freeNextAt
      : freeNextAt === undefined
        ? state.dailyNextAt
        : Math.min(state.dailyNextAt, freeNextAt);
  useGameSync(nextSyncAt, reportError);
  const retrySync = () => {
    setError("");
    void refresh(true, true).catch(reportError);
  };
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduced)
      .catch(() => {});
    const motion = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => motion.remove();
  }, []);
  useEffect(() => {
    setFeedbackEnabled(state?.settings?.vibrationsEnabled ?? true);
  }, [state?.settings?.vibrationsEnabled]);
  const open = async (source: "paid" | "free" | "daily", index = selected) => {
    if (lock.current || (source === "paid" && wheelBusy)) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const extension =
        source === "daily"
          ? (state?.dailyPacks?.[0] ?? "")
          : EXTENSIONS[index]!.id;
      await buy(
        extension,
        source,
        `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      );
      selectionFeedback(!reduced && (state?.settings?.vibrationsEnabled ?? true));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const exit = async (destination: "shop" | "collection" | "again") => {
    if (!state?.pending || lock.current) return;
    lock.current = true;
    try {
      const index = EXTENSIONS.findIndex(
        (e) => e.id === state.pending!.extension,
      );
      await finish(state.pending.id);
      if (index >= 0) setSelected(index);
      setWheelBusy(false);
      setPage(destination === "collection" ? "album" : "home");
    } catch (e) {
      setError(String(e));
    } finally {
      lock.current = false;
    }
  };
  if (!state)
    return (
      <SafeAreaView style={styles.screen}>
        <SanctuaryBackdrop />
        <View style={{ flex: 1 }}>
          <OlympusLoadingScreen message={error || "Les portes du sanctuaire s’ouvrent…"} />
          {!!error && (
            <View style={{ padding: 22 }}><PremiumButton label="RÉESSAYER" onPress={retrySync} reduced /></View>
          )}
        </View>
      </SafeAreaView>
    );
  if (state.pending)
    return (
      <SafeAreaView style={styles.screen}>
        <BoosterOpeningSequence
          key={state.pending.id}
          receipt={state.pending}
          reduced={reduced}
          onExit={exit}
        />
        {!!error && (
          <Text accessibilityRole="alert" style={styles.text}>
            {error}
          </Text>
        )}
      </SafeAreaView>
    );
  const canAfford = UNLIMITED_DRACHMAS || state.drachmas >= PRICE;
  const extension = EXTENSIONS[selected]!;
  const profileProgression = currentProgression(state.progression, Date.now());
  const playerLevel = collectorLevel(profileProgression.xp);
  const switchPage = (next: Page) => {
    setPage(next);
    setWheelVisible(true);
    setWheelBusy(false);
    selectionFeedback(!reduced && (state.settings?.vibrationsEnabled ?? true));
  };
  return (
    <SafeAreaView style={styles.screen}>
      <SanctuaryBackdrop />
      <View
        style={{
          paddingHorizontal: 18,
          paddingVertical: 12,
          flexDirection: "row",
          gap: 12,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1, gap: 6 }}>
          <Animated.View style={logoGlow}>
            <Text accessibilityRole="header" style={[styles.title, { textAlign: "left", fontSize: width < 360 ? 20 : 27, lineHeight: 36 }]}>OLYMPUS</Text>
          </Animated.View>
          <Text
            style={[
              styles.subtitle,
              { fontSize: 9, letterSpacing: 1.5, textAlign: "left" },
            ]}
          >
            DIVINE COLLECTION
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ouvrir mon profil"
              style={{ minHeight: 44, flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}
              onPress={() => switchPage("profile")}
            >
              <View style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: theme.gold, backgroundColor: theme.navy, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: theme.highlight, fontFamily: "CinzelBold", fontSize: 14 }}>{(state.playerName ?? "C").trim().charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={[styles.text, { fontSize: 11, lineHeight: 17 }]}>{state.playerName ?? "Collectionneur"}</Text>
                <Text style={[styles.muted, { textAlign: "left", fontSize: 8, lineHeight: 13 }]}>NIVEAU {playerLevel}</Text>
              </View>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Ouvrir les paramètres" onPress={() => switchPage("profile")} style={{ width: 42, height: 42, borderWidth: 1, borderColor: theme.line, borderRadius: 7, alignItems: "center", justifyContent: "center", backgroundColor: "#0a1d32dd" }}>
              <OlympusIcon name="settings" size={20} />
            </Pressable>
          </View>
          <Text
            style={{
              color: theme.highlight,
              fontFamily: "CinzelBold",
              fontSize: 12,
            }}
          >
            {UNLIMITED_DRACHMAS
              ? "∞ drachmes · TEST"
              : `${state.drachmas} drachmes`}
          </Text>
        </View>
        <OfferingBadge
          nextAt={state.dailyNextAt}
          available={state.dailyPacks?.length ?? 0}
          busy={busy}
          onOpen={() => open("daily")}
          compact={width < 360}
        />
      </View>
      <Animated.View
        key={page}
        entering={reduced ? undefined : FadeIn.duration(240)}
        style={{ flex: 1 }}
      >
        <LinearGradient pointerEvents="none" colors={[...PAGE_OVERLAYS[page]]} style={{ position: "absolute", inset: 0 }} />
        {page === "album" ? (
          <CardCollectionGrid
            collection={state.collection}
            recentDiscoveries={state.progression?.recentDiscoveries}
            reduced={reduced}
            onInspect={setInspectedId}
          />
        ) : (
          <ScrollView
            scrollEventThrottle={100}
            onScroll={(e) => {
              if (page === "home") {
                const visible = e.nativeEvent.contentOffset.y < 600;
                if (visible !== wheelVisibleRef.current) {
                  wheelVisibleRef.current = visible;
                  setWheelVisible(visible);
                }
              }
            }}
            contentContainerStyle={{ paddingBottom: 28 }}
          >
            {page === "home" ? (
              <>
                <View style={[styles.body, { paddingVertical: 8 }]}>
                  <CollectionProgress
                    collection={state.collection}
                    reduced={reduced}
                  />
                </View>
                <BoosterWheelCarousel
                  selected={selected}
                  onSelect={setSelected}
                  onOpen={(index) => open("paid", index)}
                  onBusy={setWheelBusy}
                  reduced={reduced}
                  visible={wheelVisible}
                />
                <View style={[styles.body, { gap: 12 }]}>
                  <GreekOrnament />
                  <Text
                    style={[styles.title, { fontSize: 21, lineHeight: 30 }]}
                  >
                    {extension.name}
                  </Text>
                  <Text style={styles.muted}>{DESCRIPTIONS[selected]}</Text>
                  <Text style={[styles.subtitle, { letterSpacing: 1 }]}>
                    7 CARTES · {PRICE} DRACHMES
                  </Text>
                  <Text style={styles.muted}>
                    Une rare ou supérieure garantie
                  </Text>
                  <PremiumButton
                    disabled={busy || wheelBusy || !canAfford}
                    reduced={reduced}
                    onPress={() => open("paid")}
                    label={busy ? "ENREGISTREMENT…" : "OUVRIR UN BOOSTER"}
                  />
                  {state.freeCharges > 0 ? (
                    <PremiumButton
                      secondary
                      disabled={busy || wheelBusy}
                      reduced={reduced}
                      onPress={() => open("free")}
                      label={`UTILISER UN BOOSTER GRATUIT · ${state.freeCharges}/2`}
                    />
                  ) : (
                    <Text style={styles.muted}>
                      Prochaine charge gratuite en cours de préparation · stockage 0/2
                    </Text>
                  )}
                  {UNLIMITED_DRACHMAS && (
                    <Text style={styles.muted}>
                      Mode test · aucune drachme débitée
                    </Text>
                  )}
                  {!canAfford && (
                    <Text style={styles.muted}>
                      Drachmes insuffisantes. Votre offrande gratuite reste
                      disponible à échéance.
                    </Text>
                  )}
                  <Text style={styles.muted}>
                    Protection légendaire · {state.pity}/20
                  </Text>
                  <View
                    style={[
                      styles.panel,
                      {
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <Text
                      style={[styles.muted, { flex: 1, textAlign: "left" }]}
                    >
                      Réduire les animations
                    </Text>
                    <Switch
                      accessibilityLabel="Réduire les animations"
                      value={reduced}
                      onValueChange={setReduced}
                      trackColor={{ true: "#8f742b", false: "#283546" }}
                      thumbColor={theme.paper}
                    />
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    style={styles.outline}
                    onPress={() => setInspectedId("olympe-30")}
                  >
                    <Text style={styles.text}>ADMIRER ZEUS DIVIN</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <PlayerPanel
                state={state}
                reduced={reduced}
                missions={page === "missions"}
                achievementsOnly={page === "success"}
                onSave={async (name) => {
                  await savePlayerName(name);
                }}
                onClaimMission={claimMissionReward}
                onClaimAchievement={claimAchievementReward}
                onSaveSettings={saveSettings}
              />
            )}
          </ScrollView>
        )}
      </Animated.View>
      {!!error && (
        <View>
          <Text
            accessibilityRole="alert"
            style={{ color: "#ffb4a6", padding: 12 }}
          >
            {error}
          </Text>
          <PremiumButton
            secondary
            reduced={reduced}
            label="ACTUALISER LA SAUVEGARDE"
            onPress={retrySync}
          />
        </View>
      )}
      <View style={{ marginHorizontal: 10, marginBottom: 4 }}>
        <OlympusBottomNavigation items={PAGES} active={page} compact={width < 390} onSelect={(id) => switchPage(id as Page)} />
      </View>
      {inspectedId && (
        <CardDetailModal
          cardId={inspectedId}
          quantity={state.collection[inspectedId] ?? 0}
          collection={state.collection}
          reduced={reduced}
          onClose={() => setInspectedId(null)}
        />
      )}
    </SafeAreaView>
  );
}
