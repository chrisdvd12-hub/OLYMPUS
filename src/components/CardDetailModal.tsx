import { AppText as Text } from "./AppText";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { EXTENSIONS, RARITIES, findCard } from "../domain/catalog";
import { SanctuaryBackdrop } from "./SanctuaryBackdrop";
import { GreekOrnament } from "./GreekOrnament";
import { CardFace } from "./CardFace";
import { CARD_ASPECT_RATIO } from "./CardBack";
import { styles, theme } from "./theme";

export function CardDetailModal({
  cardId,
  quantity,
  reduced = false,
  onClose,
}: {
  cardId: string;
  quantity: number;
  reduced?: boolean;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  const card = findCard(cardId);
  if (!card) return null;
  const collection = EXTENSIONS.find((e) => e.id === card.extension)?.name;
  const regular = "CinzelRegular";
  const bold = "CinzelBold";
  const semibold = "CinzelSemiBold";
  return (
    <Modal
      visible
      presentationStyle="fullScreen"
      animationType={reduced ? "none" : "fade"}
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen}>
          <SanctuaryBackdrop />
          <View style={s.toolbar}>
            <Text
              accessibilityRole="header"
              style={[styles.text, { fontFamily: semibold }]}
            >
              {card.number ?? card.id} · {RARITIES[card.rarity]}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer la fiche de la carte"
              onPress={onClose}
              style={s.close}
            >
              <Text style={{ color: theme.gold, fontSize: 25 }}>×</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={s.content}>
            <View
              accessible={false}
              accessibilityElementsHidden
              style={{
                width: Math.min(width - 40, 440),
                aspectRatio: CARD_ASPECT_RATIO,
                alignSelf: "center",
              }}
            >
              <CardFace card={card} />
            </View>
            <Text style={[styles.muted, { fontFamily: regular }]}>
              {quantity > 0
                ? `${quantity} exemplaire${quantity > 1 ? "s" : ""} dans votre collection`
                : "À découvrir · Cet aperçu n’ajoute pas la carte à votre collection"}
            </Text>
            <Text
              accessibilityRole="header"
              style={[styles.title, { fontFamily: bold }]}
            >
              {card.name.toUpperCase()}
            </Text>
            <GreekOrnament />
            {card.epithet && (
              <Text
                style={[
                  styles.text,
                  s.center,
                  { color: theme.gold, fontFamily: semibold },
                ]}
              >
                {card.epithet}
              </Text>
            )}
            <Text style={[styles.muted, { fontFamily: regular }]}>
              {collection}
            </Text>
            {card.category && (
              <Text style={[styles.muted, { fontFamily: regular }]}>
                {card.category}
              </Text>
            )}
            {card.editorialNote && (
              <Text style={[s.paragraph, { fontFamily: regular }]}>
                {card.editorialNote}
              </Text>
            )}
            {card.description && (
              <View style={styles.panel}>
                <Text
                  accessibilityRole="header"
                  style={[
                    styles.text,
                    { color: theme.gold, fontFamily: semibold },
                  ]}
                >
                  Description de la carte
                </Text>
                <Text style={[s.paragraph, { fontFamily: regular }]}>
                  {card.description}
                </Text>
              </View>
            )}
            {card.history && (
              <View style={styles.panel}>
                <Text
                  accessibilityRole="header"
                  style={[
                    styles.text,
                    { color: theme.gold, fontFamily: semibold },
                  ]}
                >
                  Encyclopédie
                </Text>
                <Text style={[s.paragraph, { fontFamily: regular }]}>
                  {card.history}
                </Text>
              </View>
            )}
            {card.attributes && (
              <View style={styles.panel}>
                <Text
                  accessibilityRole="header"
                  style={[
                    styles.text,
                    { color: theme.gold, fontFamily: semibold },
                  ]}
                >
                  Attributs
                </Text>
                <Text style={[s.paragraph, { fontFamily: regular }]}>
                  {card.attributes.join(" · ")}
                </Text>
              </View>
            )}
            {card.relations && (
              <View style={styles.panel}>
                <Text
                  accessibilityRole="header"
                  style={[
                    styles.text,
                    { color: theme.gold, fontFamily: semibold },
                  ]}
                >
                  Relations
                </Text>
                <Text style={[s.paragraph, { fontFamily: regular }]}>
                  {card.relations.join(" · ")}
                </Text>
              </View>
            )}
            <Pressable
              accessibilityRole="button"
              style={styles.button}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>FERMER LA FICHE</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}
const s = StyleSheet.create({
  toolbar: {
    backgroundColor: "#07121ee8",
    borderBottomWidth: 1,
    borderBottomColor: theme.line,
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  close: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#695b3e",
    borderRadius: 24,
  },
  content: { padding: 20, paddingBottom: 36, gap: 18 },
  center: { textAlign: "center" },
  paragraph: { color: theme.paper, fontSize: 16, lineHeight: 27 },
});
