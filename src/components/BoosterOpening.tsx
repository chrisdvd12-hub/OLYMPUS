import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import { BoosterAura } from "./BoosterAura";
import { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { EXTENSIONS, COLORS } from "../domain/catalog";
import type { Receipt } from "../domain/boosters";
import { BoosterSky, CELESTIAL_MOTIFS } from "./BoosterSky";
import { BoosterFan } from "./BoosterFan";
import { useAppActivity } from "../animations/openingMotion";
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
  const appActive = useAppActivity();
  const [torn, setTorn] = useState(false);
  const [revealed, setRevealed] = useState<number[]>([]);
  useEffect(() => {
    if (phase !== "present" || !appActive) return;
    const timer = setTimeout(() => setPhase("tear"), reduced ? 0 : 1500);
    return () => clearTimeout(timer);
  }, [reduced, phase, appActive]);
  const float = useSharedValue(0);
  useEffect(() => {
    if (!reduced && appActive && (phase === "present" || phase === "tear"))
      float.value = withRepeat(withTiming(-8, { duration: 1800 }), -1, true);
    return () => cancelAnimation(float);
  }, [float, reduced, appActive, phase]);
  const floating = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));
  useEffect(() => {
    if (phase !== "fan" || !appActive) return;
    const t = setTimeout(() => setPhase("cards"), reduced ? 0 : 2300);
    return () => clearTimeout(t);
  }, [phase, reduced, appActive]);
  const last = revealed.length
    ? receipt.cards[revealed[revealed.length - 1]!]!
    : null;
  const complete = revealed.length === 7;
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
        />
      )}
      <BoosterParticles
        color={last ? COLORS[last.rarity] : undefined}
        reduced={reduced}
        active={appActive && !complete}
        burst={torn}
      />
      <ScrollView
        style={{ flex: 1 }}
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
    </View>
  );
}
