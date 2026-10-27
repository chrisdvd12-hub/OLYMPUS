import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  FadeIn,
} from "react-native-reanimated";
import { BoosterAura } from "./BoosterAura";
import { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { EXTENSIONS, COLORS } from "../domain/catalog";
import type { Receipt } from "../domain/boosters";
import { CardBack, CARD_ASPECT_RATIO } from "./CardBack";
import { BoosterPack } from "./BoosterPack";
import { BoosterTearAnimation } from "./BoosterTearAnimation";
import { BoosterParticles } from "./BoosterParticles";
import { BoosterCardReveal } from "./BoosterCardReveal";
import { BoosterResults } from "./BoosterResults";
import { styles } from "./theme";
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
  const [torn, setTorn] = useState(false);
  const [revealed, setRevealed] = useState<number[]>([]);
  useEffect(() => {
    const timer = setTimeout(() => setPhase("tear"), reduced ? 0 : 1500);
    return () => clearTimeout(timer);
  }, [reduced]);
  const float = useSharedValue(0);
  useEffect(() => {
    if (!reduced)
      float.value = withRepeat(withTiming(-8, { duration: 1800 }), -1, true);
    return () => cancelAnimation(float);
  }, [float, reduced]);
  const floating = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));
  useEffect(() => {
    if (phase !== "fan") return;
    const t = setTimeout(() => setPhase("cards"), reduced ? 0 : 1100);
    return () => clearTimeout(t);
  }, [phase, reduced]);
  const last = revealed.length
    ? receipt.cards[revealed[revealed.length - 1]!]!
    : null;
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: 24, paddingBottom: 36 }}
    >
      {revealed.length === 7 ? (
        <BoosterResults
          receipt={receipt}
          onCollection={() => onExit("collection")}
          onAgain={() => onExit("again")}
          onShop={() => onExit("shop")}
        />
      ) : (
        <View style={styles.body}>
          <Text style={styles.subtitle}>LE DESTIN VOUS ATTEND</Text>
          <Text style={styles.title}>
            {phase === "cards" ? "RÉVÉLATION" : "L’OFFRANDE"}
          </Text>
          <BoosterAura rarity={last?.rarity ?? 0} reduced={reduced} />
          <BoosterParticles
            reduced={reduced}
            color={last ? COLORS[last.rarity] : undefined}
          />
          {phase === "fan" ? (
            <Animated.View
              entering={reduced ? undefined : FadeIn.duration(700)}
              style={{
                height: 340,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {receipt.cards.map((_, i) => (
                <View
                  key={i}
                  style={{
                    position: "absolute",
                    width: 95,
                    aspectRatio: CARD_ASPECT_RATIO,
                    overflow: "hidden",
                    borderRadius: 6,
                    backgroundColor: "#12253c",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: [
                      { translateX: (i - 3) * 28 },
                      { translateY: Math.abs(i - 3) * 8 },
                      { rotate: `${(i - 3) * 10}deg` },
                    ],
                  }}
                >
                  <CardBack />
                </View>
              ))}
            </Animated.View>
          ) : phase !== "cards" ? (
            <>
              <Animated.View
                style={[
                  { alignItems: "center", paddingVertical: 16 },
                  floating,
                ]}
              >
                <BoosterPack
                  torn={torn}
                  extension={EXTENSIONS.find(
                    (e) => e.id === receipt.extension,
                  )!}
                  reduced={reduced}
                />
              </Animated.View>
              {phase === "tear" ? (
                <BoosterTearAnimation
                  onTear={() => setTorn(true)}
                  reduced={reduced}
                  onOpen={() => setPhase("fan")}
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
                {receipt.cards.map((card, i) => (
                  <BoosterCardReveal
                    key={i}
                    card={card}
                    index={i}
                    enabled={i === revealed.length}
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
  );
}
