import { materialResponse } from "../interaction/spatial";
import { useId } from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  G,
  Image as SvgImage,
  LinearGradient,
  Mask,
  Rect,
  Stop,
  Circle,
  Path,
} from "react-native-svg";
import Animated, {
  useAnimatedProps,
  type SharedValue,
} from "react-native-reanimated";
import { useOpeningLoop } from "../animations/openingMotion";
import { RARITY_FRAME_ART } from "./rarityFrameArt";
import type { Card } from "../domain/catalog";

export const MATERIALS = [
  {
    color: "#c4bca9",
    accent: "#e2d5bd",
    strength: 0.025,
    label: "Pierre antique mate",
  },
  {
    color: "#b68b57",
    accent: "#d8ac77",
    strength: 0.045,
    label: "Bronze patiné",
  },
  {
    color: "#468cff",
    accent: "#b3d7ff",
    strength: 0.07,
    label: "Argent et lapis-lazuli",
  },
  {
    color: "#a178da",
    accent: "#e3b8ff",
    strength: 0.085,
    label: "Améthyste irisée",
  },
  { color: "#e3b74a", accent: "#fff0b6", strength: 0.11, label: "Or royal" },
  {
    color: "#9f69dd",
    accent: "#e5ba65",
    strength: 0.12,
    label: "Obsidienne et constellations",
  },
  {
    color: "#fff6dd",
    accent: "#ffd279",
    strength: 0.13,
    label: "Marbre et or céleste",
  },
] as const;
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedG = Animated.createAnimatedComponent(G);
export function CardMaterialEffects({
  card,
  yaw,
  pitch,
  active,
  reduced,
}: {
  card: Card;
  yaw: SharedValue<number>;
  pitch: SharedValue<number>;
  active: boolean;
  reduced: boolean;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const material = MATERIALS[card.rarity]!;
  const shimmer = useOpeningLoop(
    active && !reduced && card.rarity >= 4,
    9000,
    true,
  );
  const props = useAnimatedProps(() => ({
    x: materialResponse(yaw.value, pitch.value, shimmer.value),
  }));
  const sparkle = useAnimatedProps(() => ({
    opacity: reduced ? 0.35 : 0.35 + shimmer.value * 0.5,
  }));
  return (
    <View
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      style={StyleSheet.absoluteFill}
    >
      <Svg width="100%" height="100%" viewBox="0 0 500 700">
        <Defs>
          <Mask
            id={`material-mask-${id}`}
            maskType="alpha"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="500"
            height="700"
          >
            <SvgImage
              href={RARITY_FRAME_ART[card.rarity]}
              width="500"
              height="700"
              preserveAspectRatio="xMidYMid meet"
            />
            <Rect x="60" y="70" width="380" height="375" fill="#fff" />
          </Mask>
          <LinearGradient
            id={`material-light-${id}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="70%"
          >
            <Stop offset="0" stopColor={material.color} stopOpacity="0" />
            <Stop
              offset=".35"
              stopColor={material.color}
              stopOpacity={material.strength * 0.5}
            />
            <Stop
              offset=".5"
              stopColor={material.accent}
              stopOpacity={material.strength}
            />
            <Stop
              offset=".65"
              stopColor={material.color}
              stopOpacity={material.strength * 0.4}
            />
            <Stop offset="1" stopColor={material.color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <G mask={`url(#material-mask-${id})`}>
          <AnimatedRect
            animatedProps={props}
            y="-200"
            width="250"
            height="1100"
            transform="skewX(-18)"
            fill={`url(#material-light-${id})`}
          />
          {card.rarity >= 2 && (
            <AnimatedG animatedProps={sparkle}>
              {Array.from({ length: card.rarity >= 5 ? 12 : 4 }, (_, i) => (
                <Circle
                  key={i}
                  cx={25 + ((i * 83) % 460)}
                  cy={35 + ((i * 117) % 620)}
                  r={i % 3 ? 1 : 2}
                  fill={material.accent}
                />
              ))}
              {card.rarity === 5 && (
                <Path
                  d="M36 95L110 148L202 58L310 134L445 72M110 148L180 225L310 134"
                  stroke={material.accent}
                  strokeWidth=".7"
                  strokeOpacity=".5"
                  fill="none"
                />
              )}
              {card.rarity === 6 && (
                <Path
                  d="M250 18L72 300M250 18L430 290M250 18V410"
                  stroke={material.accent}
                  strokeWidth="1.5"
                  strokeOpacity=".12"
                />
              )}
            </AnimatedG>
          )}
        </G>
      </Svg>
    </View>
  );
}
