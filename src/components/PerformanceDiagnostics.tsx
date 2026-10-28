import { useEffect, useRef, useState } from "react";
import { PixelRatio, Platform, Pressable, useWindowDimensions, View } from "react-native";
import { summarizeFrameTimes, type FrameMetrics } from "../performance/frameMetrics";
import { useGraphicsQuality } from "../performance/graphicsQuality";
import { AppText as Text } from "./AppText";
import { styles, theme } from "./theme";

const SAMPLE_MS = 10_000;

export function PerformanceDiagnostics() {
  const quality = useGraphicsQuality();
  const { width, height } = useWindowDimensions();
  const [running, setRunning] = useState(false);
  const [metrics, setMetrics] = useState<FrameMetrics | null>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const times: number[] = [];
    const started = performance.now();
    let previous = started;
    const sample = (now: number) => {
      times.push(now - previous);
      previous = now;
      if (now - started >= SAMPLE_MS) {
        setMetrics(summarizeFrameTimes(times.slice(1)));
        setRunning(false);
        frame.current = null;
        return;
      }
      frame.current = requestAnimationFrame(sample);
    };
    frame.current = requestAnimationFrame(sample);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [running]);

  const pixels = Math.round(width * height * PixelRatio.get() ** 2);
  return (
    <View style={styles.panel}>
      <Text style={styles.subtitle}>DIAGNOSTIC DE FLUIDITÉ</Text>
      <Text style={styles.muted}>
        Profil {quality.tier.toUpperCase()} · {Platform.OS} · {(pixels / 1_000_000).toFixed(1)} Mpx
      </Text>
      <Text style={styles.muted}>
        Cette mesure observe la cadence JavaScript pendant 10 secondes. Elle complète, sans remplacer, le profilage du thread UI dans une version de production.
      </Text>
      <Pressable
        accessibilityRole="button"
        disabled={running}
        style={[styles.outline, running && { opacity: 0.55 }]}
        onPress={() => {
          setMetrics(null);
          setRunning(true);
        }}
      >
        <Text style={{ color: theme.highlight }}>
          {running ? "MESURE EN COURS…" : "MESURER 10 SECONDES"}
        </Text>
      </Pressable>
      {metrics && (
        <Text accessibilityLiveRegion="polite" style={styles.text}>
          {metrics.fps.toFixed(1)} FPS JS · moyenne {metrics.averageFrameMs.toFixed(1)} ms · P95 {metrics.p95FrameMs.toFixed(1)} ms · {metrics.longFrames} images au-delà de 32 ms
        </Text>
      )}
    </View>
  );
}
