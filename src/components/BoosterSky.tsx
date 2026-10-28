import { View, StyleSheet, useWindowDimensions } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { useOpeningLoop } from "../animations/openingMotion";
import { useGraphicsQuality } from "../performance/graphicsQuality";

const STARS = Array.from({ length: 54 }, (_, i) => ({
  x: 10 + ((i * 73 + 19) % 340),
  y: 15 + ((i * 127 + 41) % 770),
  radius: i % 7 === 0 ? 1.7 : i % 3 === 0 ? 1.1 : 0.65,
}));

export const CELESTIAL_MOTIFS: Record<
  string,
  { title: string; path: string; points: [number, number][] }
> = {
  olympe: {
    title: "L’AIGLE DE ZEUS VEILLE SUR VOUS",
    path: "M54 105L122 88L180 118L239 76L310 99M122 88L150 157L180 118L213 164L239 76",
    points: [
      [54, 105],
      [122, 88],
      [180, 118],
      [239, 76],
      [310, 99],
      [150, 157],
      [213, 164],
    ],
  },
  titans: {
    title: "SOUS LA VOÛTE DES TITANS",
    path: "M76 113L110 66L180 48L250 66L284 113L250 161L180 179L110 161ZM110 66L250 161M250 66L110 161",
    points: [
      [76, 113],
      [110, 66],
      [180, 48],
      [250, 66],
      [284, 113],
      [250, 161],
      [180, 179],
      [110, 161],
    ],
  },
  heros: {
    title: "LA LYRE D’ORPHÉE ÉVEILLE LES ÉTOILES",
    path: "M120 57L141 154L219 154L240 57M141 154L180 185L219 154M139 76L221 76M155 76L165 154M180 76V169M205 76L195 154",
    points: [
      [120, 57],
      [141, 154],
      [219, 154],
      [240, 57],
      [180, 185],
      [139, 76],
      [221, 76],
    ],
  },
  creatures: {
    title: "PÉGASE TRAVERSE LE CIEL SACRÉ",
    path: "M78 145L138 96L219 98L253 159L165 178L138 96M219 98L267 48L307 79M138 96L107 43L163 76L219 98",
    points: [
      [78, 145],
      [138, 96],
      [219, 98],
      [253, 159],
      [165, 178],
      [267, 48],
      [307, 79],
      [107, 43],
      [163, 76],
    ],
  },
};

function StarField({ parity }: { parity: number }) {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 360 800"
      preserveAspectRatio="none"
    >
      {STARS.filter((_, i) => i % 2 === parity).map((star, i) => (
        <G key={i} opacity={0.35 + (i % 4) * 0.15}>
          <Circle
            cx={star.x}
            cy={star.y}
            r={star.radius}
            fill={i % 3 === 0 ? "#ecc77d" : "#e5eeff"}
          />
          {star.radius > 1.5 && (
            <Path
              d={`M${star.x - 4} ${star.y}h8M${star.x} ${star.y - 4}v8`}
              stroke="#f7dc9c"
              strokeWidth=".6"
            />
          )}
        </G>
      ))}
    </Svg>
  );
}

