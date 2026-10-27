import { useEffect, useState } from "react";
import { AppState } from "react-native";
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export function useAppActivity() {
  const [active, setActive] = useState(
    AppState.currentState === "active" || AppState.currentState === null,
  );
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setActive(state === "active");
    });
    return () => subscription.remove();
  }, []);
  return active;
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
