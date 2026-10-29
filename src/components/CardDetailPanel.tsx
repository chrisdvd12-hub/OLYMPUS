import { View } from "react-native";
import { EXTENSIONS, RARITIES, type Card } from "../domain/catalog";
import { AppText as Text } from "./AppText";
import { GreekOrnament } from "./GreekOrnament";
import { MythologyEncyclopedia } from "./MythologyEncyclopedia";
import { styles } from "./theme";
import { OlympusMarblePanel, OlympusSectionTitle } from "./OlympusUI";
export function CardDetailPanel({
  card,
  quantity,
  onNavigate,
}: {
  card: Card;
  quantity?: number;
  onNavigate: (id: string) => void;
}) {
  return (
    <View style={{ gap: 16 }}>
      <Text accessibilityRole="header" style={styles.title}>
        {card.name.toUpperCase()}
      </Text>
      <GreekOrnament />
      <Text style={styles.muted}>
        {card.number} · {RARITIES[card.rarity]}
        {quantity === undefined ? "" : ` · ×${quantity}`}
      </Text>
      <Text style={styles.muted}>
        {EXTENSIONS.find((e) => e.id === card.extension)?.name}
      </Text>
      <OlympusMarblePanel>
        <Text style={styles.text}>{card.description}</Text>
      </OlympusMarblePanel>
      <MythologyEncyclopedia card={card} onNavigate={onNavigate} />
      <OlympusMarblePanel>
        <OlympusSectionTitle>CARACTÉRISTIQUES DU PERSONNAGE</OlympusSectionTitle>
        {!!card.epithet && (
          <View style={{ gap: 4 }}>
            <Text style={[styles.subtitle, { textAlign: "left" }]}>SURNOM</Text>
            <Text style={styles.text}>{card.epithet}</Text>
          </View>
        )}
        {!!card.category && (
          <View style={{ gap: 4 }}>
            <Text style={[styles.subtitle, { textAlign: "left" }]}>CATÉGORIE</Text>
            <Text style={styles.text}>{card.category}</Text>
          </View>
        )}
      </OlympusMarblePanel>
    </View>
  );
}
