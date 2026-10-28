import { Text, type TextProps } from "react-native";
import { fonts, theme } from "./theme";

// All live UI text uses the locally bundled charter fonts, including modal text.
export function AppText({ style, ...props }: TextProps) {
  return <Text {...props} style={[{ fontFamily: fonts.regular, color: theme.paper }, style]} />;
}
