import { useRef, useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { COLORS, RARITIES, resolveCard, type Card } from "../domain/catalog";
import { CardMaterialEffects } from "./CardMaterialEffects";
import { useAppActivity } from "../animations/openingMotion";
import { CardFace } from "./CardFace";
import { discoveryFeedback } from "../interaction/feedback";
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
  onInspect,
}: {
  card: Card;
  index: number;
  revealed: boolean;
  onReveal: () => void;
  reduced: boolean;
  compact?: boolean;
  fullWidth?: boolean;
  enabled?: boolean;
  onInspect?: () => void;
}) {
  const current = resolveCard(card);
  const active = useAppActivity();
  const yaw = useSharedValue(0);
  const pitch = useSharedValue(0);
  const artwork = true;
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
      { rotateY: `${(revealed ? turn.value - 1 : 1 - turn.value) * 180}deg` },
    ],
  }));
  const reveal = () => {
    if (revealed) {
      onInspect?.();
      return;
    }
    if (revealing.current) return;
    revealing.current = true;
    discoveryFeedback(!reduced);
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
      disabled={!enabled || (revealed && !onInspect)}
      accessibilityRole="button"
      accessibilityLabel={
        revealed
          ? `${current.name}, ${RARITIES[current.rarity]}`
          : `Révéler la carte ${index + 1}`
      }
      accessibilityHint={
        revealed && onInspect ? "Ouvrir la fiche encyclopédique" : undefined
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
            borderWidth: revealed && !artwork ? 2 : 0,
            borderColor: revealed ? COLORS[card.rarity] : theme.gold,
            borderRadius: artwork && revealed ? 0 : 7,
            backgroundColor:
              revealed && artwork
                ? "transparent"
                : revealed && card.rarity >= 5
                  ? "#2a173d"
                  : "#132339",
            padding: 0,
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
        {revealed ? <><CardFace card={current} material={false} /><CardMaterialEffects card={current} yaw={yaw} pitch={pitch} active={active && enabled} reduced={reduced} /></> : <CardBack />}
      </Animated.View>
    </Pressable>
  );
}
