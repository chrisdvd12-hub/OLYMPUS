import { View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { theme } from "./theme";

export function GreekOrnament() {
  return (
    <View pointerEvents="none" accessible={false} accessibilityElementsHidden style={{ height: 24, alignItems: "center" }}>
      <Svg width="220" height="24" viewBox="0 0 220 24">
        <Path d="M0 12H83M137 12H220" stroke={theme.gold} strokeOpacity=".45" />
        <Path d="M110 5l7 7-7 7-7-7Z" stroke={theme.gold} fill="none" />
        <Circle cx="94" cy="12" r="1.5" fill={theme.gold} />
        <Circle cx="126" cy="12" r="1.5" fill={theme.gold} />
      </Svg>
    </View>
  );
}

export function TempleSeal() {
  return (
    <View pointerEvents="none" accessible={false} accessibilityElementsHidden>
      <Svg width="52" height="52" viewBox="0 0 52 52">
        <Circle cx="26" cy="26" r="24" stroke={theme.line} fill="#07121ebd" />
        <Circle cx="26" cy="26" r="20" stroke={theme.gold} strokeOpacity=".5" fill="none" />
        <Path d="M13 21L26 13L39 21ZM14 23H38M16 25V35M23 25V35M29 25V35M36 25V35M13 37H39M12 40H40" stroke={theme.highlight} strokeWidth="1.4" fill="none" />
      </Svg>
    </View>
  );
}
