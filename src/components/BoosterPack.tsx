import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { View, Text, StyleSheet, Image } from "react-native";
import type { Extension } from "../domain/catalog";
import { BoosterShimmer } from "./BoosterShimmer";
// Affichage local de la planche fournie, avec cadrage de chaque sachet.
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
  const tear = useSharedValue(0);
  useEffect(() => {
    tear.value = withTiming(torn ? 1 : 0, { duration: reduced ? 0 : 500 });
  }, [torn, reduced, tear]);
  const cap = useAnimatedStyle(() => ({
    opacity: 1 - tear.value,
    transform: [
      { translateY: -tear.value * 60 },
      { rotate: `${tear.value * -12}deg` },
    ],
  }));
  const index = ["olympe", "titans", "heros", "creatures"].indexOf(
    extension.id,
  );
  const x = [58, 350, 648, 943][index]!;
  const cropWidth = [290, 296, 294, 302][index]!;
  const k = 248 / cropWidth;
  return (
    <View
      accessibilityLabel={`${extension.name}, 7 cartes, illustration ${extension.hero}`}
      style={[s.pack, { shadowColor: extension.color }]}
    >
      <Image
        source={require("../../assets/references/booster-board.jpg")}
        style={{
          position: "absolute",
          width: 1280 * k,
          height: 853 * k,
          left: -x * k,
          top: -80 * k,
        }}
        resizeMode="stretch"
      />
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 35,
            overflow: "hidden",
            borderBottomWidth: torn ? 2 : 0,
            borderBottomColor: "#ffe8a8",
          },
          cap,
        ]}
      >
        <Image
          source={require("../../assets/references/booster-board.jpg")}
          style={{
            position: "absolute",
            width: 1280 * k,
            height: 853 * k,
            left: -x * k,
            top: -80 * k,
          }}
          resizeMode="stretch"
        />
      </Animated.View>
      <BoosterShimmer active={active && !reduced} />
    </View>
  );
}

const s = StyleSheet.create({
  pack: {
    width: 248,
    height: 364,
    borderWidth: 2,
    borderColor: "#d6b773",
    borderRadius: 7,
    overflow: "hidden",
    backgroundColor: "#10213a",
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  content: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    padding: 16,
    alignItems: "center",
  },
  logo: {
    fontFamily: "serif",
    fontSize: 32,
    color: "#f0d496",
    letterSpacing: 2,
  },
  sub: { color: "#eed8aa", fontSize: 9, letterSpacing: 2 },
  hero: {
    fontFamily: "serif",
    fontSize: 20,
    color: "#f4e3bd",
    letterSpacing: 4,
    marginTop: 110,
  },
  name: {
    color: "#ffe4ad",
    fontFamily: "serif",
    textAlign: "center",
    fontSize: 17,
    lineHeight: 22,
  },
  count: { color: "#ffe4ad", fontSize: 13, letterSpacing: 3, marginTop: 12 },
  placeholder: { color: "#b9ad96", fontSize: 8, marginTop: 8 },
  crimp: {
    position: "absolute",
    top: 0,
    height: 7,
    left: 0,
    right: 0,
    borderTopWidth: 3,
    borderBottomWidth: 1,
    borderColor: "#ddbd7b88",
  },
});
