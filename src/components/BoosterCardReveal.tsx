import { useCallback, useRef, useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { COLORS, RARITIES, resolveCard, type Card } from "../domain/catalog";
import { CardMaterialEffects } from "./CardMaterialEffects";
import { useAppActivity } from "../animations/openingMotion";
import { CardFace } from "./CardFace";
import { discoveryFeedback } from "../interaction/feedback";
import { CardBack, CARD_ASPECT_RATIO } from "./CardBack";
import { theme } from "./theme";
import { cardFlipPose, revealTiming } from "../domain/reveal";
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
  final = false,
  onSelect,
  autoReveal = false,
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
  final?: boolean;
  onSelect?: () => void;
  autoReveal?: boolean;
}) {
  const current = resolveCard(card);
  const active = useAppActivity();
  const yaw = useSharedValue(0);
  const pitch = useSharedValue(0);
  const artwork = true;
  const revealing = useRef(false);
  const turn = useSharedValue(revealed ? 1 : 0);
  const bodyStyle = useAnimatedStyle(() => {
    const pose = cardFlipPose(turn.get());
    return {
      transform: [
        { perspective: 1000 },
        { translateY: pose.translateY },
        { rotateZ: `${pose.rotateZ}deg` },
        { scale: pose.scale },
      ],
    };
  });
  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${cardFlipPose(turn.get()).backRotation}deg` },
    ],
  }));
  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${cardFlipPose(turn.get()).frontRotation}deg` },
    ],
  }));
  const edgeStyle = useAnimatedStyle(() => {
    const light = cardFlipPose(turn.get()).edgeLight;
    return {
      opacity: interpolate(light, [0, 0.72, 1], [0, 0.18, 0.85]),
      transform: [{ scale: 0.9 + light * 0.18 }],
    };
  });
  useEffect(() => {
    if (revealed && !revealing.current) turn.set(1);
  }, [revealed, turn]);
  const reveal = useCallback(() => {
    if (onSelect) {
      onSelect();
      return;
    }
    if (revealed) {
      onInspect?.();
      return;
    }
    if (revealing.current) return;
    revealing.current = true;
    discoveryFeedback(!reduced);
    const timing = revealTiming(card.rarity, final, reduced);
    turn.set(
      withTiming(
        1,
        {
          duration: timing.firstHalf + timing.secondHalf,
          easing: Easing.bezier(0.77, 0, 0.175, 1),
        },
        (finished) => {
          if (finished) scheduleOnRN(onReveal);
        },
      ),
    );
  }, [
    card.rarity,
    final,
    onInspect,
    onReveal,
    onSelect,
    reduced,
    revealed,
    turn,
  ]);
  useEffect(() => {
    if (!autoReveal || revealed || onSelect) return;
    const automatic = setTimeout(reveal, reduced ? 0 : 220);
    return () => clearTimeout(automatic);
  }, [autoReveal, onSelect, reduced, reveal, revealed]);
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
          bodyStyle,
        ]}
      >
        <Animated.View pointerEvents="none" style={[faceStyle, backStyle]}>
          <CardBack />
        </Animated.View>
        <Animated.View pointerEvents="none" style={[faceStyle, frontStyle]}>
          <CardFace card={current} material={false} />
          <CardMaterialEffects
            card={current}
            yaw={yaw}
            pitch={pitch}
            active={active && enabled && (revealed || autoReveal)}
            reduced={reduced}
          />
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              inset: 0,
              borderRadius: 7,
              borderWidth: 2,
              borderColor: COLORS[card.rarity],
              shadowColor: COLORS[card.rarity],
              shadowOpacity: 1,
              shadowRadius: 24,
            },
            edgeStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const faceStyle = {
  position: "absolute" as const,
  inset: 0,
  backfaceVisibility: "hidden" as const,
  overflow: "hidden" as const,
  justifyContent: "center" as const,
  alignItems: "center" as const,
};
