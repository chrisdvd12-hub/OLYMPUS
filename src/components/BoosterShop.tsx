import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  AccessibilityInfo,
  AppState,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { EXTENSIONS, CARDS, RARITIES } from "../domain/catalog";
import { ZEUS_DIVINE } from "../domain/zeus";
import { CardDetailModal } from "./CardDetailModal";
import { PRICE, type GameState, type BoosterSource } from "../domain/boosters";
import { dailyCountdown } from "../domain/daily";
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
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (state?.dailyNextAt !== undefined && now >= state.dailyNextAt && AppState.currentState === "active") {
      refresh(true).then(setState).catch((e) => setError(String(e)));
    }
  }, [now, state?.dailyNextAt]);
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
        setNow(Date.now());
        refresh(true)
          .then(setState)
          .catch((e) => setError(String(e)));
      }
    });
    const clock = setInterval(() => {
      if (AppState.currentState === "active") setNow(Date.now());
    }, 1000);
    const timer = setInterval(() => {
      setNow(Date.now());
      refresh(AppState.currentState === "active")
        .then(setState)
        .catch((e) => setError(String(e)));
    }, 30000);
    return () => {
      motion.remove();
      app.remove();
      clearInterval(timer);
      clearInterval(clock);
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
      <LinearGradient
        colors={["#23374b", "#080f1e", "#171e2a"]}
        style={{ position: "absolute", inset: 0 }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.body}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.subtitle}>LE SANCTUAIRE</Text>
            <View style={{ alignItems: "flex-end", gap: 6 }}>
              <View style={{ alignItems: "flex-end", gap: 6, maxWidth: 210 }}>
                <Text style={{ color: theme.gold, fontSize: 11 }}>L’OFFRANDE DES DIEUX</Text>
                {(state.dailyPacks?.length ?? 0) > 0 ? (
                  <>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Ouvrir un booster offert"
                      disabled={busy}
                      style={[styles.outline, { minHeight: 48, opacity: busy ? 0.4 : 1 }]}
                      onPress={() => open("daily")}
                    >
                      <Text style={[styles.text, { color: theme.gold, textAlign: "center", fontSize: 13 }]}>OUVRIR UN BOOSTER</Text>
                    </Pressable>
                    <Text style={{ color: theme.gold, fontSize: 11 }}>{state.dailyPacks!.length} booster(s) disponible(s)</Text>
                  </>
                ) : (
                  <>
                    <Text
                      accessibilityLabel={`Prochaine offrande dans ${dailyCountdown(state.dailyNextAt ?? now, now)}`}
                      style={{ color: theme.gold, fontSize: 20, fontVariant: ["tabular-nums"] }}
                    >
                      {dailyCountdown(state.dailyNextAt ?? now, now)}
                    </Text>
                    <Text style={{ color: theme.gold, fontSize: 11 }}>2 boosters aléatoires</Text>
                  </>
                )}
              </View>
              <Text style={{ color: theme.gold }}>
                ◉ {UNLIMITED_DRACHMAS ? "∞ drachmes · TEST" : `${state.drachmas} drachmes`}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>OLYMPUS</Text>
          <Text style={styles.subtitle}>DIVINE COLLECTION</Text>
          <Text
            style={[
              styles.text,
              { textAlign: "center", fontFamily: "serif", fontSize: 22 },
            ]}
          >
            {collection ? "Votre collection" : "Les trésors des dieux"}
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.muted}>Réduire les animations</Text>
            <Switch
              accessibilityLabel="Réduire les animations"
              value={reduced}
              onValueChange={setReduced}
            />
          </View>
        </View>
        {collection ? (
          <View style={styles.body}>
            <Text style={styles.muted}>
              {Object.keys(state.collection).length} / 120 découvertes
            </Text>
            {EXTENSIONS.map((e) => (
              <View key={e.id} style={styles.panel}>
                <Text style={styles.text}>{e.name}</Text>
                {CARDS.filter(
                  (c) => c.extension === e.id && state.collection[c.id],
                ).map((c) => (
                  <Pressable
                    key={c.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Voir ${c.name}, ${RARITIES[c.rarity]}`}
                    style={{ minHeight: 48, justifyContent: "center" }}
                    onPress={() => setInspectedId(c.id)}
                  >
                    <Text style={styles.text}>
                      {c.name} · {RARITIES[c.rarity]} · ×
                      {state.collection[c.id]} ›
                    </Text>
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
              <Text style={styles.muted}>
                Édition de développement · illustrations provisoires locales
              </Text>
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
