import { BoosterParticles } from "./BoosterParticles";
import { useOpeningLoop } from "../animations/openingMotion";
import { useAnimatedStyle } from "react-native-reanimated";
import { View } from "react-native";
import Svg, { Path, Circle, Line } from "react-native-svg";
import Animated, { FadeIn } from "react-native-reanimated";
import { COLORS } from "../domain/catalog";
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
  return (
    <Animated.View
      pointerEvents="none"
      entering={
        reduced ? undefined : FadeIn.duration(rarity === 6 ? 1600 : 900)
      }
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor:
          rarity >= 5 ? "#080713bb" : rarity >= 3 ? "#20193222" : "transparent",
      }}
    >
      {rarity >= 2 && <BoosterParticles color={color} reduced={reduced} burst />}
      <Animated.View style={[{ position: "absolute", inset: 0 }, orbit]}>
      <Svg width="100%" height="100%" viewBox="0 0 360 600">
        <Circle
          cx="180"
          cy="280"
          r="125"
          fill={color}
          opacity={
            final
              ? rarity === 6
                ? ".38"
                : rarity >= 4
                  ? ".26"
                  : ".14"
              : rarity === 6
                ? ".24"
                : rarity >= 4
                  ? ".16"
                  : ".07"
          }
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
        {rarity === 5 ? (
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
          Array.from({ length: 18 }, (_, i) => {
            const a = (i * Math.PI) / 9;
            return (
              <Line
                key={i}
                x1={180 + Math.cos(a) * 110}
                y1={280 + Math.sin(a) * 110}
                x2={180 + Math.cos(a) * 230}
                y2={280 + Math.sin(a) * 230}
                stroke={color}
                strokeWidth={rarity === 6 ? 3 : 1}
                opacity=".2"
              />
            );
          })
        )}
      </Svg>
      </Animated.View>
    </Animated.View>
  );
}
