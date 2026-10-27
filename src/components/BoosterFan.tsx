import { useEffect } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { PACK_SIZE } from "../domain/boosters";
import { CardBack, CARD_ASPECT_RATIO } from "./CardBack";

function FanCard({
  index,
  progress,
  width,
  spacing,
}: {
  index: number;
  progress: SharedValue<number>;
  width: number;
  spacing: number;
}) {
  const style = useAnimatedStyle(() => {
    const t = Math.max(0, Math.min(1, (progress.value - index * 0.035) / 0.75));
    const offset = index - (PACK_SIZE - 1) / 2;
    return {
      opacity: 0.2 + t * 0.8,
      transform: [
        { translateX: offset * spacing * t },
        { translateY: (1 - t) * 65 + Math.abs(offset) * 8 * t },
        { rotate: `${offset * 11 * t}deg` },
        { scale: 0.86 + t * 0.14 },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width,
          aspectRatio: CARD_ASPECT_RATIO,
          borderRadius: 7,
          overflow: "hidden",
          backgroundColor: "#101c30",
          shadowColor: "#edce8b",
          shadowRadius: 12,
          shadowOpacity: 0.3,
          shadowOffset: { width: 0, height: 2 },
        },
        style,
      ]}
    >
      <CardBack />
    </Animated.View>
  );
}

export function BoosterFan({
  reduced,
  active,
}: {
  reduced: boolean;
  active: boolean;
}) {
  const { width } = useWindowDimensions();
  const progress = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) progress.value = 1;
    else if (active)
      progress.value = withTiming(1, {
        duration: 1250,
        easing: Easing.out(Easing.cubic),
      });
    else cancelAnimation(progress);
    return () => cancelAnimation(progress);
  }, [active, reduced, progress]);
  const cardWidth = Math.min(width * 0.28, 118);
  const spacing = Math.min(32, (width - 90 - cardWidth) / 6);
  return (
    <Animated.View
      accessible
      accessibilityLabel="Les sept cartes se déploient en éventail"
      style={s.fan}
    >
      {Array.from({ length: PACK_SIZE }, (_, i) => (
        <FanCard
          key={i}
          index={i}
          progress={progress}
          width={cardWidth}
          spacing={spacing}
        />
      ))}
    </Animated.View>
  );
}
const s = StyleSheet.create({
  fan: { height: 340, alignItems: "center", justifyContent: "center" },
});
