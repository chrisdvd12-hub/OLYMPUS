import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useOpeningLoop } from "../animations/openingMotion";

const MOTES = Array.from({ length: 18 }, (_, i) => ({
  left: 8 + ((i * 37) % 84),
  top: 28 + ((i * 23) % 58),
  size: i % 4 === 0 ? 5 : 2,
}));

function Mote({
  index,
  clock,
  color,
}: {
  index: number;
  clock: SharedValue<number>;
  color: string;
}) {
  const mote = MOTES[index]!;
  const style = useAnimatedStyle(() => {
    const t = (clock.value + index / MOTES.length) % 1;
    return {
      opacity: Math.sin(t * Math.PI) * 0.7,
      transform: [
        { translateY: 60 - t * 160 },
        { translateX: Math.sin(t * Math.PI * 2 + index) * 20 },
        { rotate: `${t * 140}deg` },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: `${mote.left}%`,
          top: `${mote.top}%`,
          width: mote.size,
          height: mote.size,
          backgroundColor: color,
          borderRadius: mote.size === 2 ? 2 : 1,
        },
        style,
      ]}
    />
  );
}

function Spark({
  index,
  progress,
  color,
}: {
  index: number;
  progress: SharedValue<number>;
  color: string;
}) {
  const angle = Math.PI + (index / 13) * Math.PI;
  const style = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: Math.sin(p * Math.PI) * 0.85,
      transform: [
        { translateX: Math.cos(angle) * p * (90 + (index % 3) * 22) },
        { translateY: Math.sin(angle) * p * 150 + p * p * 65 },
        { rotate: `${p * 240}deg` },
        { scale: 1 - p * 0.6 },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: "50%",
          top: "40%",
          width: index % 3 ? 3 : 6,
          height: index % 3 ? 3 : 6,
          borderRadius: 1,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export function BoosterParticles({
  color = "#ddbd7b",
  reduced = false,
  active = true,
  burst = false,
}: {
  color?: string;
  reduced?: boolean;
  active?: boolean;
  burst?: boolean;
}) {
  const clock = useOpeningLoop(active && !reduced, 11000);
  const release = useSharedValue(1);
  useEffect(() => {
    if (burst && active && !reduced) {
      release.value = 0;
      release.value = withTiming(1, {
        duration: 2100,
        easing: Easing.out(Easing.quad),
      });
    } else {
      cancelAnimation(release);
      release.value = 1;
    }
    return () => cancelAnimation(release);
  }, [burst, active, reduced, release]);
  const wave = useAnimatedStyle(() => ({
    opacity: Math.sin(release.value * Math.PI) * 0.38,
    transform: [{ scale: 0.25 + release.value * 1.8 }],
  }));
  if (reduced || !active) return null;
  return (
    <View
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      {MOTES.map((_, i) => (
        <Mote key={i} index={i} clock={clock} color={color} />
      ))}
      <Animated.View
        style={[
          {
            position: "absolute",
            left: "50%",
            top: "40%",
            marginLeft: -100,
            marginTop: -100,
            width: 200,
            height: 200,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: color,
          },
          wave,
        ]}
      />
      {Array.from({ length: 14 }, (_, i) => (
        <Spark key={i} index={i} progress={release} color={color} />
      ))}
    </View>
  );
}
