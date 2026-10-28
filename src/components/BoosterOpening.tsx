import { AppText as Text } from "./AppText";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import { BoosterAura } from "./BoosterAura";
import { useState, useEffect, useMemo } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { EXTENSIONS, COLORS } from "../domain/catalog";
import type { Receipt } from "../domain/boosters";
import { BoosterSky, CELESTIAL_MOTIFS } from "./BoosterSky";
import { BoosterFan } from "./BoosterFan";
import { useAppActivity } from "../animations/openingMotion";
import { BoosterPack } from "./BoosterPack";
import { BoosterTearAnimation } from "./BoosterTearAnimation";
import { BoosterParticles } from "./BoosterParticles";
import { CardRevealAnimation } from "./CardRevealAnimation";
import { BoosterResults } from "./BoosterResults";
import { GreekOrnament } from "./GreekOrnament";
import { styles } from "./theme";
import { finalRevealHold, sortCardsForReveal } from "../domain/reveal";
export function BoosterOpening({
  receipt,
  reduced,
  onExit,
}: {
  receipt: Receipt;
  reduced: boolean;
  onExit: (destination: "shop" | "collection" | "again") => void;
}) {
  const [phase, setPhase] = useState<"present" | "tear" | "fan" | "cards">(
    "present",
  );
  const appActive = useAppActivity();
  const [torn, setTorn] = useState(false);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const orderedCards = useMemo(
    () => sortCardsForReveal(receipt.cards),
    [receipt.cards],
  );
  useEffect(() => {
    if (phase !== "present" || !appActive) return;
    const timer = setTimeout(() => setPhase("tear"), reduced ? 0 : 1500);
    return () => clearTimeout(timer);
  }, [reduced, phase, appActive]);
  const float = useSharedValue(0);
  const arrival = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (appActive)
      arrival.value = withTiming(1, { duration: reduced ? 0 : 650 });
    return () => cancelAnimation(arrival);
  }, [appActive, arrival, reduced]);
  useEffect(() => {
    if (!reduced && appActive && (phase === "present" || phase === "tear"))
      float.value = withRepeat(withTiming(-8, { duration: 1800 }), -1, true);
    return () => cancelAnimation(float);
  }, [float, reduced, appActive, phase]);
  const floating = useAnimatedStyle(() => ({
    opacity: 0.65 + arrival.value * 0.35,
    transform: [
      { translateY: float.value + (1 - arrival.value) * 30 },
      { scale: 0.88 + arrival.value * 0.16 },
    ],
  }));
  useEffect(() => {
    if (phase !== "fan" || !appActive) return;
    const t = setTimeout(() => setPhase("cards"), reduced ? 0 : 2300);
    return () => clearTimeout(t);
  }, [phase, reduced, appActive]);
  const last = revealed.length
    ? orderedCards[revealed[revealed.length - 1]!]!
    : null;
  const allRevealed = revealed.length === orderedCards.length;
  useEffect(() => {
    if (!allRevealed || !last || showResults) return;
    const timer = setTimeout(
      () => setShowResults(true),
      finalRevealHold(last.rarity, reduced),
    );
    return () => clearTimeout(timer);
  }, [allRevealed, last, reduced, showResults]);
  const complete = showResults;
  return (
    <View style={styles.screen}>
      <BoosterSky
        extension={receipt.extension}
        active={appActive && !reduced && !complete}
      />
      {!complete && (
        <BoosterAura
          key={revealed.length}
          rarity={last?.rarity ?? 0}
          reduced={reduced || !appActive}
          final={allRevealed}
        />
      )}
      <BoosterParticles
        color={last ? COLORS[last.rarity] : undefined}
        reduced={reduced}
        active={appActive && !complete}
        burst={torn}
      />
      {!complete && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Passer les animations et voir les sept cartes"
          style={{
            alignSelf: "flex-end",
            minHeight: 48,
            justifyContent: "center",
            paddingHorizontal: 18,
            zIndex: 10,
          }}
          onPress={() => {
            setTorn(true);
            setPhase("cards");
            setRevealed(orderedCards.map((_card, index) => index));
            setShowResults(true);
          }}
        >
          <Text style={styles.subtitle}>PASSER LES ANIMATIONS</Text>
        </Pressable>
      )}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 36 }}
      >
        {complete ? (
          <BoosterResults
            receipt={receipt}
            reduced={reduced}
            onCollection={() => onExit("collection")}
            onAgain={() => onExit("again")}
            onShop={() => onExit("shop")}
          />
        ) : (
          <View style={styles.body}>
            <Text
              style={[
                styles.subtitle,
                { color: "#dfc38b", letterSpacing: 1.5, lineHeight: 18 },
              ]}
            >
              {CELESTIAL_MOTIFS[receipt.extension]?.title ??
                "LE DESTIN VOUS ATTEND"}
            </Text>
            <Text style={styles.title}>
              {phase === "cards" ? "RÉVÉLATION" : "L’OFFRANDE"}
            </Text>
            <GreekOrnament />
            {phase === "fan" ? (
              <BoosterFan reduced={reduced} active={appActive} />
            ) : phase !== "cards" ? (
              <>
                <Animated.View
                  style={[
                    { alignItems: "center", paddingVertical: 16 },
                    floating,
                  ]}
                >
                  <BoosterPack
                    active={appActive}
                    torn={torn}
                    extension={
                      EXTENSIONS.find((e) => e.id === receipt.extension)!
                    }
                    reduced={reduced}
                  />
                </Animated.View>
                {phase === "tear" ? (
                  <BoosterTearAnimation
                    onTear={() => setTorn(true)}
                    reduced={reduced}
                    onOpen={() => setPhase("fan")}
                    color={
                      EXTENSIONS.find((e) => e.id === receipt.extension)!.color
                    }
                  />
                ) : (
                  <Text style={styles.muted}>
                    Les portes de l’Olympe s’ouvrent…
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text style={styles.muted}>
                  Touchez les cartes une à une · {revealed.length}/7
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: 9,
                  }}
                >
                  {orderedCards.map((card, i) => (
                    <CardRevealAnimation
                      key={`${card.id}-${i}`}
                      card={card}
                      index={i}
                      enabled={i === revealed.length}
                      final={i === orderedCards.length - 1}
                      reduced={reduced}
                      revealed={revealed.includes(i)}
                      onReveal={() =>
                        setRevealed((old) =>
                          old.includes(i) ? old : [...old, i],
                        )
                      }
                    />
                  ))}
                </View>
                <Text accessibilityLiveRegion="polite" style={styles.title}>
                  {last && last.rarity >= 4
                    ? `${last.rarity === 6 ? "LUMIÈRE DIVINE" : last.rarity === 5 ? "CONSTELLATION MYTHIQUE" : "ÉCLAT LÉGENDAIRE"}`
                    : ""}
                </Text>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
