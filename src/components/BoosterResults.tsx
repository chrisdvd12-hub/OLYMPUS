import { AppText as Text } from "./AppText";
import { useState } from "react";
import { CardDetailModal } from "./CardDetailModal";
import { View, Pressable } from "react-native";
import type { Receipt } from "../domain/boosters";
import { BoosterCardReveal } from "./BoosterCardReveal";
import { PremiumButton } from "./PremiumButton";
import { GreekOrnament, TempleSeal } from "./GreekOrnament";
import { styles, theme } from "./theme";
import { OlympusMarblePanel, OlympusSectionTitle, OlympusStatCard } from "./OlympusUI";
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
      <View style={{ alignItems: "center" }}>
        <TempleSeal />
      </View>
      <Text style={styles.title}>VOTRE TRÉSOR</Text>
      <GreekOrnament />
      <Text style={styles.muted}>
        7 cartes déjà enregistrées dans votre collection
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <OlympusStatCard compact icon="cards" value={receipt.discoveries.filter(Boolean).length} label="NOUVELLES CARTES" />
        <OlympusStatCard compact icon="duplicates" value={receipt.discoveries.filter((value) => !value).length} label="DOUBLONS" />
      </View>
      <OlympusMarblePanel>
        <OlympusSectionTitle>LES SEPT PRÉSENTS</OlympusSectionTitle>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
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
      </OlympusMarblePanel>
      <PremiumButton
        reduced={reduced}
        label="VOIR MA COLLECTION"
        onPress={onCollection}
      />
      <PremiumButton
        reduced={reduced}
        secondary
        label="OUVRIR UN AUTRE BOOSTER"
        onPress={onAgain}
      />
      <PremiumButton
        reduced={reduced}
        secondary
        label="RETOUR À LA BOUTIQUE"
        onPress={onShop}
      />
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
