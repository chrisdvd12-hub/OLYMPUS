import { memo } from "react";
import { OptimizedImage as Image } from "./OptimizedImage";
import { StyleSheet } from "react-native";

const source = require("../../assets/cards/olympus-back.jpg");
// Keep the supplied artwork intact: no stretching, cropping, or text overlays.
export const CARD_ASPECT_RATIO = 5 / 7;

export const CardBack = memo(function CardBack() {
  return (
    <Image
      source={source}
      accessible={false}
      resizeMode="contain"
      style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
    />
  );
});
