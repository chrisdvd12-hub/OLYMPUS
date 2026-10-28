import { useEffect, useSyncExternalStore } from "react";
import { useAppActivity } from "../animations/openingMotion";
import { getSnapshot, refresh, subscribe } from "./store";
const emptySnapshot = () => null;
export function useGameState() {
  return useSyncExternalStore(subscribe, getSnapshot, emptySnapshot);
}
export function useGameSync(
  nextAt: number | undefined,
  onError: (error: unknown) => void,
) {
  const active = useAppActivity();
  useEffect(() => {
    if (active) void refresh(true, true).catch(onError);
  }, [active, onError]);
  useEffect(() => {
    if (!active || nextAt === undefined) return;
    const delay = Math.min(2147483647, Math.max(0, nextAt - Date.now()));
    const timer = setTimeout(() => {
      void refresh(true).catch(onError);
    }, delay);
    return () => clearTimeout(timer);
  }, [active, nextAt, onError]);
}
