import { useEffect, useSyncExternalStore } from "react";
import { AppState } from "react-native";
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const activityListeners = new Set<() => void>();
let activitySubscription: ReturnType<typeof AppState.addEventListener> | null =
  null;
const activitySnapshot = () =>
  AppState.currentState === "active" || AppState.currentState === null;
function subscribeActivity(listener: () => void) {
  activityListeners.add(listener);
  if (!activitySubscription)
    activitySubscription = AppState.addEventListener("change", () => {
      for (const notify of activityListeners) notify();
    });
  return () => {
    activityListeners.delete(listener);
    if (!activityListeners.size) {
      activitySubscription?.remove();
      activitySubscription = null;
    }
  };
}
export function useAppActivity() {
  return useSyncExternalStore(
    subscribeActivity,
    activitySnapshot,
    activitySnapshot,
  );
}

// Loops run on the UI thread and stop in the background, on results, or in reduced motion.
export function useOpeningLoop(
  active: boolean,
  duration: number,
  reverse = false,
) {
  const progress = useSharedValue(0);
  useEffect(() => {
    if (active) {
      progress.value = withRepeat(
        withTiming(1, { duration, easing: Easing.linear }),
        -1,
        reverse,
      );
    } else {
      cancelAnimation(progress);
      progress.value = 0;
    }
    return () => cancelAnimation(progress);
  }, [active, duration, reverse, progress]);
  return progress;
}
