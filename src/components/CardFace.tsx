import { memo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { resolveCard, type Card } from "../domain/catalog";
import { CardFront } from "./CardFront";
// All 120 cards share editable text and the official master frame for their rarity.
// The old flattened Zeus front remains archived; its baked-in epithet is not displayed.
export const CardFace = memo(function CardFace({
  card,
  compact = false,
}: {
  card: Card;
  compact?: boolean;
}) {
  const current = resolveCard(card);
  const [width, setWidth] = useState(0);
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={(e) => {
        const next = e.nativeEvent.layout.width;
        if (next > 0) setWidth(next);
      }}
    >
      {width > 0 ? (
        <CardFront card={current} width={width} compact={compact} />
      ) : null}
    </View>
  );
});