export function BoosterSky({
  extension,
  active,
}: {
  extension: string;
  active: boolean;
}) {
  const quality = useGraphicsQuality();
  const { width, height } = useWindowDimensions();
  const animated = active && quality.animateAmbientEffects;
  const drift = useOpeningLoop(animated, 18000, true);
  const breath = useOpeningLoop(animated, 6500, true);
  const orbit = useOpeningLoop(animated, 110000);
  const comet = useOpeningLoop(animated, 13000);
  const near = useAnimatedStyle(() => ({
    opacity: 0.54 + breath.value * 0.36,
    transform: [
      { translateX: -8 + drift.value * 16 },
      { translateY: -drift.value * 32 },
    ],
  }));
  const far = useAnimatedStyle(() => ({
    opacity: 0.85 - breath.value * 0.3,
    transform: [
      { translateX: 8 - drift.value * 14 },
      { translateY: drift.value * 24 },
    ],
  }));
  const circle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbit.value * 360}deg` }],
    opacity: 0.2 + breath.value * 0.13,
  }));
  const constellation = useAnimatedStyle(() => ({
    opacity: 0.32 + breath.value * 0.28,
    transform: [{ translateY: drift.value * 7 }],
  }));
  const shooting = useAnimatedStyle(() => ({
    opacity:
      comet.value > 0.08 && comet.value < 0.24
        ? Math.sin(((comet.value - 0.08) / 0.16) * Math.PI) * 0.7
        : 0,
    transform: [
      { translateX: -comet.value * (width + 180) },
      { translateY: comet.value * 220 },
      { rotate: "-24deg" },
    ],
  }));
  const motif = CELESTIAL_MOTIFS[extension] ?? CELESTIAL_MOTIFS.olympe!;
  const diameter = Math.min(width * 1.15, 500);
  return (
    <View
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      <LinearGradient
        colors={["#030713", "#0b1830", "#111b30", "#080c18"]}
        style={StyleSheet.absoluteFill}
      />
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 360 800"
        preserveAspectRatio="none"
      >
        <Defs>
          <RadialGradient id="olympus-glow" cx="50%" cy="42%" rx="66%" ry="48%">
            <Stop offset="0" stopColor="#b89953" stopOpacity=".2" />
            <Stop offset=".6" stopColor="#29496e" stopOpacity=".1" />
            <Stop offset="1" stopColor="#060a16" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="360" height="800" fill="url(#olympus-glow)" />
        <G stroke="#c6a363" fill="#c6a363" opacity=".12">
          {[0, 324].map((x) => (
            <G key={x}>
              <Path
                d={`M${x} 190h36l-3 16h-30ZM${x + 5} 210h26v465h-26ZM${x} 682h36v10h-36Z`}
                fillOpacity=".25"
              />
              <Path
                d={`M${x + 10} 216v452M${x + 18} 216v452M${x + 26} 216v452`}
                strokeWidth="1"
              />
              <Path
                d={`M${x + 3} 187q-8-16 3-20q12-4 12 17q0-21 12-17q11 4 3 20M${x + 10} 180l8-22l8 22`}
                fill="none"
              />
            </G>
          ))}
          <Path
            d="M78 734L180 683L282 734ZM90 742H270M85 781H275M80 789H280"
            fillOpacity=".12"
          />
          {[109, 143, 177, 211, 245].map((x) => (
            <Path
              key={x}
              d={`M${x} 748v28m-4-32h8m-8 34h8`}
              fill="none"
              strokeWidth="3"
            />
          ))}
          <Path
            d="M11 28h22v8H19v9h14v8H11ZM349 28h-22v8h14v9h-14v8h22Z"
            fill="none"
          />
        </G>
      </Svg>
      <Animated.View style={[StyleSheet.absoluteFill, far]}>
        <StarField parity={0} />
      </Animated.View>
      {quality.animatedSkyLayers > 1 && (
        <Animated.View style={[StyleSheet.absoluteFill, near]}>
          <StarField parity={1} />
        </Animated.View>
      )}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: diameter,
            height: diameter,
            left: (width - diameter) / 2,
            top: Math.min(height * 0.22, 190),
          },
          circle,
        ]}
      >
        <Svg width="100%" height="100%" viewBox="0 0 360 360">
          <Circle
            cx="180"
            cy="180"
            r="155"
            stroke="#dfc188"
            strokeWidth=".7"
            fill="none"
          />
          <Circle
            cx="180"
            cy="180"
            r="147"
            stroke="#dfc188"
            strokeWidth="2"
            strokeDasharray="1 15"
            fill="none"
          />
          <Circle
            cx="180"
            cy="180"
            r="135"
            stroke="#dfc188"
            strokeWidth=".4"
            fill="none"
          />
          {Array.from({ length: 12 }, (_, i) => (
            <Path
              key={i}
              d="M180 17l3 6l-3 6l-3-6Z"
              fill="#f1d28c"
              transform={`rotate(${i * 30} 180 180)`}
            />
          ))}
        </Svg>
      </Animated.View>
      <Animated.View
        style={[
          {
            position: "absolute",
            top: height * 0.06,
            left: 0,
            right: 0,
            height: height * 0.3,
          },
          constellation,
        ]}
      >
        <Svg width="100%" height="100%" viewBox="0 0 360 210">
          <Path d={motif.path} fill="none" stroke="#dbc28b" strokeWidth=".6" />
          {motif.points.map(([x, y], i) => (
            <G key={i}>
              <Circle cx={x} cy={y} r="4.5" fill="#f4dba3" opacity=".12" />
              <Circle cx={x} cy={y} r="1.6" fill="#f4dba3" />
            </G>
          ))}
        </Svg>
      </Animated.View>
      {animated && (
        <Animated.View
          style={[
            {
              position: "absolute",
              right: -120,
              top: height * 0.12,
              width: 100,
              height: 2,
            },
            shooting,
          ]}
        >
          <LinearGradient
            colors={["transparent", "#f6dfa5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, borderRadius: 2 }}
          />
        </Animated.View>
      )}
    </View>
  );
}
