import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { AppText as Text } from "./AppText";
import { styles } from "./theme";
export function PremiumButton({
  label,
  onPress,
  disabled = false,
  reduced = false,
  secondary = false,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  reduced?: boolean;
  secondary?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const scale = useSharedValue(1);
  const motion = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={motion}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => {
          if (!reduced) scale.value = withTiming(0.98, { duration: 90 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: reduced ? 0 : 140 });
        }}
        style={[
          secondary ? styles.outline : styles.button,
          { opacity: disabled ? 0.45 : 1 },
          style,
        ]}
      >
        <Text style={secondary ? styles.text : styles.buttonText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}
