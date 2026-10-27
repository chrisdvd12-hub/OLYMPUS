import { View, StyleSheet, Image } from "react-native";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { COLORS } from "../domain/catalog";
/** Cadre vectoriel provisoire. La référence divine originale n'est pas encore un asset local. */
export function CardFrame({ rarity }: { rarity: number }) {
  const color = COLORS[rarity]!;
  if (rarity === 6)
    return (
      <Image
        source={require("../../assets/references/divine-frame.jpg")}
        resizeMode="stretch"
        style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
      />
    );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 140"
        preserveAspectRatio="none"
      >
        <Rect
          x="2"
          y="2"
          width="96"
          height="136"
          rx="5"
          fill="none"
          stroke={color}
          strokeWidth={rarity === 6 ? 3 : 1}
        />
        <Path
          d="M8 8H92V132H8Z M5 30H12M88 30H95M5 105H12M88 105H95 M10 32V103M90 32V103"
          stroke={color}
          fill="none"
        />
        <Path
          d="M30 8L50 3L70 8M30 132L50 137L70 132M8 35L4 45L8 55L12 45ZM92 35L88 45L92 55L96 45Z"
          fill={color}
        />
        {[16, 84].map((x) => (
          <Circle key={x} cx={x} cy="16" r="6" fill="#0c1b31" stroke={color} />
        ))}
      </Svg>
    </View>
  );
}
