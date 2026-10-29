import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import {
  createDivineParticles,
  divineCohortWaves,
  type DivineParticle,
  type DivineParticleEdge,
} from "../domain/divineReveal";
import { useGraphicsQuality } from "../performance/graphicsQuality";

const GOLD = ["#fff7c7", "#f5ce6c", "#d8a43d", "#fff0a0"] as const;

function particlePath(particles: readonly DivineParticle[]) {
  return particles
    .map((particle) => {
      const { x, y, size } = particle;
      if (particle.diamond)
        return `M${x} ${y - size}L${x + size * 0.72} ${y}L${x} ${y + size}L${x - size * 0.72} ${y}Z`;
      const half = size / 2;
      return `M${x - half} ${y - size}h${size}v${size * 2}h-${size}Z`;
    })
    .join("");
}

function direction(edge: DivineParticleEdge) {
  "worklet";
  if (edge === "left") return { x: -1, y: 0 };
  if (edge === "right") return { x: 1, y: 0 };
  if (edge === "top") return { x: 0, y: -1 };
  return { x: 0, y: 1 };
}

function ParticleCohort({
  path,
  edge,
  wave,
  progress,
  width,
  height,
  color,
}: {
  path: string;
  edge: DivineParticleEdge;
  wave: number;
  progress: SharedValue<number>;
  width: number;
  height: number;
  color: string;
}) {
  const animated = useAnimatedStyle(() => {
    const delay = wave * 0.055;
    const p = Math.max(0, Math.min(1, (progress.value - delay) / (1 - delay)));
    const vector = direction(edge);
    const distance = width * (0.24 + wave * 0.055);
    const gravity = height * (edge === "top" ? 0.12 : 0.34) * p * p;
    return {
      opacity: interpolate(p, [0, 0.045, 0.7, 1], [0, 1, 0.9, 0]),
      transform: [
        { translateX: vector.x * distance * p },
        { translateY: vector.y * distance * p + gravity },
        { scale: 1 - p * 0.3 },
      ],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, animated]}>
      <Svg width="100%" height="100%" style={styles.visible}>
        <Path d={path} fill={color} />
      </Svg>
    </Animated.View>
  );
}

export function DivineCardReveal({
  progress,
  width,
  reduced = false,
}: {
  progress: SharedValue<number>;
  width: number;
  reduced?: boolean;
}) {
  const quality = useGraphicsQuality();
  const height = width * 1.4;
  const waves = divineCohortWaves(quality.tier);
  const cohorts = useMemo(() => {
    if (width <= 0 || height <= 0) return [];
    const grouped = new Map<number, DivineParticle[]>();
    for (const particle of createDivineParticles(width, height, waves)) {
      const group = grouped.get(particle.cohort) ?? [];
      group.push(particle);
      grouped.set(particle.cohort, group);
    }
    return [...grouped.entries()].map(([cohort, particles]) => ({
      cohort,
      edge: particles[0]!.edge,
      wave: Math.floor(cohort / 4),
      path: particlePath(particles),
    }));
  }, [height, waves, width]);
  const halo = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.06, 0.42, 1], [0, 0.95, 0.5, 0]),
    transform: [
      { scale: interpolate(progress.value, [0, 0.35, 1], [0.98, 1.09, 1.16]) },
    ],
  }));
  if (reduced || width <= 0) return null;
  return (
    <View
      testID="divine-card-reveal-effect"
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.layer, { width, height }]}
    >
      <Animated.View style={[styles.halo, halo]} />
      {cohorts.map((cohort) => (
        <ParticleCohort
          key={cohort.cohort}
          {...cohort}
          progress={progress}
          width={width}
          height={height}
          color={GOLD[cohort.cohort % GOLD.length]!}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    inset: 0,
    overflow: "visible",
    zIndex: 12,
  },
  visible: { overflow: "visible" },
  halo: {
    position: "absolute",
    inset: -5,
    borderWidth: 3,
    borderColor: "#f5ce6c",
    borderRadius: 12,
    shadowColor: "#ffe89a",
    shadowOpacity: 0.95,
    shadowRadius: 22,
  },
});

