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
import Animated, { FadeIn } from "react-native-reanimated";
import { EXTENSIONS } from "../domain/catalog";
import { PRICE } from "../domain/boosters";
import { UNLIMITED_DRACHMAS } from "../config/testing";
import { useGameState, useGameSync } from "../storage/useGameState";
import { buy, finish, refresh, savePlayerName } from "../storage/store";
import { selectionFeedback } from "../interaction/feedback";
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

type Page = "home" | "album" | "missions" | "profile";
const PAGES = [
  ["home", "SANCTUAIRE"],
  ["album", "ALBUM"],
  ["missions", "MISSIONS"],
  ["profile", "PROFIL"],
] as const;
const DESCRIPTIONS = [
  "Les divinités qui veillent sur le ciel, les mers et les mortels.",
  "Les puissances primordiales et les ancêtres des dieux.",
  "Les figures dont les récits traversent les siècles.",
  "Les êtres fascinants des légendes grecques.",
];
export default function BoosterShop() {
  const { width } = useWindowDimensions();
  const state = useGameState();
  const [selected, setSelected] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [wheelBusy, setWheelBusy] = useState(false);
  const [wheelVisible, setWheelVisible] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState<Page>("home");
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const lock = useRef(false);
  const reportError = useCallback(
    (error: unknown) =>
      setError(error instanceof Error ? error.message : String(error)),
    [],
  );
  useGameSync(state?.dailyNextAt, reportError);
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
  const open = async (source: "paid" | "daily", index = selected) => {
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
      selectionFeedback(!reduced);
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
        <View style={[styles.body, { flex: 1, justifyContent: "center" }]}>
          <Text style={styles.title}>OLYMPUS</Text>
          <GreekOrnament />
          <Text style={styles.muted}>
            {error || "Les portes du sanctuaire s’ouvrent…"}
          </Text>
          {!!error && (
            <PremiumButton label="RÉESSAYER" onPress={retrySync} reduced />
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
  const switchPage = (next: Page) => {
    setPage(next);
    setWheelVisible(true);
    setWheelBusy(false);
    selectionFeedback(!reduced);
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
          <Text
            accessibilityRole="header"
            style={[
              styles.title,
              {
                textAlign: "left",
                fontSize: width < 360 ? 20 : 27,
                lineHeight: 36,
              },
            ]}
          >
            OLYMPUS
          </Text>
          <Text
            style={[
              styles.subtitle,
              { fontSize: 9, letterSpacing: 1.5, textAlign: "left" },
            ]}
          >
            DIVINE COLLECTION
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ouvrir mon profil"
            style={{ minHeight: 44, justifyContent: "center" }}
            onPress={() => switchPage("profile")}
          >
            <Text numberOfLines={1} style={[styles.text, { fontSize: 12 }]}>
              {state.playerName ?? "Collectionneur"} ›
            </Text>
          </Pressable>
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
        />
      </View>
      <Animated.View
        key={page}
        entering={reduced ? undefined : FadeIn.duration(240)}
        style={{ flex: 1 }}
      >
        {page === "album" ? (
          <CardCollectionGrid
            collection={state.collection}
            reduced={reduced}
            onInspect={setInspectedId}
          />
        ) : (
          <ScrollView
            scrollEventThrottle={100}
            onScroll={(e) => {
              if (page === "home")
                setWheelVisible(e.nativeEvent.contentOffset.y < 600);
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
                onSave={async (name) => {
                  await savePlayerName(name);
                }}
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
      <View
        style={[styles.navigation, { marginHorizontal: 10, marginBottom: 4 }]}
      >
        {PAGES.map(([id, label]) => (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: page === id }}
            onPress={() => switchPage(id)}
            style={[styles.tab, page === id && styles.activeTab]}
          >
            <Text
              style={[styles.subtitle, { letterSpacing: 0.3, fontSize: 10 }]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
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
