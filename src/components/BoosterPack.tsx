import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { Extension } from "../domain/catalog";
import { PACK_ART, PACK_ART_ASPECT_RATIO } from "./packArt";
import { BoosterShimmer } from "./BoosterShimmer";

const WIDTH = 248;
const HEIGHT = WIDTH / PACK_ART_ASPECT_RATIO;
const SEAL_HEIGHT = HEIGHT * 0.14;

export function BoosterPack({
  extension,
  active = true,
  reduced = false,
  torn = false,
}: {
  extension: Extension;
  active?: boolean;
  reduced?: boolean;
  torn?: boolean;
}) {
  const source = PACK_ART[extension.id];
  const tear = useSharedValue(0);
  useEffect(() => {
    if (active)
      tear.value = withTiming(torn ? 1 : 0, { duration: reduced ? 0 : 500 });
    else cancelAnimation(tear);
    return () => cancelAnimation(tear);
  }, [torn, reduced, active, tear]);
  const cap = useAnimatedStyle(() => ({
    opacity: 1 - tear.value,
    transform: [
      { translateY: -tear.value * 60 },
      { rotate: `${tear.value * -12}deg` },
    ],
  }));
  return (
    <View
      accessibilityLabel={`${extension.name}, 7 cartes, illustration ${extension.hero}`}
      style={s.pack}
    >
      <View pointerEvents="none" style={s.body}>
        <Image
          accessible={false}
          source={source}
          resizeMode="contain"
          style={[s.image, { top: -SEAL_HEIGHT }]}
        />
      </View>
      <Animated.View pointerEvents="none" style={[s.seal, cap]}>
        <Image
          accessible={false}
          source={source}
          resizeMode="contain"
          style={s.image}
        />
      </Animated.View>
      <BoosterShimmer active={active && !reduced} />
    </View>
  );
}

// Intentionally no frame, border, rounded mask, backing plate, or rectangular shadow.
// The source artwork alone supplies all packaging ornaments.
const s = StyleSheet.create({
  pack: { width: WIDTH, height: HEIGHT, overflow: "hidden" },
  image: {
    position: "absolute",
    left: 0,
    top: 0,
    width: WIDTH,
    height: HEIGHT,
  },
  body: {
    position: "absolute",
    top: SEAL_HEIGHT,
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  seal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SEAL_HEIGHT,
    overflow: "hidden",
  },
});
