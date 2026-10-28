import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { resolveCard, type Card } from "../domain/catalog";
import { CARD_ART, hasCardArt } from "./cardArt";
import { CardFront } from "./CardFront";
// Retain the previously approved complete Zeus front; other cards use shared masters.
export function CardFace({
  card,
  compact = false,
}: {
  card: Card;
  compact?: boolean;
}) {
  const current = resolveCard(card);
  const [width, setWidth] = useState(250);
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {hasCardArt(current.id) ? (
        <Image
          accessible={false}
          source={CARD_ART[current.id]}
          resizeMode="contain"
          style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
        />
      ) : (
        <CardFront card={current} width={width} compact={compact} />
      )}
    </View>
  );
}
