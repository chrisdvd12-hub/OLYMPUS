import { useMemo } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { Card } from "../domain/catalog";
import { CARD_ILLUSTRATIONS } from "./CardFront";
import { AppText as Text } from "./AppText";
import { styles } from "./theme";
export function CardArtworkZoom({
  card,
  onClose,
  reduced,
}: {
  card: Card;
  onClose: () => void;
  reduced: boolean;
}) {
  const { width, height } = useWindowDimensions();
  const scale = useSharedValue(1);
  const base = useSharedValue(1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const bx = useSharedValue(0);
  const by = useSharedValue(0);
  const pinch = useMemo(
    () =>
      Gesture.Pinch()
        .onStart(() => {
          base.value = scale.value;
        })
        .onUpdate((e) => {
          scale.value = Math.max(1, Math.min(4, base.value * e.scale));
        }),
    [base, scale],
  );
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          bx.value = x.value;
          by.value = y.value;
        })
        .onUpdate((e) => {
          const limitX = (width * (scale.value - 1)) / 2;
          const limitY = (height * (scale.value - 1)) / 2;
          x.value = Math.max(
            -limitX,
            Math.min(limitX, bx.value + e.translationX),
          );
          y.value = Math.max(
            -limitY,
            Math.min(limitY, by.value + e.translationY),
          );
        }),
    [bx, by, x, y, scale, width, height],
  );
  const gesture = useMemo(() => Gesture.Simultaneous(pinch, pan), [pinch, pan]);
  const transform = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ],
  }));
  const zoom = (amount: number) => {
    scale.value = withTiming(Math.max(1, Math.min(4, scale.value + amount)), {
      duration: reduced ? 0 : 180,
    });
    x.value = 0;
    y.value = 0;
  };
  const source = CARD_ILLUSTRATIONS[card.id];
  return (
    <Modal
      visible
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      animationType={reduced ? "none" : "fade"}
    >
      <GestureHandlerRootView style={styles.screen}>
        <View style={{ flex: 1, paddingTop: 50, paddingBottom: 32 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 18,
            }}
          >
            <Text
              numberOfLines={2}
              style={[styles.subtitle, { flex: 1, letterSpacing: 0.5 }]}
            >
              {card.name}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={styles.outline}
            >
              <Text>FERMER</Text>
            </Pressable>
          </View>
          {source ? (
            <GestureDetector gesture={gesture}>
              <Animated.View
                collapsable={false}
                style={[{ flex: 1, overflow: "hidden" }]}
              >
                <Animated.View style={[StyleSheet.absoluteFill, transform]}>
                  <Image
                    source={source}
                    resizeMode="contain"
                    style={{ width: "100%", height: "100%" }}
                  />
                </Animated.View>
              </Animated.View>
            </GestureDetector>
          ) : (
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text style={styles.muted}>
                Illustration non fournie pour cette carte.
              </Text>
            </View>
          )}
          <View
            style={{ flexDirection: "row", justifyContent: "center", gap: 12 }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Réduire le zoom"
              style={styles.outline}
              onPress={() => zoom(-0.5)}
            >
              <Text>−</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={styles.outline}
              onPress={() => {
                scale.value = 1;
                x.value = 0;
                y.value = 0;
              }}
            >
              <Text>RECENTRER</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Agrandir l’illustration"
              style={styles.outline}
              onPress={() => zoom(0.5)}
            >
              <Text>＋</Text>
            </Pressable>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
