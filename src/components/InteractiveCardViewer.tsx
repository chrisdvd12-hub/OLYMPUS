import { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useAppActivity } from "../animations/openingMotion";
import type { Card } from "../domain/catalog";
import {
  clampCollectionPointer,
  collectionEffectFor,
} from "../domain/collectionEffects";
import { projectedYaw } from "../interaction/spatial";
import { selectionFeedback } from "../interaction/feedback";
import { AppText as Text } from "./AppText";
import { CardFront } from "./CardFront";
import { CardBack } from "./CardBack";
import { Card3DTransform } from "./Card3DTransform";
import {
  CollectionCardEffects,
  CollectionLivingCard,
} from "./CollectionCardEffects";
import { CardArtworkZoom } from "./CardArtworkZoom";
import { CardDetailPanel } from "./CardDetailPanel";
import { SanctuaryBackdrop } from "./SanctuaryBackdrop";
import { styles, theme } from "./theme";
import { LinearGradient } from "expo-linear-gradient";
import { OlympusIcon } from "./OlympusUI";
export function InteractiveCardViewer({
  card,
  quantity,
  reduced,
  onClose,
  onNavigate,
}: {
  card: Card;
  quantity?: number;
  reduced: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const { width, height } = useWindowDimensions();
  const [zoom, setZoom] = useState(false);
  const [cardVisible, setCardVisible] = useState(true);
  const cardVisibleRef = useRef(true);
  const active = useAppActivity();
  const yaw = useSharedValue(0);
  const pitch = useSharedValue(0);
  const startYaw = useSharedValue(0);
  const startPitch = useSharedValue(0);
  const lightX = useSharedValue(0);
  const lightY = useSharedValue(0);
  const duration = reduced ? 0 : 600;
  const cardWidth = Math.min(
    width - 72,
    400,
    Math.max(180, (height * 0.52 * 5) / 7),
  );
  const cardHeight = (cardWidth * 7) / 5;
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(active && cardVisible && !zoom)
        .minDistance(5)
        .onStart(() => {
          cancelAnimation(yaw);
          cancelAnimation(pitch);
          startYaw.value = yaw.value;
          startPitch.value = pitch.value;
        })
        .onUpdate((e) => {
          yaw.value = startYaw.value + e.translationX * 0.65;
          pitch.value = Math.max(
            -13,
            Math.min(13, startPitch.value - e.translationY * 0.16),
          );
          lightX.value = clampCollectionPointer((e.x / cardWidth) * 2 - 1);
          lightY.value = clampCollectionPointer((e.y / cardHeight) * 2 - 1);
        })
        .onEnd((e) => {
          if (!reduced) {
            yaw.value = withSpring(projectedYaw(yaw.value, e.velocityX), {
              duration: 400,
              dampingRatio: 0.8,
              velocity: e.velocityX * 0.065,
            });
          }
        })
        .onFinalize(() => {
          if (!reduced) {
            pitch.value = withSpring(0, { duration: 400, dampingRatio: 1 });
            lightX.value = withSpring(0, { duration: 400, dampingRatio: 1 });
            lightY.value = withSpring(0, { duration: 400, dampingRatio: 1 });
          } else {
            pitch.value = 0;
            lightX.value = 0;
            lightY.value = 0;
          }
        }),
    [active, cardVisible, zoom, yaw, pitch, startYaw, startPitch, lightX, lightY, reduced, cardWidth, cardHeight],
  );
  const doubleTap = useMemo(
    () =>
      Gesture.Tap()
        .enabled(active && cardVisible && !zoom)
        .numberOfTaps(2)
        .onEnd((_e, success) => {
          if (success) yaw.value = withTiming(yaw.value + 180, { duration });
        }),
    [active, cardVisible, zoom, yaw, duration],
  );
  const gesture = useMemo(() => Gesture.Race(pan, doubleTap), [pan, doubleTap]);
  useEffect(() => {
    if (!active) {
      cancelAnimation(yaw);
      cancelAnimation(pitch);
    }
    return () => {
      cancelAnimation(yaw);
      cancelAnimation(pitch);
    };
  }, [active, yaw, pitch]);
  const flip = () => {
    yaw.value = withTiming(yaw.value + 180, { duration });
    selectionFeedback(!reduced);
  };
  return (
    <Modal
      visible
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      animationType={reduced ? "none" : "fade"}
    >
      <GestureHandlerRootView style={styles.screen}>
        <SafeAreaView style={styles.screen}>
          <SanctuaryBackdrop />
          <LinearGradient pointerEvents="none" colors={["#06101a80", "#10243acb", "#050b13ee"]} style={{ position: "absolute", inset: 0 }} />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 12,
              backgroundColor: "#0b1426ee",
            }}
          >
            <Text
              numberOfLines={2}
              style={[
                styles.subtitle,
                { flex: 1, textAlign: "left", letterSpacing: 0.5 },
              ]}
            >
              {card.number} · {card.name}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer la fiche de la carte"
              style={styles.outline}
              onPress={onClose}
            >
              <Text>FERMER</Text>
            </Pressable>
          </View>
          <ScrollView
            scrollEventThrottle={100}
            onScroll={(e) =>
              (() => {
                const visible =
                  e.nativeEvent.contentOffset.y < (cardWidth * 7) / 5 + 70;
                if (visible !== cardVisibleRef.current) {
                  cardVisibleRef.current = visible;
                  setCardVisible(visible);
                }
              })()
            }
            contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 18 }}
          >
            <Animated.View style={{ alignItems: "center", paddingVertical: 22 }}>
              <GestureDetector gesture={gesture}>
                <Animated.View
                  collapsable={false}
                  accessible
                  accessibilityRole="adjustable"
                  accessibilityLabel={`Carte ${card.name}, rotation à 360 degrés. Glissez ou utilisez les boutons.`}
                  accessibilityActions={[
                    { name: "increment", label: "Tourner à droite" },
                    { name: "decrement", label: "Tourner à gauche" },
                  ]}
                  onAccessibilityAction={(e) => {
                    yaw.value = withTiming(
                      yaw.value +
                        (e.nativeEvent.actionName === "increment" ? 45 : -45),
                      { duration },
                    );
                  }}
                  style={{ width: cardWidth, aspectRatio: 5 / 7 }}
                >
                  <CollectionLivingCard
                    active={active && !zoom && cardVisible}
                    mode="detail"
                    reduced={reduced}
                  >
                    <Card3DTransform
                      yaw={yaw}
                      pitch={pitch}
                      width={cardWidth}
                      front={
                        <CardFront
                          card={card}
                          width={cardWidth}
                          effectLayer={
                            <CollectionCardEffects
                              card={card}
                              width={cardWidth}
                              mode="detail"
                              lightX={lightX}
                              lightY={lightY}
                              active={active && !zoom && cardVisible}
                              reduced={reduced}
                            />
                          }
                        />
                      }
                      back={<CardBack />}
                    />
                  </CollectionLivingCard>
                </Animated.View>
              </GestureDetector>
            </Animated.View>
            <Text style={styles.muted}>
              Glissez pour tourner · Double touchez pour retourner
            </Text>
            <Text style={[styles.muted, { color: theme.highlight }]}>
              {collectionEffectFor(card.rarity).label}
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tourner la carte à gauche"
                style={styles.outline}
                onPress={() => {
                  yaw.value = withTiming(yaw.value - 45, { duration });
                }}
              >
                <OlympusIcon name="previous" size={21} color={theme.highlight} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={styles.outline}
                onPress={flip}
              >
                <Text>RETOURNER</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={styles.outline}
                onPress={() => {
                  yaw.value = withTiming(Math.round(yaw.value / 360) * 360, {
                    duration,
                  });
                  pitch.value = withTiming(0, { duration });
                }}
              >
                <Text>RECTO · RECENTRER</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tourner la carte à droite"
                style={styles.outline}
                onPress={() => {
                  yaw.value = withTiming(yaw.value + 45, { duration });
                }}
              >
                <OlympusIcon name="next" size={21} color={theme.highlight} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={styles.outline}
                onPress={() => setZoom(true)}
              >
                <Text>VOIR L’ILLUSTRATION</Text>
              </Pressable>
            </View>
            <CardDetailPanel
              card={card}
              quantity={quantity}
              onNavigate={onNavigate}
            />
          </ScrollView>
          {zoom && (
            <CardArtworkZoom
              card={card}
              reduced={reduced}
              onClose={() => setZoom(false)}
            />
          )}
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
}
