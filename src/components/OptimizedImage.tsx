import { memo } from "react";
import { Image, type ImageProps } from "expo-image";
import type { ImageSourcePropType, ImageStyle, StyleProp } from "react-native";
interface Props {
  source: ImageSourcePropType;
  resizeMode?: "cover" | "contain";
  style?: StyleProp<ImageStyle>;
  accessible?: boolean;
  accessibilityLabel?: string;
  recyclingKey?: string;
  priority?: ImageProps["priority"];
  allowDownscaling?: boolean;
}
// Native cache and target-size decoding; no conversion or modification of original files.
export const OptimizedImage = memo(function OptimizedImage({
  resizeMode = "contain",
  allowDownscaling = true,
  ...props
}: Props) {
  const source = (
    Array.isArray(props.source) ? [...props.source] : props.source
  ) as ImageProps["source"];
  return (
    <Image
      {...props}
      source={source}
      contentFit={resizeMode}
      contentPosition="center"
      cachePolicy="memory-disk"
      allowDownscaling={allowDownscaling}
      transition={0}
    />
  );
});
