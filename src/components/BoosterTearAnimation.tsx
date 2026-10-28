import { AppText as Text } from "./AppText";
import { useEffect, useMemo, useRef } from "react";
import { View, Pressable } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { selectionFeedback } from "../interaction/feedback";
import { styles, theme } from "./theme";
export function BoosterTearAnimation({
  onOpen,
  reduced,
  onTear,
  color = theme.gold,
}: {
  onOpen: () => void;
  reduced: boolean;
  onTear?: () => void;
  color?: string;
}) {
  const progress = useSharedValue(0);
  const fired = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const open = () => {
    if (fired.current) return;
    fired.current = true;
    selectionFeedback(!reduced);
    onTear?.();
    progress.value = withTiming(1, { duration: reduced ? 0 : 550 });
    timer.current = setTimeout(onOpen, reduced ? 0 : 550);
  };
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-8, 8])
        .failOffsetY([-28, 28])
        .onUpdate((event) => {
          progress.value = Math.min(1, Math.abs(event.translationX) / 170);
        })
        .onEnd(() => {
          if (progress.value >= 0.62) runOnJS(open)();
          else progress.value = withSpring(0, { damping: 18, stiffness: 180 });
        }),
    [progress, reduced],
  );
  const line = useAnimatedStyle(() => ({
    width: `${10 + progress.value * 90}%` as `${number}%`,
    opacity: 0.4 + progress.value * 0.6,
  }));
  const grip = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * 128 },
      { rotate: `${progress.value * 18}deg` },
      { scale: 1 + progress.value * 0.16 },
    ],
  }));
  const light = useAnimatedStyle(() => ({
    opacity: progress.value * 0.72,
    transform: [{ scaleX: 0.25 + progress.value * 1.25 }],
  }));
  return (
    <View style={{ gap: 14 }}>
      <GestureDetector gesture={pan}>
        <Animated.View
          collapsable={false}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Bande supérieure du booster. Glissez horizontalement pour la déchirer."
          style={{
            height: 76,
            justifyContent: "center",
            borderWidth: 1,
            borderColor: `${color}88`,
            backgroundColor: "#07121edb",
            padding: 12,
            overflow: "hidden",
          }}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                left: 0,
                right: 0,
                top: 25,
                height: 24,
              },
              light,
            ]}
          >
            <LinearGradient
              colors={["transparent", color, "#fff6d8", color, "transparent"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
          <Animated.View
            style={[{ height: 3, backgroundColor: color }, line]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                left: 12,
                top: 22,
                width: 28,
                height: 28,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: "#fff1bf",
                backgroundColor: color,
              },
              grip,
            ]}
          />
          <Text style={styles.muted}>Saisissez le sceau et tirez →</Text>
        </Animated.View>
      </GestureDetector>
      <Pressable
        accessibilityRole="button"
        onPress={open}
        style={styles.button}
      >
        <Text style={styles.buttonText}>DÉCHIRER LE SACHET</Text>
      </Pressable>
    </View>
  );
}
