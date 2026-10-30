import { memo, useId, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Defs,
  G,
  LinearGradient,
  Mask,
  Rect,
  Stop,
} from "react-native-svg";
import Animated, {
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { useOpeningLoop } from "../animations/openingMotion";
import type { Card } from "../domain/catalog";
import {
  COLLECTION_GRID_INTENSITY,
  collectionEffectFor,
  collectionParticleOrigin,
  seededCollectionValue,
  type CollectionEffectProfile,
} from "../domain/collectionEffects";
import { useGraphicsQuality } from "../performance/graphicsQuality";

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedText = Animated.createAnimatedComponent(Text);

export type CollectionEffectMode = "grid" | "detail";

export const CollectionLivingCard = memo(function CollectionLivingCard({
  active,
  mode,
  reduced,
  children,
}: {
  active: boolean;
  mode: CollectionEffectMode;
  reduced: boolean;
  children: ReactNode;
}) {
  const quality = useGraphicsQuality();
  const motion = useOpeningLoop(
    active && !reduced && quality.animateAmbientEffects,
    mode === "detail" ? 4200 : 5600,
    true,
  );
  const livingStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(motion.value, [0, 1], mode === "detail" ? [-3, 3] : [-1, 1]) },
      { rotateZ: `${interpolate(motion.value, [0, 1], mode === "detail" ? [-0.35, 0.35] : [-0.12, 0.12])}deg` },
    ],
  }));
  return <Animated.View style={livingStyle}>{children}</Animated.View>;
});

function particleVector(profile: CollectionEffectProfile, index: number) {
  const origin = collectionParticleOrigin(index);
  const scatter = (seededCollectionValue(index, 2) - 0.5) * 16;
  const distance = 10 + seededCollectionValue(index, 3) * 20;
  const fall = profile.kind === "gold" || profile.kind === "embers" ? 8 : 0;
  if (origin.side === 0) return { x: scatter, y: -distance + fall };
  if (origin.side === 1) return { x: distance, y: scatter + fall };
  if (origin.side === 2) return { x: scatter, y: distance + fall };
  return { x: -distance, y: scatter + fall };
}

const AmbientParticle = memo(function AmbientParticle({
  profile,
  index,
  progress,
  mode,
}: {
  profile: CollectionEffectProfile;
  index: number;
  progress: SharedValue<number>;
  mode: CollectionEffectMode;
}) {
  const origin = collectionParticleOrigin(index);
  const vector = particleVector(profile, index);
  const delay = seededCollectionValue(index, 5);
  const glyph = profile.glyphs[index % Math.max(1, profile.glyphs.length)] ?? "·";
  const animatedStyle = useAnimatedStyle(() => {
    const local = (progress.value + delay) % 1;
    return {
      opacity: Math.sin(local * Math.PI) * (mode === "detail" ? 0.82 : 0.42),
      transform: [
        { translateX: vector.x * local },
        { translateY: vector.y * local },
        { scale: 0.55 + Math.sin(local * Math.PI) * 0.55 },
        { rotateZ: `${local * (index % 2 ? 90 : -90)}deg` },
      ],
    };
  });
  return (
    <AnimatedText
      pointerEvents="none"
      style={[
        particleStyles.base,
        {
          left: `${origin.x * 100}%`,
          top: `${origin.y * 100}%`,
          color: profile.accent,
          fontSize: mode === "detail" ? (profile.kind === "runes" ? 13 : 11) : 7,
          textShadowColor: profile.secondary,
        },
        animatedStyle,
      ]}
    >
      {glyph}
    </AnimatedText>
  );
});

