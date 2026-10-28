import { Image as CachedImage } from "expo-image";
import { useCallback, useEffect, useMemo } from "react";
import { Image, Pressable, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { EXTENSIONS, type Extension } from "../domain/catalog";
import {
  nearestWheelPosition,
  wheelPose,
  wheelPositionFromDrag,
  wrapIndex,
} from "../interaction/spatial";
import { selectionFeedback } from "../interaction/feedback";
import { useAppActivity } from "../animations/openingMotion";
import { BoosterPackView } from "./BoosterPackView";
import { PACK_ART } from "./packArt";
import { AppText as Text } from "./AppText";
import { styles, theme } from "./theme";

function WheelPack({
  extension,
  index,
  position,
  radius,
  scale,
  selected,
  active,
  reduced,
  onPress,
}: {
  extension: Extension;
  index: number;
  position: SharedValue<number>;
  radius: number;
  scale: number;
  selected: boolean;
  active: boolean;
  reduced: boolean;
  onPress: (index: number) => void;
}) {
  const pose = useAnimatedStyle(() => {
    const p = wheelPose(index, position.value, radius);
    return {
      zIndex: p.zIndex,
      opacity: p.opacity,
      transform: [
        { perspective: 1000 },
        { translateX: p.x },
        { translateY: p.y },
        { rotateY: `${p.rotateY}deg` },
        { scale: scale * p.scale },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: "50%",
          marginLeft: -124,
          top: 105,
          width: 248,
          height: 372,
        },
        pose,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          selected ? `Ouvrir ${extension.name}` : `Centrer ${extension.name}`
        }
        accessibilityState={{ selected }}
        onPress={() => onPress(index)}
      >
        <BoosterPackView
          extension={extension}
          active={active && selected}
          reduced={reduced}
        />
      </Pressable>
    </Animated.View>
  );
}
export function BoosterWheelCarousel({
  selected,
  onSelect,
  onOpen,
  onBusy,
  reduced,
  visible = true,
}: {
  selected: number;
  onSelect: (index: number) => void;
  onOpen: (index: number) => void;
  onBusy: (busy: boolean) => void;
  reduced: boolean;
  visible?: boolean;
}) {
  const { width } = useWindowDimensions();
  const appActive = useAppActivity();
  const active = appActive && visible;
  const position = useSharedValue(selected);
  const anchor = useSharedValue(0);
  const scale = Math.min(1.12, Math.max(0.73, width / 440));
  const radius = Math.min(width * 0.37, 200);
  const notify = useCallback((index: number) => onSelect(index), [onSelect]);
  useAnimatedReaction(
    () => wrapIndex(position.value),
    (index, previous) => {
      if (index !== previous) runOnJS(notify)(index);
    },
    [notify],
  );
  useEffect(() => {
    for (const source of Object.values(PACK_ART)) {
      const uri = Image.resolveAssetSource?.(source)?.uri;
      if (uri)
        void CachedImage.prefetch(uri, { cachePolicy: "disk" }).catch(() => {});
    }
  }, []);
  useEffect(() => {
    if (!active) {
      cancelAnimation(position);
      position.value = Math.round(position.value);
      onBusy(false);
    }
    return () => cancelAnimation(position);
  }, [active, position, onBusy]);
  const settled = useCallback(() => {
    onBusy(false);
    selectionFeedback(!reduced);
  }, [onBusy, reduced]);
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(active)
        .activeOffsetX([-12, 12])
        .failOffsetY([-18, 18])
        .onStart(() => {
          cancelAnimation(position);
          anchor.value = position.value;
          runOnJS(onBusy)(true);
        })
        .onUpdate((event) => {
          position.value = wheelPositionFromDrag(
            anchor.value,
            event.translationX,
          );
        })
        .onEnd((event) => {
          if (reduced) {
            position.value = Math.round(position.value);
            runOnJS(settled)();
            return;
          }
          position.value = withDecay(
            {
              velocity: Math.max(-14, Math.min(14, -event.velocityX / 115)),
              deceleration: 0.97,
            },
            (finished) => {
              if (finished)
                position.value = withSpring(
                  Math.round(position.value),
                  { damping: 22, stiffness: 150 },
                  (done) => {
                    if (done) runOnJS(settled)();
                  },
                );
            },
          );
        })
        .onFinalize((_event, success) => {
          if (!success) {
            position.value = withSpring(Math.round(position.value));
            runOnJS(onBusy)(false);
          }
        }),
    [active, anchor, position, onBusy, reduced, settled],
  );
  const moveTo = (target: number) => {
    cancelAnimation(position);
    onBusy(true);
    if (reduced) {
      position.value = target;
      settled();
    } else
      position.value = withSpring(
        target,
        { damping: 22, stiffness: 150 },
        (done) => {
          if (done) runOnJS(settled)();
        },
      );
  };
  const pressPack = (index: number) => {
    if (
      wrapIndex(position.value) === index &&
      Math.abs(position.value - Math.round(position.value)) < 0.06
    )
      onOpen(index);
    else moveTo(nearestWheelPosition(index, position.value));
  };
  return (
    <View>
      <GestureDetector gesture={pan} touchAction="pan-y">
        <Animated.View
          collapsable={false}
          style={{
            height: 590,
            width: "100%",
            overflow: "hidden",
            justifyContent: "center",
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: radius * 2,
              height: 290,
              left: "50%",
              top: 146,
              marginLeft: -radius,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: EXTENSIONS[selected]!.color,
              backgroundColor: `${EXTENSIONS[selected]!.color}18`,
              opacity: 0.5,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: 10,
              height: 10,
              borderRadius: 5,
              left: "50%",
              top: 286,
              marginLeft: -5,
              backgroundColor: theme.highlight,
              shadowColor: theme.highlight,
              shadowOpacity: 0.9,
              shadowRadius: 12,
            }}
          />
          {EXTENSIONS.map((extension, index) => (
            <WheelPack
              key={extension.id}
              extension={extension}
              index={index}
              position={position}
              radius={radius}
              scale={scale}
              selected={index === selected}
              active={active}
              reduced={reduced}
              onPress={pressPack}
            />
          ))}
        </Animated.View>
      </GestureDetector>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Booster précédent"
          style={styles.outline}
          onPress={() => moveTo(Math.round(position.value) - 1)}
        >
          <Text style={{ color: theme.highlight }}>‹</Text>
        </Pressable>
        <Text style={styles.subtitle}>GLISSEZ POUR EXPLORER</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Booster suivant"
          style={styles.outline}
          onPress={() => moveTo(Math.round(position.value) + 1)}
        >
          <Text style={{ color: theme.highlight }}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}
