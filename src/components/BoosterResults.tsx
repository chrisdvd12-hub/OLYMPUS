import { AppText as Text } from "./AppText";
import { useState } from "react";
import { CardDetailModal } from "./CardDetailModal";
import { View, Pressable } from "react-native";
import type { Receipt } from "../domain/boosters";
import { BoosterCardReveal } from "./BoosterCardReveal";
import { GreekOrnament, TempleSeal } from "./GreekOrnament";
import { styles, theme } from "./theme";
export function BoosterResults({
  receipt,
  reduced = false,
  onCollection,
  onAgain,
  onShop,
}: {
  receipt: Receipt;
  reduced?: boolean;
  onCollection: () => void;
  onAgain: () => void;
  onShop: () => void;
}) {
  const [inspectedIndex, setInspectedIndex] = useState<number | null>(null);
  const inspected =
    inspectedIndex === null ? null : receipt.cards[inspectedIndex];
  return (
    <View style={styles.body}>
      <View style={{ alignItems: "center" }}><TempleSeal /></View>
      <Text style={styles.title}>VOTRE TRÉSOR</Text>
      <GreekOrnament />
      <Text style={styles.muted}>
        7 cartes déjà enregistrées dans votre collection
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {receipt.cards.map((card, i) => (
          <View key={i} style={{ width: "23%", alignItems: "center" }}>
            <View style={{ width: "100%", alignItems: "center" }}>
              <BoosterCardReveal
                card={card}
                index={i}
                revealed
                onReveal={() => {}}
                onInspect={() => setInspectedIndex(i)}
                reduced
                compact
                fullWidth
              />
            </View>
            <Text
              style={{
                color: receipt.discoveries[i] ? theme.gold : theme.muted,
                fontFamily: "CinzelSemiBold",
                fontSize: 9,
                lineHeight: 15,
                backgroundColor: "#07121edb",
                borderRadius: 4,
                paddingVertical: 4,
                paddingHorizontal: 2,
                textAlign: "center",
              }}
            >
              {receipt.discoveries[i]
                ? "NOUVEAU"
                : `DOUBLON · ×${receipt.quantities[i]}`}
            </Text>
          </View>
        ))}
      </View>
      <Pressable accessibilityRole="button" style={styles.button} onPress={onCollection}>
        <Text style={styles.buttonText}>VOIR MA COLLECTION</Text>
      </Pressable>
      <Pressable accessibilityRole="button" style={styles.outline} onPress={onAgain}>
        <Text style={styles.text}>OUVRIR UN AUTRE BOOSTER</Text>
      </Pressable>
      <Pressable accessibilityRole="button" style={styles.outline} onPress={onShop}>
        <Text style={styles.text}>RETOUR À LA BOUTIQUE</Text>
      </Pressable>
      {inspected && (
        <CardDetailModal
          cardId={inspected.id}
          quantity={receipt.quantities[inspectedIndex!] ?? 0}
          reduced={reduced}
          onClose={() => setInspectedIndex(null)}
        />
      )}
    </View>
  );
}