export const CollectionCardEffects = memo(function CollectionCardEffects({
  card,
  width,
  mode,
  lightX,
  lightY,
  active,
  reduced,
}: {
  card: Card;
  width: number;
  mode: CollectionEffectMode;
  lightX: SharedValue<number>;
  lightY: SharedValue<number>;
  active: boolean;
  reduced: boolean;
}) {
  const quality = useGraphicsQuality();
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const profile = collectionEffectFor(card.rarity);
  const isGrid = mode === "grid";
  const foil = profile.foil * (isGrid ? COLLECTION_GRID_INTENSITY.foil : 1);
  const bands = profile.bands * (isGrid ? COLLECTION_GRID_INTENSITY.bands : 1);
  const beam = profile.beam * (isGrid ? COLLECTION_GRID_INTENSITY.beam : 1);
  const ambient = useOpeningLoop(
    active && !reduced && quality.animateAmbientEffects,
    Math.max(2800, 6200 - card.rarity * 430),
    false,
  );
  const foilProps = useAnimatedProps(() => ({
    x: -310 + (lightX.value + 1) * 155 + ambient.value * (isGrid ? 90 : 135),
    y: -150 + (lightY.value + 1) * 70,
  }));
  const bandProps = useAnimatedProps(() => ({
    x: -420 + (lightX.value + 1) * 210 + ambient.value * (isGrid ? 100 : 240),
  }));
  const beamProps = useAnimatedProps(() => ({
    x: -315 + (lightX.value + 1) * 235 + ambient.value * (isGrid ? 120 : 210),
  }));
  const qualityParticles = quality.animateAmbientEffects
    ? Math.round(profile.particles * quality.cardSparkleScale)
    : 0;
  const particleCount = reduced
    ? 0
    : isGrid
      ? Math.min(COLLECTION_GRID_INTENSITY.maxParticles, qualityParticles)
      : qualityParticles;
  const showAura = card.rarity > 0 && (mode === "detail" || card.rarity >= 2);
  return (
    <View
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      style={StyleSheet.absoluteFill}
    >
      {showAura && (
        <View
          style={[
            effectStyles.aura,
            {
              borderColor: profile.accent,
              borderRadius: width * 0.035,
              opacity: isGrid ? 0.2 : 0.4 + card.rarity * 0.045,
              shadowColor: profile.accent,
              shadowRadius: isGrid ? 5 : 9 + card.rarity * 1.4,
            },
          ]}
        />
      )}
      {(foil > 0 || showAura) && (
        <View
          style={[
            effectStyles.clip,
            { borderRadius: width * 0.028 },
          ]}
        >
          <Svg width="100%" height="100%" viewBox="0 0 500 700">
            <Defs>
              <LinearGradient id={`living-${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                <Stop offset="0" stopColor="#ff3c9a" stopOpacity="0" />
                <Stop offset=".18" stopColor="#ff3c9a" stopOpacity={foil * 0.4} />
                <Stop offset=".32" stopColor="#6bffff" stopOpacity={foil * 0.6} />
                <Stop offset=".46" stopColor="#ffe78b" stopOpacity={foil * 0.67} />
                <Stop offset=".6" stopColor="#a673ff" stopOpacity={foil * 0.73} />
                <Stop offset=".74" stopColor="#77ffd6" stopOpacity={foil * 0.67} />
                <Stop offset=".9" stopColor="#fff5cb" stopOpacity={foil * 0.47} />
                <Stop offset="1" stopColor="#fff" stopOpacity="0" />
              </LinearGradient>
              <LinearGradient id={`bands-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0" stopColor="#ff86e5" stopOpacity="0" />
                <Stop offset=".26" stopColor="#ff86e5" stopOpacity={bands * 0.27} />
                <Stop offset=".39" stopColor="#71eaff" stopOpacity={bands * 0.33} />
                <Stop offset=".52" stopColor="#ffed9e" stopOpacity={bands * 0.33} />
                <Stop offset=".66" stopColor="#b184ff" stopOpacity={bands * 0.28} />
                <Stop offset=".82" stopColor="#fff" stopOpacity="0" />
              </LinearGradient>
              <LinearGradient id={`beam-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0" stopColor="#fff" stopOpacity="0" />
                <Stop offset=".44" stopColor="#fff" stopOpacity="0" />
                <Stop offset=".5" stopColor="#fff" stopOpacity={beam * 0.67} />
                <Stop offset=".56" stopColor="#fff" stopOpacity="0" />
                <Stop offset="1" stopColor="#fff" stopOpacity="0" />
              </LinearGradient>
              <Mask
                id={`text-safe-${id}`}
                maskType="alpha"
                x="0"
                y="0"
                width="500"
                height="700"
              >
                <Rect x="0" y="0" width="500" height="700" fill="#fff" />
                <Rect x="145" y="12" width="210" height="48" rx="10" fill="#fff" fillOpacity=".22" />
                <Rect x="82" y="450" width="336" height="58" rx="12" fill="#fff" fillOpacity=".16" />
                <Rect x="75" y="514" width="350" height="88" rx="12" fill="#fff" fillOpacity=".16" />
                <Rect x="82" y="604" width="336" height="66" rx="12" fill="#fff" fillOpacity=".18" />
              </Mask>
            </Defs>
            {showAura && (
              <Rect
                x="4"
                y="4"
                width="492"
                height="692"
                rx="16"
                fill="none"
                stroke={profile.accent}
                strokeWidth={isGrid ? 2 : 4}
                strokeOpacity={isGrid ? 0.14 : 0.25 + card.rarity * 0.035}
              />
            )}
            {foil > 0 && (
              <G mask={`url(#text-safe-${id})`}>
                <AnimatedRect animatedProps={foilProps} width="850" height="900" fill={`url(#living-${id})`} />
                <AnimatedRect animatedProps={bandProps} y="-80" width="900" height="920" fill={`url(#bands-${id})`} />
                <AnimatedRect animatedProps={beamProps} y="-170" width="360" height="1040" fill={`url(#beam-${id})`} />
              </G>
            )}
          </Svg>
        </View>
      )}
      {particleCount > 0 && active && (
        <View pointerEvents="none" style={effectStyles.particles}>
          {Array.from({ length: particleCount }, (_, index) => (
            <AmbientParticle
              key={index}
              profile={profile}
              index={index}
              progress={ambient}
              mode={mode}
            />
          ))}
        </View>
      )}
    </View>
  );
});

const effectStyles = StyleSheet.create({
  clip: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
  },
  aura: {
    position: "absolute",
    inset: -2,
    borderWidth: 1,
    shadowOpacity: 0.75,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  particles: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "visible",
  },
});

const particleStyles = StyleSheet.create({
  base: {
    position: "absolute",
    width: 22,
    height: 22,
    marginLeft: -11,
    marginTop: -11,
    textAlign: "center",
    fontWeight: "700",
    textShadowRadius: 7,
  },
});
