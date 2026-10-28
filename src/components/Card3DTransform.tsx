import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { cardOrientation } from "../interaction/spatial";
export function Card3DTransform({
  yaw,
  pitch,
  width,
  front,
  back,
}: {
  yaw: SharedValue<number>;
  pitch: SharedValue<number>;
  width: number;
  front: ReactNode;
  back: ReactNode;
}) {
  const frontStyle = useAnimatedStyle(() => {
    const orientation = cardOrientation(yaw.value, pitch.value);
    return {
      opacity: orientation.front ? 1 : 0,
      transform: [
        { perspective: 1100 },
        { rotateX: `${orientation.pitch}deg` },
        { rotateY: `${yaw.value}deg` },
      ],
    };
  });
  const backStyle = useAnimatedStyle(() => {
    const orientation = cardOrientation(yaw.value, pitch.value);
    return {
      opacity: orientation.front ? 0 : 1,
      transform: [
        { perspective: 1100 },
        { rotateX: `${orientation.pitch}deg` },
        { rotateY: `${yaw.value + 180}deg` },
      ],
    };
  });
  const edge = useAnimatedStyle(() => ({
    opacity: Math.abs(Math.sin((yaw.value * Math.PI) / 180)) * 0.8,
    transform: [
      { perspective: 1100 },
      { rotateX: `${pitch.value}deg` },
      { rotateY: `${yaw.value + 90}deg` },
      { scaleX: 0.012 },
    ],
  }));
  const shadow = useAnimatedStyle(() => ({
    opacity: 0.2 + Math.abs(pitch.value) / 140,
    transform: [
      { translateX: Math.sin((yaw.value * Math.PI) / 180) * 12 },
      { scaleX: 1 - Math.abs(Math.sin((yaw.value * Math.PI) / 180)) * 0.5 },
    ],
  }));
  return (
    <View style={{ width, aspectRatio: 5 / 7 }}>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            bottom: -15,
            left: "8%",
            right: "8%",
            height: 18,
            borderRadius: 100,
            backgroundColor: "#000",
          },
          shadow,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: "#c8a45b" }, edge]}
      />
      <Animated.View pointerEvents="none" style={[s.face, frontStyle]}>
        {front}
      </Animated.View>
      <Animated.View pointerEvents="none" style={[s.face, backStyle]}>
        {back}
      </Animated.View>
    </View>
  );
}
const s = StyleSheet.create({
  face: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backfaceVisibility: "hidden",
  },
});
