import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import Svg, { Path, Text as SvgText } from "react-native-svg";
import {
  createRarityParticles,
  isSupportedRevealRarity,
  RARITY_PARTICLE_EFFECTS,
  rarityParticleWaves,
  type RarityParticle,
  type RarityParticleEdge,
  type RarityParticleKind,
  type SupportedRevealRarity,
} from "../domain/rarityRevealParticles";
import { useGraphicsQuality } from "../performance/graphicsQuality";

function shapePath(kind: RarityParticleKind, particles: readonly RarityParticle[]) {
  return particles
    .map(({ x, y, size }) => {
      if (kind === "ember") {
        const radius = size * 0.55;
        return `M${x - radius} ${y}a${radius} ${radius} 0 1 0 ${radius * 2} 0a${radius} ${radius} 0 1 0-${radius * 2} 0`;
      }
      if (kind === "star")
        return `M${x} ${y - size}L${x + size * 0.3} ${y - size * 0.3}L${x + size} ${y}L${x + size * 0.3} ${y + size * 0.3}L${x} ${y + size}L${x - size * 0.3} ${y + size * 0.3}L${x - size} ${y}L${x - size * 0.3} ${y - size * 0.3}Z`;
      return `M${x} ${y - size * 1.7}L${x + size * 0.7} ${y}L${x} ${y + size * 1.7}L${x - size * 0.7} ${y}Z`;
    })
    .join("");
}

function direction(edge: RarityParticleEdge) {
  "worklet";
  if (edge === "left") return { x: -1, y: 0 };
  if (edge === "right") return { x: 1, y: 0 };
  if (edge === "top") return { x: 0, y: -1 };
  return { x: 0, y: 1 };
}

function ParticleCohort({
  particles,
  path,
  edge,
  wave,
  rarity,
  progress,
  width,
  height,
  color,
}: {
  particles: readonly RarityParticle[];
  path: string;
  edge: RarityParticleEdge;
  wave: number;
  rarity: SupportedRevealRarity;
  progress: SharedValue<number>;
  width: number;
  height: number;
  color: string;
}) {
  const kind = RARITY_PARTICLE_EFFECTS[rarity].kind;
  const animated = useAnimatedStyle(() => {
    const delay = wave * 0.065;
    const p = Math.max(0, Math.min(1, (progress.value - delay) / (1 - delay)));
    const vector = direction(edge);
    const distance = width * (0.2 + rarity * 0.018 + wave * 0.04);
    const legendary = rarity === 4;
    const gravity = legendary
      ? -height * 0.16 * p
      : height * (edge === "top" ? 0.1 : 0.28) * p * p;
    const outwardY =
      legendary && edge === "bottom" ? distance * 0.85 * p : vector.y * distance * p;
    return {
      opacity: interpolate(p, [0, 0.055, 0.72, 1], [0, 1, 0.92, 0]),
      transform: [
        { translateX: vector.x * distance * p },
        { translateY: outwardY + gravity },
        { scale: 0.35 + p * 0.75 },
      ],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, animated]}>
      <Svg width="100%" height="100%" style={styles.visible}>
        {kind === "rune" ? (
          particles.map((particle, index) => (
            <SvgText
              key={index}
              x={particle.x}
              y={particle.y}
              fill={color}
              fontFamily="serif"
              fontSize={particle.size * 3.2}
              fontWeight="bold"
              textAnchor="middle"
            >
              {particle.symbol}
            </SvgText>
          ))
        ) : (
          <Path d={path} fill={color} />
        )}
      </Svg>
    </Animated.View>
  );
}

export function RarityCardReveal({
  rarity,
  progress,
  width,
  reduced = false,
}: {
  rarity: number;
  progress: SharedValue<number>;
  width: number;
  reduced?: boolean;
}) {
  const quality = useGraphicsQuality();
  const height = width * 1.4;
  const waves = rarityParticleWaves(quality.tier);
  const supported = isSupportedRevealRarity(rarity) ? rarity : null;
  const cohorts = useMemo(() => {
    if (!supported || width <= 0 || height <= 0) return [];
    const grouped = new Map<number, RarityParticle[]>();
    for (const particle of createRarityParticles(supported, width, height, waves)) {
      const group = grouped.get(particle.cohort) ?? [];
      group.push(particle);
      grouped.set(particle.cohort, group);
    }
    const kind = RARITY_PARTICLE_EFFECTS[supported].kind;
    return [...grouped.entries()].map(([cohort, particles]) => ({
      cohort,
      particles,
      edge: particles[0]!.edge,
      wave: Math.floor(cohort / 4),
      path: kind === "rune" ? "" : shapePath(kind, particles),
    }));
  }, [height, supported, waves, width]);
  if (reduced || !supported || width <= 0) return null;
  const config = RARITY_PARTICLE_EFFECTS[supported];
  return (
    <View
      testID={`rarity-card-reveal-${supported}`}
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.layer, { width, height }]}
    >
      {cohorts.map((cohort) => (
        <ParticleCohort
          key={cohort.cohort}
          {...cohort}
          rarity={supported}
          progress={progress}
          width={width}
          height={height}
          color={config.colors[cohort.cohort % config.colors.length]!}
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
    zIndex: 11,
  },
  visible: { overflow: "visible" },
});

