import { AppText as Text } from "./AppText";
import { useCallback, useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  Pressable,
  Switch,
  AccessibilityInfo,
  AppState,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SanctuaryBackdrop } from "./SanctuaryBackdrop";
import { GreekOrnament, TempleSeal } from "./GreekOrnament";
import { CardFace } from "./CardFace";
import { EXTENSIONS, CARDS, RARITIES } from "../domain/catalog";
import { ZEUS_DIVINE } from "../domain/zeus";
import { CardDetailModal } from "./CardDetailModal";
import { PRICE, type GameState, type BoosterSource } from "../domain/boosters";
import { OfferingBadge } from "./OfferingBadge";
import { UNLIMITED_DRACHMAS } from "../config/testing";
import { buy, finish, refresh } from "../storage/store";
import { BoosterCarousel } from "./BoosterCarousel";
import { BoosterOpening } from "./BoosterOpening";
import { styles, theme } from "./theme";
export default function BoosterShop() {
  const [state, setState] = useState<GameState | null>(null);
  const [selected, setSelected] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [collection, setCollection] = useState(false);
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const lock = useRef(false);
  const updateOffering = useCallback(() => {
    refresh(true).then(setState).catch((e) => setError(String(e)));
  }, []);
  useEffect(() => {
    refresh(true)
      .then(setState)
      .catch((e) => setError(String(e)));
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const motion = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    const app = AppState.addEventListener("change", (s) => {
      if (s === "active") {
        refresh(true)
          .then(setState)
          .catch((e) => setError(String(e)));
      }
    });
    const timer = setInterval(() => {
      refresh(AppState.currentState === "active")
        .then(setState)
        .catch((e) => setError(String(e)));
    }, 30000);
    return () => {
      motion.remove();
      app.remove();
      clearInterval(timer);
    };
  }, []);
  const open = async (source: Exclude<BoosterSource, "free">) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      setState(
        await buy(
          source === "daily" ? state?.dailyPacks?.[0] ?? "" : EXTENSIONS[selected]!.id,
          source,
          `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const exit = async (destination: "shop" | "collection" | "again") => {
    if (!state?.pending) return;
    try {
      setState(await finish(state.pending.id));
      setCollection(destination === "collection");
    } catch (e) {
      setError(String(e));
    }
  };
  if (!state)
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={[styles.text, { padding: 30 }]}>
          {error || "Ouverture des portes de l’Olympe…"}
        </Text>
      </SafeAreaView>
    );
  if (state.pending)
    return (
      <SafeAreaView style={styles.screen}>
        <BoosterOpening
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
  const ext = EXTENSIONS[selected]!;
  const owned = CARDS.filter(
    (c) => c.extension === ext.id && state.collection[c.id],
  ).length;
  return (
    <SafeAreaView style={styles.screen}>
      <SanctuaryBackdrop />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.body}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ flex: 1, gap: 10, alignItems: "flex-start", paddingRight: 12 }}>
              <TempleSeal />
              <Text style={[styles.subtitle, { textAlign: "left", letterSpacing: 1 }]}>LE SANCTUAIRE</Text>
              <View style={styles.wallet}>
                <Text style={{ color: theme.highlight, fontFamily: "CinzelBold", fontSize: 12 }}>
                  {UNLIMITED_DRACHMAS ? "∞ drachmes" : `${state.drachmas} drachmes`}
                </Text>
              </View>
            </View>
            <View style={{ flexShrink: 1, alignItems: "flex-end" }}>
              <OfferingBadge
                nextAt={state.dailyNextAt}
                available={state.dailyPacks?.length ?? 0}
                busy={busy}
                onOpen={() => open("daily")}
                onDue={updateOffering}
              />
            </View>
          </View>
          <Text accessibilityRole="header" style={[styles.title, { fontSize: 40, lineHeight: 54, letterSpacing: 3 }]}>OLYMPUS</Text>
          <Text style={[styles.subtitle, { letterSpacing: 4 }]}>DIVINE COLLECTION</Text>
          <GreekOrnament />
          <Text
            style={[
              styles.text,
              { textAlign: "center", fontFamily: "CinzelSemiBold", fontSize: 22 },
            ]}
          >
            {collection ? "Votre collection" : "Les trésors des dieux"}
          </Text>
          <View style={styles.navigation}>
            <Pressable accessibilityRole="tab" accessibilityState={{ selected: !collection }} style={[styles.tab, !collection && styles.activeTab]} onPress={() => setCollection(false)}>
              <Text style={[styles.subtitle, { letterSpacing: 1 }]}>BOUTIQUE</Text>
            </Pressable>
            <Pressable accessibilityRole="tab" accessibilityState={{ selected: collection }} style={[styles.tab, collection && styles.activeTab]} onPress={() => setCollection(true)}>
              <Text style={[styles.subtitle, { letterSpacing: 1 }]}>COLLECTION</Text>
            </Pressable>
          </View>
        </View>
        {collection ? (
          <View style={styles.body}>
            <Text style={styles.muted}>
              {Object.keys(state.collection).length} / 120 découvertes
            </Text>
            {EXTENSIONS.map((e) => (
              <View key={e.id} style={styles.panel}>
                <Text accessibilityRole="header" style={[styles.subtitle, { fontSize: 15, letterSpacing: 1 }]}>{e.name}</Text>
                <GreekOrnament />
                {CARDS.filter(
                  (c) => c.extension === e.id && state.collection[c.id],
                ).map((c) => (
                  <Pressable
                    key={c.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Voir ${c.name}, ${RARITIES[c.rarity]}`}
                    style={{ minHeight: 78, flexDirection: "row", alignItems: "center", gap: 14, borderBottomWidth: 1, borderBottomColor: "#d4af3722", paddingVertical: 10 }}
                    onPress={() => setInspectedId(c.id)}
                  >
                    <View style={{ width: 42, aspectRatio: 5 / 7 }} accessible={false}><CardFace card={c} compact /></View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={[styles.text, { fontFamily: "CinzelSemiBold" }]}>{c.name}</Text>
                      <Text style={[styles.muted, { textAlign: "left", fontSize: 11 }]}>{c.number} · {RARITIES[c.rarity]}</Text>
                    </View>
                    <Text style={[styles.text, { color: theme.highlight }]}>×{state.collection[c.id]} ›</Text>
                  </Pressable>
                ))}
              </View>
            ))}
            <Pressable
              style={styles.button}
              onPress={() => setCollection(false)}
            >
              <Text style={styles.buttonText}>RETOUR À LA BOUTIQUE</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <BoosterCarousel
              selected={selected}
              onSelect={setSelected}
              reduced={reduced}
            />
            <View style={styles.body}>
              <GreekOrnament />
              <View style={styles.panel}>
              <Text style={[styles.title, { fontSize: 21, letterSpacing: 1 }]}>
                {ext.name}
              </Text>
              <Text style={styles.muted}>
                {owned} / 30 cartes possédées · {Math.round((owned / 30) * 100)}{" "}
                %
              </Text>
              <View
                accessibilityRole="progressbar"
                accessibilityValue={{ min: 0, max: 30, now: owned }}
                style={{ height: 4, backgroundColor: "#343d48" }}
              >
                <View
                  style={{
                    height: 4,
                    width: `${(owned / 30) * 100}%`,
                    backgroundColor: theme.gold,
                  }}
                />
              </View>
              <Text style={styles.muted}>
                7 cartes · Rare ou supérieure garantie
              </Text>
              <Text
                style={[
                  styles.text,
                  { textAlign: "center", color: theme.gold },
                ]}
              >
                {UNLIMITED_DRACHMAS
                  ? "MODE TEST · OUVERTURES ILLIMITÉES"
                  : `${PRICE} DRACHMES`}
              </Text>
              <Pressable
                disabled={busy || !canAfford}
                accessibilityRole="button"
                style={[
                  styles.button,
                  { opacity: busy || !canAfford ? 0.4 : 1 },
                ]}
                onPress={() => open("paid")}
              >
                <Text style={styles.buttonText}>
                  {busy ? "ENREGISTREMENT…" : "OUVRIR UN BOOSTER"}
                </Text>
              </Pressable>
              {!canAfford && (
                <Text style={styles.muted}>
                  Drachmes insuffisantes. Votre prochaine offrande est indiquée en haut à droite.
                </Text>
              )}
              </View>
              <Text style={styles.muted}>
                Protection légendaire · {state.pity}/20
              </Text>
              <Pressable
                style={styles.outline}
                onPress={() => setCollection(true)}
              >
                <Text style={styles.text}>MA COLLECTION</Text>
              </Pressable>
              {ext.id === ZEUS_DIVINE.extension && (
                <Pressable
                  accessibilityRole="button"
                  style={styles.outline}
                  onPress={() => setInspectedId(ZEUS_DIVINE.id)}
                >
                  <Text
                    style={[
                      styles.text,
                      { color: theme.gold, textAlign: "center" },
                    ]}
                  >
                    VOIR ZEUS DIVIN
                  </Text>
                </Pressable>
              )}
              <View style={[styles.panel, { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }]}>
                <Text style={[styles.muted, { textAlign: "left", flex: 1 }]}>Réduire les animations</Text>
                <Switch accessibilityLabel="Réduire les animations" trackColor={{ false: "#283546", true: "#8f742b" }} thumbColor={theme.paper} value={reduced} onValueChange={setReduced} />
              </View>
              <Text style={styles.muted}>Peintures classiques · Mythologie grecque</Text>
              {!!error && (
                <Text accessibilityRole="alert" style={{ color: "#ffb4a6" }}>
                  {error}
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
      {inspectedId && (
        <CardDetailModal
          cardId={inspectedId}
          quantity={state.collection[inspectedId] ?? 0}
          reduced={reduced}
          onClose={() => setInspectedId(null)}
        />
      )}
    </SafeAreaView>
  );
}
