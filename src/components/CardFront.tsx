import { OptimizedImage as Image } from "./OptimizedImage";
import { artworkLayout } from "../domain/artworkLayout";
import { CARD_ILLUSTRATIONS } from "./illustrationArt";
import { StyleSheet, View } from "react-native";
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
  const artwork = artworkLayout(
    card.id,
    card.rarity,
    width,
    card.id === "olympe-30" ? 914 / 1280 : 5 / 7,
  );
  const collection =
    EXTENSIONS.find((e) => e.id === card.extension)?.name ?? card.extension;
  const numberSeal = card.number?.replace("-", "\n") ?? "—";
  const extensionSeal = {
    olympe: "EXT.\nI",
    titans: "EXT.\nII",
    heros: "EXT.\nIII",
    creatures: "EXT.\nIV",
  }[card.extension] ?? card.extension.toUpperCase();
  const unit = width / CARD_REFERENCE.width;
  const newFrame = card.rarity > 0;
  // Measured inner cartouches of the owner-supplied master PNGs.
  const nameBox = [
    { top: 0.681, height: 0.043, left: 0.19, right: 0.19 },
    { top: 0.628, height: 0.089, left: 0.18, right: 0.18 },
    { top: 0.621, height: 0.097, left: 0.18, right: 0.18 },
    { top: 0.621, height: 0.098, left: 0.18, right: 0.18 },
    { top: 0.617, height: 0.086, left: 0.18, right: 0.18 },
    { top: 0.624, height: 0.104, left: 0.18, right: 0.18 },
    { top: 0.638, height: 0.09, left: 0.18, right: 0.18 },
  ][card.rarity]!;
  const descriptionBox = [
    { top: 0.755, height: 0.09 },
    { top: 0.725, height: 0.126 },
    { top: 0.727, height: 0.124 },
    { top: 0.729, height: 0.126 },
    { top: 0.711, height: 0.14 },
    { top: 0.738, height: 0.114 },
    { top: 0.738, height: 0.134 },
  ][card.rarity]!;
  const footerBox = [
    { top: 0.875, height: 0.05 },
    { top: 0.861, height: 0.066 },
    { top: 0.861, height: 0.068 },
    { top: 0.864, height: 0.069 },
    { top: 0.858, height: 0.071 },
    { top: 0.861, height: 0.071 },
    { top: 0.881, height: 0.061 },
  ][card.rarity]!;
  const nameInk = ["#29231b", theme.paper, theme.paper, theme.paper, "#29231b", theme.paper, "#29231b"][card.rarity]!;
  // Long descriptions must fit the ivory panel without touching the name band.
  const longDescription = (card.description?.length ?? 0) > 100;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={{
          position: "absolute",
          ...artwork.viewport,
          overflow: "hidden",
          backgroundColor: theme.navy,
        }}
      >
        {illustration ? (
          <Image
            source={illustration}
            recyclingKey={`painting-${card.id}`}
            resizeMode="contain"
            style={{ position: "absolute", ...artwork.image }}
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
        recyclingKey={`frame-${card.rarity}`}
        resizeMode="contain"
        style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
      />
      {!compact && (
        <>
          {newFrame && (
            <>
              <View style={s.numberSeal}>
                <Text numberOfLines={2} adjustsFontSizeToFit style={[s.sealText, { fontSize: 40 * unit, lineHeight: 44 * unit }]}>
                  {numberSeal}
                </Text>
              </View>
              <View style={s.extensionSeal}>
                <Text numberOfLines={2} adjustsFontSizeToFit style={[s.sealText, { fontSize: 40 * unit, lineHeight: 44 * unit }]}>
                  {extensionSeal}
                </Text>
              </View>
            </>
          )}
          <View style={[s.rarity, newFrame && s.rarityNew]}>
            <Text
              numberOfLines={1}
              style={{
                color: card.rarity === 5 ? theme.paper : "#29231b",
                fontFamily: fonts.bold,
                fontSize: (newFrame ? 55 : 68) * unit,
                textAlign: "center",
              }}
            >
              {RARITIES[card.rarity]?.toUpperCase()}
            </Text>
          </View>
          <View style={[s.name, { top: `${nameBox.top * 100}%`, height: `${nameBox.height * 100}%`, left: `${nameBox.left * 100}%`, right: `${nameBox.right * 100}%` }]}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                color: nameInk,
                fontFamily: fonts.bold,
                fontSize: (newFrame ? 88 : 100) * unit,
                lineHeight: (newFrame ? 98 : 110) * unit,
                includeFontPadding: false,
                textAlign: "center",
              }}
            >
              {card.name.toUpperCase()}
            </Text>
          </View>
          <View style={[s.description, { top: `${descriptionBox.top * 100}%`, height: `${descriptionBox.height * 100}%` }]}>
            <Text
              numberOfLines={5}
              adjustsFontSizeToFit
              style={{
                color: "#29231b",
                fontSize: (longDescription ? 39 : 49) * unit,
                lineHeight: (longDescription ? 47 : 65) * unit,
                textAlign: "center",
              }}
            >
              {card.description}
            </Text>
          </View>
          <View style={[s.footer, { top: `${footerBox.top * 100}%`, height: `${footerBox.height * 100}%` }, newFrame && s.footerNew]}>
            {newFrame ? (
              <>
                <Text numberOfLines={1} adjustsFontSizeToFit style={[s.footerEpithet, { fontSize: 39 * unit, lineHeight: 46 * unit }]}>
                  {card.epithet?.toUpperCase() || card.name.toUpperCase()}
                </Text>
                <Text numberOfLines={1} adjustsFontSizeToFit style={[s.footerMeta, { fontSize: 30 * unit, lineHeight: 36 * unit }]}>
                  {[card.category, collection].filter(Boolean).join(" · ")}
                </Text>
              </>
            ) : (
              <>
                <Text style={{ color: "#29231b", fontFamily: fonts.bold, fontSize: 45 * unit }}>{card.number}</Text>
                <Text numberOfLines={2} style={{ color: "#29231b", fontSize: 34 * unit, textAlign: "right", width: "42%" }}>{collection}</Text>
              </>
            )}
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
  rarityNew: { top: "1.1%", left: "31%", right: "31%", height: "5.5%" },
  numberSeal: { position: "absolute", top: "2.1%", left: "2.7%", width: "13.6%", height: "10%", alignItems: "center", justifyContent: "center" },
  extensionSeal: { position: "absolute", top: "2.1%", right: "2.7%", width: "13.6%", height: "10%", alignItems: "center", justifyContent: "center" },
  sealText: { color: "#29231b", fontFamily: fonts.bold, textAlign: "center", includeFontPadding: false },
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
  footerNew: { left: "20%", right: "20%", flexDirection: "column", justifyContent: "center", gap: 0 },
  footerEpithet: { color: "#29231b", fontFamily: fonts.semibold, textAlign: "center", includeFontPadding: false, width: "100%" },
  footerMeta: { color: "#554735", textAlign: "center", includeFontPadding: false, width: "100%" },
});
