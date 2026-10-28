import { View } from "react-native";
import { EXTENSIONS, RARITIES, type Card } from "../domain/catalog";
import { AppText as Text } from "./AppText";
import { GreekOrnament } from "./GreekOrnament";
import { MythologyEncyclopedia } from "./MythologyEncyclopedia";
import { styles, theme } from "./theme";
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
      <Text style={[styles.subtitle, { color: theme.highlight }]}>
        {card.epithet}
      </Text>
      <GreekOrnament />
      <Text style={styles.muted}>
        {card.number} · {RARITIES[card.rarity]}
        {quantity === undefined ? "" : ` · ×${quantity}`}
      </Text>
      <Text style={styles.muted}>
        {EXTENSIONS.find((e) => e.id === card.extension)?.name}
      </Text>
      <Text style={styles.muted}>{card.category}</Text>
      <View style={styles.panel}>
        <Text style={styles.text}>{card.description}</Text>
      </View>
      <MythologyEncyclopedia card={card} onNavigate={onNavigate} />
    </View>
  );
}
