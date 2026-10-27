import { Image, StyleSheet, Text, View } from "react-native";
import { COLORS, RARITIES, resolveCard, type Card } from "../domain/catalog";
import { CARD_ART, hasCardArt } from "./cardArt";
import { CardFrame } from "./CardFrame";
import { theme } from "./theme";

export function CardFace({ card }: { card: Card }) {
  const current = resolveCard(card);
  if (hasCardArt(current.id)) {
    return (
      <Image
        accessible={false}
        source={CARD_ART[current.id]}
        resizeMode="contain"
        style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
      />
    );
  }
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, s.placeholder]}>
      <CardFrame rarity={current.rarity} />
      <Text style={s.name}>{current.name.toUpperCase()}</Text>
      <Text style={{ color: COLORS[current.rarity], fontSize: 32 }}>✧</Text>
      <View>
        <Text
          style={{
            color: COLORS[current.rarity],
            fontSize: 8,
            textAlign: "center",
          }}
        >
          {RARITIES[current.rarity]?.toUpperCase()}
        </Text>
        <Text style={s.provisional}>ART PROVISOIRE</Text>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  placeholder: {
    padding: 6,
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { color: theme.gold, fontSize: 9, textAlign: "center" },
  provisional: { color: theme.muted, fontSize: 7, textAlign: "center" },
});
