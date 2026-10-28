import { CARD_ILLUSTRATIONS } from "./illustrationArt";
import { Image, StyleSheet, View } from "react-native";
import { AppText as Text } from "./AppText";
import { RARITIES, EXTENSIONS, type Card } from "../domain/catalog";
import { RARITY_FRAME_ART } from "./rarityFrameArt";
import { fonts, theme } from "./theme";

export const CARD_REFERENCE = {
  width: 1500,
  height: 2100,
  ratio: 5 / 7,
} as const;
export { CARD_ILLUSTRATIONS } from "./illustrationArt";
// One template, seven official master frames. Never generate per-character borders.
export function CardFront({
  card,
  width = 250,
  compact = false,
}: {
  card: Card;
  width?: number;
  compact?: boolean;
}) {
  const illustration = CARD_ILLUSTRATIONS[card.id];
  const ink = card.rarity === 0 || card.rarity === 4 ? "#29231b" : theme.paper;
  const collection =
    EXTENSIONS.find((e) => e.id === card.extension)?.name ?? card.extension;
  const unit = width / CARD_REFERENCE.width;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={{
          position: "absolute",
          left: "11%",
          right: "11%",
          top: "8%",
          height: "57%",
          overflow: "hidden",
          backgroundColor: theme.navy,
        }}
      >
        {illustration ? (
          <Image
            source={illustration}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 8,
            }}
          >
            <Text style={{ color: theme.highlight, fontSize: width * 0.15 }}>
              ✧
            </Text>
            {!compact && (
              <Text
                style={{
                  color: theme.muted,
                  fontSize: Math.max(7, 44 * unit),
                  textAlign: "center",
                }}
              >
                ILLUSTRATION À FOURNIR
              </Text>
            )}
          </View>
        )}
      </View>
      <Image
        source={RARITY_FRAME_ART[card.rarity]}
        resizeMode="contain"
        style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
      />
      {!compact && (
        <>
          <View style={s.rarity}>
            <Text
              numberOfLines={1}
              style={{
                color: ink,
                fontFamily: fonts.bold,
                fontSize: 68 * unit,
                textAlign: "center",
              }}
            >
              {RARITIES[card.rarity]?.toUpperCase()}
            </Text>
          </View>
          <View style={s.name}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                color: ink,
                fontFamily: fonts.bold,
                fontSize: 100 * unit,
                textAlign: "center",
              }}
            >
              {card.name.toUpperCase()}
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                color: ink,
                fontFamily: fonts.semibold,
                fontSize: 43 * unit,
                textAlign: "center",
              }}
            >
              {card.epithet}
            </Text>
          </View>
          <View style={s.description}>
            <Text
              numberOfLines={5}
              adjustsFontSizeToFit
              style={{
                color: "#29231b",
                fontSize: 49 * unit,
                lineHeight: 65 * unit,
                textAlign: "center",
              }}
            >
              {card.description}
            </Text>
          </View>
          <View style={s.footer}>
            <Text
              style={{
                color: "#29231b",
                fontFamily: fonts.bold,
                fontSize: 45 * unit,
              }}
            >
              {card.number}
            </Text>
            <Text
              numberOfLines={2}
              style={{
                color: "#29231b",
                fontSize: 34 * unit,
                textAlign: "right",
                width: "42%",
              }}
            >
              {collection}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  rarity: {
    position: "absolute",
    top: "3.2%",
    left: "34%",
    right: "34%",
    height: "3.9%",
    justifyContent: "center",
  },
  name: {
    position: "absolute",
    top: "65.2%",
    height: "7.4%",
    left: "19%",
    right: "19%",
    justifyContent: "center",
  },
  description: {
    position: "absolute",
    top: "75.5%",
    height: "9%",
    left: "18%",
    right: "18%",
    justifyContent: "center",
  },
  footer: {
    position: "absolute",
    top: "87.5%",
    height: "5%",
    left: "19%",
    right: "19%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
