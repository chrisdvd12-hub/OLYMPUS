import { BoosterParticles } from "./BoosterParticles";
import { useOpeningLoop } from "../animations/openingMotion";
import { useAnimatedStyle } from "react-native-reanimated";
import { View } from "react-native";
import Svg, { Path, Circle, Line, Rect } from "react-native-svg";
import Animated, { FadeIn } from "react-native-reanimated";
import { COLORS } from "../domain/catalog";
import { rarityRevealEffect } from "../domain/rarityEffects";
export function BoosterAura({
  rarity,
  reduced,
  final = false,
}: {
  rarity: number;
  reduced: boolean;
  final?: boolean;
}) {
  const glow = useOpeningLoop(!reduced && rarity >= 2, 7000);
  const orbit = useAnimatedStyle(() => ({ transform: [{ rotate: `${glow.value * 360}deg` }] }));
  if (rarity < 1) return null;
  const color = COLORS[rarity]!;
  const effect = rarityRevealEffect(rarity);
  return (
    <Animated.View
      pointerEvents="none"
      entering={
        reduced ? undefined : FadeIn.duration(rarity === 6 ? 1600 : 900)
      }
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: `rgba(5, 7, 18, ${effect.backdropOpacity})`,
      }}
    >
      <BoosterParticles color={color} reduced={reduced} burst={rarity >= 1} />
      <Animated.View style={[{ position: "absolute", inset: 0 }, orbit]}>
      <Svg width="100%" height="100%" viewBox="0 0 360 600">
        <Circle
          cx="180"
          cy="280"
          r="125"
          fill={color}
          opacity={final ? effect.haloOpacity : effect.haloOpacity * 0.68}
        />
        <Circle
          cx="180"
          cy="280"
          r="100"
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity=".25"
        />
        {effect.constellation ? (
          <>
            <Path
              d="M30 80L100 140L180 55L270 140L330 70M100 140L170 280L270 140"
              stroke={color}
              opacity=".6"
              fill="none"
            />
            {[
              [30, 80],
              [100, 140],
              [180, 55],
              [270, 140],
              [330, 70],
              [170, 280],
            ].map(([x, y], i) => (
              <Circle key={i} cx={x} cy={y} r="3" fill={color} />
            ))}
          </>
        ) : (
          Array.from({ length: effect.rayCount }, (_, i) => {
            const a = (i * Math.PI * 2) / Math.max(1, effect.rayCount);
            return (
              <Line
                key={i}
                x1={180 + Math.cos(a) * 110}
                y1={280 + Math.sin(a) * 110}
                x2={180 + Math.cos(a) * 230}
                y2={280 + Math.sin(a) * 230}
                stroke={color}
                strokeWidth={rarity === 6 ? 3 : rarity >= 4 ? 1.6 : 1}
                opacity={rarity >= 4 ? ".28" : ".16"}
              />
            );
          })
        )}
        {rarity === 4 && <Circle cx="180" cy="280" r="142" fill="none" stroke={color} strokeWidth="4" opacity=".22" />}
        {effect.celestialColumns && (
          <>
            <Rect x="78" y="20" width="22" height="510" rx="11" fill={color} opacity=".10" />
            <Rect x="169" y="0" width="22" height="560" rx="11" fill="#fff8d8" opacity=".18" />
            <Rect x="260" y="20" width="22" height="510" rx="11" fill={color} opacity=".10" />
          </>
        )}
      </Svg>
      </Animated.View>
    </Animated.View>
  );
}
