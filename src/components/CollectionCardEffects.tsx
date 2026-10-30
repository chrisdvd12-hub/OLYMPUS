import { memo, useId, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Defs,
  G,
  Image as SvgImage,
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
  COLLECTION_TEXTURE_GEOMETRY,
  collectionEffectFor,
  collectionParticleOrigin,
  collectionTexturePosition,
  seededCollectionValue,
  type CollectionEffectProfile,
} from "../domain/collectionEffects";
import { FRAME_APERTURES } from "../domain/artworkLayout";
import { useGraphicsQuality } from "../performance/graphicsQuality";
import { RARITY_FRAME_ART } from "./rarityFrameArt";

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
  const illustrationIntensity =
    profile.illustrationIntensity *
    (isGrid ? COLLECTION_GRID_INTENSITY.illustration : 1);
  const frameIntensity =
    profile.frameIntensity * (isGrid ? COLLECTION_GRID_INTENSITY.frame : 1);
  const aperture = FRAME_APERTURES[card.rarity] ?? FRAME_APERTURES[0];
  const ambient = useOpeningLoop(
    active && !reduced && quality.animateAmbientEffects,
    Math.max(2800, 6200 - card.rarity * 430),
    false,
  );
  const foilProps = useAnimatedProps(() => ({
    ...collectionTexturePosition(
      "foil",
      lightX.value,
      lightY.value,
      ambient.value,
      isGrid,
    ),
  }));
  const bandProps = useAnimatedProps(() => ({
    ...collectionTexturePosition(
      "bands",
      lightX.value,
      lightY.value,
      ambient.value,
      isGrid,
    ),
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
      {(frameIntensity > 0 || showAura) && (
        <View
          style={[
            effectStyles.clip,
            { borderRadius: width * 0.028 },
          ]}
        >
          <Svg width="100%" height="100%" viewBox="0 0 500 700">
            <Defs>
              <LinearGradient id={`art-${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                <Stop offset="0" stopColor="#ff3c9a" stopOpacity="0" />
                <Stop offset=".2" stopColor={profile.accent} stopOpacity={illustrationIntensity * 0.3} />
                <Stop offset=".38" stopColor="#6bffff" stopOpacity={illustrationIntensity * 0.48} />
                <Stop offset=".54" stopColor={profile.secondary} stopOpacity={illustrationIntensity * 0.56} />
                <Stop offset=".7" stopColor="#a673ff" stopOpacity={illustrationIntensity * 0.45} />
                <Stop offset=".86" stopColor="#fff5cb" stopOpacity={illustrationIntensity * 0.25} />
                <Stop offset="1" stopColor="#fff" stopOpacity="0" />
              </LinearGradient>
              <LinearGradient id={`frame-${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                <Stop offset="0" stopColor={profile.accent} stopOpacity="0" />
                <Stop offset=".16" stopColor={card.rarity === 6 ? "#ff68dc" : profile.accent} stopOpacity={frameIntensity * 0.4} />
                <Stop offset=".34" stopColor={card.rarity >= 5 ? "#886cff" : "#66eaff"} stopOpacity={frameIntensity * 0.68} />
                <Stop offset=".5" stopColor={profile.secondary} stopOpacity={frameIntensity * 0.82} />
                <Stop offset=".66" stopColor={card.rarity === 6 ? "#75f4ff" : profile.accent} stopOpacity={frameIntensity * 0.65} />
                <Stop offset=".84" stopColor="#fff2a4" stopOpacity={frameIntensity * 0.42} />
                <Stop offset="1" stopColor={profile.secondary} stopOpacity="0" />
              </LinearGradient>
              <LinearGradient id={`bands-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0" stopColor="#ff86e5" stopOpacity="0" />
                <Stop offset=".28" stopColor={profile.accent} stopOpacity={frameIntensity * 0.22} />
                <Stop offset=".42" stopColor="#71eaff" stopOpacity={frameIntensity * 0.3} />
                <Stop offset=".54" stopColor={profile.secondary} stopOpacity={frameIntensity * 0.34} />
                <Stop offset=".68" stopColor="#b184ff" stopOpacity={frameIntensity * 0.25} />
                <Stop offset=".82" stopColor="#fff" stopOpacity="0" />
              </LinearGradient>
              <LinearGradient id={`beam-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0" stopColor="#fff" stopOpacity="0" />
                <Stop offset=".485" stopColor="#fff" stopOpacity="0" />
                <Stop offset=".5" stopColor="#fff" stopOpacity={frameIntensity * 0.58} />
                <Stop offset=".515" stopColor="#fff" stopOpacity="0" />
                <Stop offset="1" stopColor="#fff" stopOpacity="0" />
              </LinearGradient>
              <Mask id={`art-mask-${id}`} maskType="alpha" x="0" y="0" width="500" height="700">
                <Rect
                  x={aperture.x * 500}
                  y={aperture.y * 700}
                  width={aperture.width * 500}
                  height={aperture.height * 700}
                  fill="#fff"
                />
              </Mask>
              <Mask id={`frame-mask-${id}`} maskType="alpha" x="0" y="0" width="500" height="700">
                <SvgImage
                  href={RARITY_FRAME_ART[card.rarity]}
                  width="500"
                  height="700"
                  preserveAspectRatio="xMidYMid meet"
                />
              </Mask>
              <Mask
                id={`text-safe-${id}`}
                maskType="luminance"
                x="0"
                y="0"
                width="500"
                height="700"
              >
                <Rect x="0" y="0" width="500" height="700" fill="#fff" />
                <Rect x="145" y="12" width="210" height="48" rx="10" fill="#282828" />
                <Rect x="72" y="442" width="356" height="70" rx="12" fill="#202020" />
                <Rect x="68" y="508" width="364" height="100" rx="12" fill="#202020" />
                <Rect x="72" y="598" width="356" height="76" rx="12" fill="#242424" />
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
            {frameIntensity > 0 && (
              <G mask={`url(#text-safe-${id})`}>
                <G mask={`url(#art-mask-${id})`}>
                  <AnimatedRect
                    animatedProps={foilProps}
                    width={COLLECTION_TEXTURE_GEOMETRY.foil.width}
                    height={COLLECTION_TEXTURE_GEOMETRY.foil.height}
                    fill={`url(#art-${id})`}
                  />
                </G>
                <G mask={`url(#frame-mask-${id})`}>
                  <AnimatedRect
                    animatedProps={foilProps}
                    width={COLLECTION_TEXTURE_GEOMETRY.foil.width}
                    height={COLLECTION_TEXTURE_GEOMETRY.foil.height}
                    fill={`url(#frame-${id})`}
                  />
                  <AnimatedRect
                    animatedProps={bandProps}
                    width={COLLECTION_TEXTURE_GEOMETRY.bands.width}
                    height={COLLECTION_TEXTURE_GEOMETRY.bands.height}
                    fill={`url(#bands-${id})`}
                  />
                  <AnimatedRect
                    animatedProps={bandProps}
                    width={COLLECTION_TEXTURE_GEOMETRY.bands.width}
                    height={COLLECTION_TEXTURE_GEOMETRY.bands.height}
                    fill={`url(#beam-${id})`}
                  />
                </G>
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
