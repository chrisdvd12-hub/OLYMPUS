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
import { PRICE, RECHARGE_MS, type GameState } from "../domain/boosters";
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
  const lock = useRef(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    refresh()
      .then(setState)
      .catch((e) => setError(String(e)));
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const motion = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    const app = AppState.addEventListener("change", (s) => {
      if (s === "active")
        refresh()
          .then(setState)
          .catch((e) => setError(String(e)));
    });
    const timer = setInterval(() => {
      setNow(Date.now());
      refresh()
        .then(setState)
        .catch((e) => setError(String(e)));
    }, 30000);
    return () => {
      motion.remove();
      app.remove();
      clearInterval(timer);
    };
  }, []);
  const open = async (source: "paid" | "free") => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      setState(
        await buy(
          EXTENSIONS[selected]!.id,
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
  const remaining = Math.max(0, state.rechargeAt + RECHARGE_MS - now);
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.ceil((remaining % 3600000) / 60000);
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
            <Text style={{ color: theme.gold }}>
              ◉{" "}
              {UNLIMITED_DRACHMAS
                ? "∞ drachmes · TEST"
                : `${state.drachmas} drachmes`}
            </Text>
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
                  <Text key={c.id} style={styles.text}>
                    {c.name} · {RARITIES[c.rarity]} · ×{state.collection[c.id]}
                  </Text>
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
                  Drachmes insuffisantes. Les charges gratuites restent
                  disponibles.
                </Text>
              )}
              <View style={styles.panel}>
                <Text style={[styles.text, { color: theme.gold }]}>
                  L’OFFRANDE DES DIEUX
                </Text>
                <Text style={styles.text}>
                  {state.freeCharges} / 2 boosters gratuits
                </Text>
                <Text style={styles.muted}>
                  {state.freeCharges === 2
                    ? "Vos deux offrandes sont prêtes."
                    : `Prochaine charge dans ${hours} h ${minutes} min`}
                </Text>
                <Pressable
                  disabled={busy || state.freeCharges === 0}
                  style={[
                    styles.outline,
                    { opacity: state.freeCharges === 0 ? 0.4 : 1 },
                  ]}
                  onPress={() => open("free")}
                >
                  <Text style={styles.text}>OUVRIR GRATUITEMENT</Text>
                </Pressable>
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
    </SafeAreaView>
  );
}
