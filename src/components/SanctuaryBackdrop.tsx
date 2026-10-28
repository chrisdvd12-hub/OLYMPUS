import { memo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const SanctuaryBackdrop = memo(function SanctuaryBackdrop() {
  return (
    <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
      <Image source={require("../../assets/backgrounds/sanctuary-night.png")} resizeMode="cover" style={StyleSheet.absoluteFill} />
      <LinearGradient colors={["#06101a55", "#06101a22", "#06101ad9"]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
    </View>
  );
});
