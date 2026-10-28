import { memo, useEffect, useMemo } from "react";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useAppActivity } from "../animations/openingMotion";
import { View } from "react-native";
import { RARITIES } from "../domain/catalog";
import { collectionStats } from "../domain/collection";
import { AppText as Text } from "./AppText";
import { styles, theme } from "./theme";
export const CollectionProgress = memo(function CollectionProgress({
  collection,
  detailed = false,
  reduced = false,
}: {
  collection: Record<string, number>;
  detailed?: boolean;
  reduced?: boolean;
}) {
  const stats = useMemo(() => collectionStats(collection), [collection]);
  const systemReduced = useReducedMotion();
  const active = useAppActivity();
  const amount = useSharedValue(stats.percent / 100);
  useEffect(() => {
    if (active)
      amount.value = withTiming(stats.percent / 100, {
        duration: reduced || systemReduced ? 0 : 550,
      });
    else cancelAnimation(amount);
    return () => cancelAnimation(amount);
  }, [active, amount, reduced, systemReduced, stats.percent]);
  const progress = useAnimatedStyle(() => ({
    transform: [{ scaleX: amount.value }],
  }));
  return (
    <View style={{ gap: 10 }}>
      <Text style={styles.muted}>
        {stats.owned} / 120 découvertes · {stats.missing} manquantes ·{" "}
        {stats.percent} %
      </Text>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 120, now: stats.owned }}
        style={{
          height: 4,
          backgroundColor: theme.navy,
          overflow: "hidden",
          borderRadius: 3,
        }}
      >
        <Animated.View
          style={[
            {
              height: 4,
              width: "100%",
              backgroundColor: theme.gold,
              transformOrigin: "left",
            },
            progress,
          ]}
        />
      </View>
      {detailed && (
        <>
          {stats.byExtension.map((e) => (
            <Text key={e.id} style={styles.muted}>
              {e.name} · {e.owned} / {e.total}
            </Text>
          ))}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {stats.byRarity.map((r) => (
              <Text
                key={r.rarity}
                style={[styles.muted, { color: theme.highlight }]}
              >
                {RARITIES[r.rarity]} · {r.owned}/{r.total}
              </Text>
            ))}
          </View>
        </>
      )}
    </View>
  );
});
