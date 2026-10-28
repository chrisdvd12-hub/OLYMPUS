import { createContext, useContext, useMemo, type ReactNode } from "react";
import { PixelRatio, Platform, useWindowDimensions } from "react-native";
import {
  chooseGraphicsTier,
  GRAPHICS_PROFILES,
  type GraphicsProfile,
} from "./graphicsProfiles";

export { chooseGraphicsTier, GRAPHICS_PROFILES } from "./graphicsProfiles";
export type { GraphicsProfile, GraphicsTier } from "./graphicsProfiles";

const GraphicsQualityContext = createContext<GraphicsProfile>(
  GRAPHICS_PROFILES.balanced,
);

export function GraphicsQualityProvider({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const tier = chooseGraphicsTier({
    width,
    height,
    pixelRatio: PixelRatio.get(),
    platform: Platform.OS,
  });
  const profile = useMemo(() => GRAPHICS_PROFILES[tier], [tier]);
  return (
    <GraphicsQualityContext.Provider value={profile}>
      {children}
    </GraphicsQualityContext.Provider>
  );
}

export function useGraphicsQuality() {
  return useContext(GraphicsQualityContext);
}
