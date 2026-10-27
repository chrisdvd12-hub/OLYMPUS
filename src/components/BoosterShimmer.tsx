import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
export function BoosterShimmer({ active }: { active: boolean }) {
  const x = useSharedValue(-300);
  useEffect(() => {
    if (active)
      x.value = withRepeat(withTiming(300, { duration: 3200 }), -1, false);
    else cancelAnimation(x);
    return () => cancelAnimation(x);
  }, [active, x]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { rotate: "22deg" }],
  }));
  if (!active) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: "absolute", top: -80, bottom: -80, width: 100 },
        style,
      ]}
    >
      <LinearGradient
        colors={["transparent", "#ffffff24", "transparent"]}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}
