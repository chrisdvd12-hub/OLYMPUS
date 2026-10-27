import { useEffect, useId } from "react";
import { StyleSheet, View, type ImageSourcePropType } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Defs,
  G,
  Image as SvgImage,
  LinearGradient,
  Mask,
  Rect,
  Stop,
} from "react-native-svg";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export function BoosterShimmer({
  active,
  source,
  width,
  height,
}: {
  active: boolean;
  source: ImageSourcePropType;
  width: number;
  height: number;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const maskId = `pack-mask-${id}`;
  const gradientId = `pack-shine-${id}`;
  const x = useSharedValue(-120);
  useEffect(() => {
    if (active)
      x.value = withRepeat(
        withTiming(width + 160, { duration: 3200 }),
        -1,
        false,
      );
    else cancelAnimation(x);
    return () => cancelAnimation(x);
  }, [active, width, x]);
  const animatedProps = useAnimatedProps(() => ({ x: x.value }));
  if (!active) return null;
  // The shine follows the PNG alpha: no reflection is drawn in the transparent margins.
  return (
    <View
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      style={StyleSheet.absoluteFill}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <Mask
            id={maskId}
            x="0"
            y="0"
            width={width}
            height={height}
            maskType="alpha"
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
          >
            <SvgImage
              href={source}
              width={width}
              height={height}
              preserveAspectRatio="xMidYMid meet"
            />
          </Mask>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0" stopColor="#fff" stopOpacity="0" />
            <Stop offset=".5" stopColor="#fff" stopOpacity=".14" />
            <Stop offset="1" stopColor="#fff" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <G mask={`url(#${maskId})`}>
          <AnimatedRect
            animatedProps={animatedProps}
            y={-height}
            width={90}
            height={height * 3}
            transform="skewX(-15)"
            fill={`url(#${gradientId})`}
          />
        </G>
      </Svg>
    </View>
  );
}
