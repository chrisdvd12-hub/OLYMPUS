import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { AppText as Text } from "./AppText";
import { useAppActivity } from "../animations/openingMotion";
import { dailyCountdown } from "../domain/daily";
import { fonts, styles, theme } from "./theme";

// Keep the ticking clock local: the carousel and collection do not render each second.
export function OfferingBadge({
  nextAt,
  available,
  busy,
  onOpen,
  compact = false,
}: {
  nextAt?: number;
  available: number;
  busy: boolean;
  onOpen: () => void;
  compact?: boolean;
}) {
  const [now, setNow] = useState(Date.now);
  const active = useAppActivity();
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return (
    <View style={[styles.offering, compact && { maxWidth: 150, padding: 7 }]}>
      <Text
        style={[
          styles.subtitle,
          { fontSize: compact ? 8 : 10, letterSpacing: 0.4 },
        ]}
      >
        L’OFFRANDE DES DIEUX
      </Text>
      {available > 0 ? (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ouvrir un booster offert"
            disabled={busy}
            style={[
              styles.outline,
              { minHeight: 48, paddingHorizontal: 10, opacity: busy ? 0.4 : 1 },
            ]}
            onPress={onOpen}
          >
            <Text
              style={[
                styles.buttonText,
                { color: theme.highlight, fontSize: 11 },
              ]}
            >
              OUVRIR UN BOOSTER
            </Text>
          </Pressable>
          <Text style={[styles.muted, { fontSize: 10 }]}>
            {available} booster{available > 1 ? "s" : ""} disponible
            {available > 1 ? "s" : ""}
          </Text>
        </>
      ) : (
        <>
          <Text
            accessibilityLabel={`Prochaine offrande dans ${dailyCountdown(nextAt ?? now, now)}`}
            style={{
              color: theme.highlight,
              fontFamily: fonts.bold,
              fontSize: compact ? 18 : 22,
              lineHeight: 30,
              fontVariant: ["tabular-nums"],
            }}
          >
            {dailyCountdown(nextAt ?? now, now)}
          </Text>
          <Text style={[styles.muted, { fontSize: 10 }]}>
            2 boosters aléatoires
          </Text>
        </>
      )}
    </View>
  );
}
