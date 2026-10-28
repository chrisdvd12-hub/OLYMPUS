import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PixelRatio, Platform, useWindowDimensions } from "react-native";
import Storage from "expo-sqlite/kv-store";
import {
  chooseGraphicsTier,
  GRAPHICS_PROFILES,
  resolveGraphicsTier,
  type GraphicsPreference,
  type GraphicsProfile,
} from "./graphicsProfiles";

export { chooseGraphicsTier, GRAPHICS_PROFILES } from "./graphicsProfiles";
export type {
  GraphicsPreference,
  GraphicsProfile,
  GraphicsTier,
} from "./graphicsProfiles";

interface GraphicsQualityValue extends GraphicsProfile {
  automaticTier: GraphicsProfile["tier"];
  preference: GraphicsPreference;
  setPreference: (preference: GraphicsPreference) => void;
}

const STORAGE_KEY = "olympus.graphics.preference.v1";

function readStoredPreference() {
  if (Platform.OS !== "web") return Storage.getItem(STORAGE_KEY);
  try {
    return Promise.resolve(globalThis.localStorage.getItem(STORAGE_KEY));
  } catch {
    return Promise.resolve(null);
  }
}

function writeStoredPreference(value: GraphicsPreference) {
  if (Platform.OS !== "web") return Storage.setItem(STORAGE_KEY, value);
  try {
    globalThis.localStorage.setItem(STORAGE_KEY, value);
    return Promise.resolve();
  } catch {
    return Promise.resolve();
  }
}

const GraphicsQualityContext = createContext<GraphicsQualityValue>({
  ...GRAPHICS_PROFILES.balanced,
  automaticTier: "balanced",
  preference: "auto",
  setPreference: () => {},
});

export function GraphicsQualityProvider({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const [preference, updatePreference] = useState<GraphicsPreference>("auto");
  const automaticTier = chooseGraphicsTier({
    width,
    height,
    pixelRatio: PixelRatio.get(),
    platform: Platform.OS,
  });
  useEffect(() => {
    void readStoredPreference()
      .then((stored) => {
        if (
          stored === "auto" ||
          stored === "high" ||
          stored === "balanced" ||
          stored === "economy"
        )
          updatePreference(stored);
      })
      .catch(() => {});
  }, []);
  const setPreference = useCallback((next: GraphicsPreference) => {
    updatePreference(next);
    void writeStoredPreference(next).catch(() => {});
  }, []);
  const tier = resolveGraphicsTier(preference, automaticTier);
  const profile = useMemo<GraphicsQualityValue>(
    () => ({
      ...GRAPHICS_PROFILES[tier],
      automaticTier,
      preference,
      setPreference,
    }),
    [automaticTier, preference, setPreference, tier],
  );
  return (
    <GraphicsQualityContext.Provider value={profile}>
      {children}
    </GraphicsQualityContext.Provider>
  );
}

export function useGraphicsQuality() {
  return useContext(GraphicsQualityContext);
}
