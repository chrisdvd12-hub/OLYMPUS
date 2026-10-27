import { useRef, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { COLORS, RARITIES, type Card } from "../domain/catalog";
import { CardFrame } from "./CardFrame";
import { CardBack, CARD_ASPECT_RATIO } from "./CardBack";
import { theme } from "./theme";
export function BoosterCardReveal({
  card,
  index,
  revealed,
  onReveal,
  reduced,
  compact = false,
  fullWidth = false,
  enabled = true,
}: {
  card: Card;
  index: number;
  revealed: boolean;
  onReveal: () => void;
  reduced: boolean;
  compact?: boolean;
  fullWidth?: boolean;
  enabled?: boolean;
}) {
  const revealing = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const turn = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateY: `${(1 - turn.value) * 180}deg` },
    ],
  }));
  const reveal = () => {
    if (revealed || revealing.current) return;
    revealing.current = true;
    turn.value = withTiming(0.5, {
      duration: reduced ? 0 : card.rarity >= 4 ? 1200 : 500,
    });
    timer.current = setTimeout(
      () => {
        turn.value = withTiming(1, { duration: reduced ? 0 : 300 });
        onReveal();
      },
      reduced ? 0 : card.rarity >= 4 ? 1200 : 500,
    );
  };
  return (
    <Pressable
      disabled={!enabled}
      accessibilityRole="button"
      accessibilityLabel={
        revealed
          ? `${card.name}, ${RARITIES[card.rarity]}`
          : `Révéler la carte ${index + 1}`
      }
      onPress={reveal}
      style={{
        width: fullWidth ? "100%" : compact ? "23%" : "30%",
        marginBottom: 12,
      }}
    >
      <Animated.View
        style={[
          {
            aspectRatio: CARD_ASPECT_RATIO,
            borderWidth: revealed ? 2 : 0,
            borderColor: revealed ? COLORS[card.rarity] : theme.gold,
            borderRadius: 7,
            backgroundColor:
              revealed && card.rarity >= 5 ? "#2a173d" : "#132339",
            padding: revealed ? 6 : 0,
            overflow: "hidden",
            justifyContent: "space-between",
            alignItems: "center",
            shadowColor: COLORS[card.rarity],
            shadowOpacity: revealed ? 0.65 : 0,
            shadowRadius: 16,
          },
          style,
        ]}
      >
        {revealed ? (
          <>
            <CardFrame rarity={revealed ? card.rarity : 4} />
            <Text
              style={{ color: theme.gold, fontSize: 9, textAlign: "center" }}
            >
              {revealed ? card.name.toUpperCase() : "OLYMPUS"}
            </Text>
            <Text
              style={{
                color: revealed ? COLORS[card.rarity] : theme.gold,
                fontSize: 32,
              }}
            >
              {revealed ? "✧" : "♜"}
            </Text>
            <View>
              <Text
                style={{
                  color: revealed ? COLORS[card.rarity] : theme.gold,
                  fontSize: 8,
                  textAlign: "center",
                }}
              >
                {revealed
                  ? RARITIES[card.rarity]?.toUpperCase()
                  : "DIVINE COLLECTION"}
              </Text>
              {revealed && (
                <Text
                  style={{ color: "#a9a698", fontSize: 7, textAlign: "center" }}
                >
                  ART PROVISOIRE
                </Text>
              )}
            </View>
          </>
        ) : (
          <CardBack />
        )}
      </Animated.View>
    </Pressable>
  );
}
