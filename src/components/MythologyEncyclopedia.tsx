import { Pressable, View } from "react-native";
import type { Card } from "../domain/catalog";
import { RARITIES } from "../domain/catalog";
import { relatedCards } from "../domain/collection";
import { AppText as Text } from "./AppText";
import { fonts, styles, theme } from "./theme";
import { OlympusIcon, OlympusMarblePanel, OlympusSectionTitle } from "./OlympusUI";
export function MythologyEncyclopedia({
  card,
  onNavigate,
}: {
  card: Card;
  onNavigate: (id: string) => void;
}) {
  return (
    <View style={{ gap: 16 }}>
      <View
        style={[
          styles.panel,
          { backgroundColor: theme.paper, borderColor: theme.gold },
        ]}
      >
        <Text
          accessibilityRole="header"
          style={{ color: theme.ink, fontFamily: fonts.bold, fontSize: 18 }}
        >
          Histoire et origines
        </Text>
        <Text style={{ color: "#292d3a", fontSize: 16, lineHeight: 28 }}>
          {card.history ?? "Non renseignées dans le catalogue."}
        </Text>
      </View>
      <OlympusMarblePanel>
        <OlympusSectionTitle>ATTRIBUTS ET SYMBOLES</OlympusSectionTitle>
        <Text style={styles.text}>
          {card.attributes?.join(" · ") ?? "Non renseignés dans le catalogue."}
        </Text>
      </OlympusMarblePanel>
      <OlympusMarblePanel>
        <OlympusSectionTitle>RELATIONS MYTHOLOGIQUES</OlympusSectionTitle>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {card.relations?.map((name) => {
            const matches = relatedCards(name);
            return matches.length ? (
              matches.map((match) => (
                <Pressable
                  key={`${name}-${match.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Lire ${name}, ${RARITIES[match.rarity]}`}
                  onPress={() => onNavigate(match.id)}
                  style={[styles.outline, { paddingHorizontal: 10, flexDirection: "row", gap: 6 }]}
                >
                  <Text style={{ color: theme.highlight, fontSize: 12 }}>
                    {name}
                    {matches.length > 1 ? ` · ${RARITIES[match.rarity]}` : ""}
                  </Text>
                  <OlympusIcon name="next" size={15} color={theme.highlight} />
                </Pressable>
              ))
            ) : (
              <Text key={name} style={styles.text}>
                {name}
              </Text>
            );
          })}
        </View>
      </OlympusMarblePanel>
      {!!card.editorialNote && (
        <OlympusMarblePanel>
          <OlympusSectionTitle>NOTE ÉDITORIALE</OlympusSectionTitle>
          <Text style={styles.text}>{card.editorialNote}</Text>
        </OlympusMarblePanel>
      )}
    </View>
  );
}
