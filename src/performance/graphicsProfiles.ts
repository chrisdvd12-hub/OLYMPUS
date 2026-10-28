export type GraphicsTier = "high" | "balanced" | "economy";

export interface GraphicsProfile {
  tier: GraphicsTier;
  particleCount: number;
  sparkCount: number;
  cardSparkleScale: number;
  animatedSkyLayers: number;
  animateAmbientEffects: boolean;
}

export const GRAPHICS_PROFILES: Record<GraphicsTier, GraphicsProfile> = {
  high: {
    tier: "high",
    particleCount: 18,
    sparkCount: 14,
    cardSparkleScale: 1,
    animatedSkyLayers: 2,
    animateAmbientEffects: true,
  },
  balanced: {
    tier: "balanced",
    particleCount: 10,
    sparkCount: 8,
    cardSparkleScale: 0.62,
    animatedSkyLayers: 1,
    animateAmbientEffects: true,
  },
  economy: {
    tier: "economy",
    particleCount: 4,
    sparkCount: 4,
    cardSparkleScale: 0.3,
    animatedSkyLayers: 0,
    animateAmbientEffects: false,
  },
};

export function chooseGraphicsTier({
  width,
  height,
  pixelRatio,
  reducedMotion = false,
  platform = "native",
}: {
  width: number;
  height: number;
  pixelRatio: number;
  reducedMotion?: boolean;
  platform?: string;
}): GraphicsTier {
  if (reducedMotion || platform === "web") return "economy";
  const physicalPixels = width * height * pixelRatio * pixelRatio;
  if (physicalPixels > 7_500_000) return "economy";
  if (physicalPixels > 3_600_000) return "balanced";
  return "high";
}
