import { View, Text } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
export function BoosterParticles({
  color = "#ddbd7b",
  reduced = false,
}: {
  color?: string;
  reduced?: boolean;
}) {
  if (reduced) return null;
  return (
    <Animated.View
      pointerEvents="none"
      entering={FadeIn.duration(900)}
      exiting={FadeOut}
      style={{ position: "absolute", inset: 0 }}
    >
      {Array.from({ length: 16 }, (_, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: `${(i * 37) % 96}%`,
            top: `${(i * 19) % 90}%`,
          }}
        >
          <Text
            style={{
              color,
              opacity: 0.3 + (i % 3) * 0.15,
              fontSize: i % 2 ? 10 : 18,
            }}
          >
            ✦
          </Text>
        </View>
      ))}
    </Animated.View>
  );
}
