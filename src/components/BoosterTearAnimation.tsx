import { AppText as Text } from "./AppText";
import { useRef } from "react";
import { View, PanResponder, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { styles, theme } from "./theme";
export function BoosterTearAnimation({
  onOpen,
  reduced,
  onTear,
}: {
  onOpen: () => void;
  reduced: boolean;
  onTear?: () => void;
}) {
  const progress = useSharedValue(0);
  const fired = useRef(false);
  const open = () => {
    if (fired.current) return;
    fired.current = true;
    onTear?.();
    progress.value = withTiming(1, { duration: reduced ? 0 : 550 });
    setTimeout(onOpen, reduced ? 0 : 550);
  };
  const pan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => {
      progress.value = Math.min(1, Math.abs(g.dx) / 160);
    },
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dx) > 100) open();
      else progress.value = withTiming(0);
    },
  });
  const line = useAnimatedStyle(() => ({
    width: `${10 + progress.value * 90}%` as `${number}%`,
    opacity: 0.4 + progress.value * 0.6,
  }));
  return (
    <View style={{ gap: 14 }}>
      <View
        {...pan.panHandlers}
        accessible
        accessibilityLabel="Zone de découpe. Glissez horizontalement."
        style={{
          height: 60,
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "#ddbd7b44",
          padding: 10,
        }}
      >
        <Animated.View
          style={[{ height: 2, backgroundColor: theme.gold }, line]}
        />
        <Text style={styles.muted}>Glissez pour déchirer le sachet →</Text>
      </View>
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
