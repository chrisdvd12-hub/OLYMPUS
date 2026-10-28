import { useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { collectionStats } from "../domain/collection";
import type { GameState } from "../domain/boosters";
import { AppText as Text } from "./AppText";
import { CollectionProgress } from "./CollectionProgress";
import { fonts, styles, theme } from "./theme";
export function PlayerPanel({
  state,
  onSave,
  missions = false,
  reduced = false,
}: {
  state: GameState;
  onSave: (name: string) => Promise<void>;
  missions?: boolean;
  reduced?: boolean;
}) {
  const [name, setName] = useState(state.playerName ?? "Collectionneur");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const stats = useMemo(
    () => collectionStats(state.collection),
    [state.collection],
  );
  const goals = [
    {
      title: "Premières découvertes",
      description: "Découvrir 10 cartes différentes",
      value: stats.owned,
      max: 10,
    },
    {
      title: "Les quatre sanctuaires",
      description: "Découvrir une carte dans chaque extension",
      value: stats.byExtension.filter((e) => e.owned > 0).length,
      max: 4,
    },
    {
      title: "Un trésor exceptionnel",
      description: "Découvrir une carte légendaire ou supérieure",
      value: stats.byRarity.slice(4).reduce((total, r) => total + r.owned, 0),
      max: 1,
    },
    {
      title: "Une extension complète",
      description: "Compléter les 30 cartes d’une extension",
      value: Math.max(...stats.byExtension.map((e) => e.owned)),
      max: 30,
    },
  ];
  if (missions)
    return (
      <View style={styles.body}>
        <Text style={styles.title}>LES QUÊTES DU COLLECTIONNEUR</Text>
        <Text style={styles.muted}>
          Vos objectifs de collection se complètent au fil des découvertes.
        </Text>
        {goals.map((goal) => (
          <View key={goal.title} style={styles.panel}>
            <Text style={styles.subtitle}>{goal.title}</Text>
            <Text style={styles.text}>{goal.description}</Text>
            <Text style={[styles.muted, { color: theme.highlight }]}>
              {Math.min(goal.value, goal.max)} / {goal.max}
              {goal.value >= goal.max ? " · ACCOMPLIE" : ""}
            </Text>
          </View>
        ))}
      </View>
    );
  return (
    <View style={styles.body}>
      <Text style={styles.title}>VOTRE PROFIL</Text>
      <View style={styles.panel}>
        <Text style={styles.subtitle}>NOM DU COLLECTIONNEUR</Text>
        <TextInput
          accessibilityLabel="Nom du joueur"
          value={name}
          onChangeText={setName}
          maxLength={30}
          style={{
            color: theme.paper,
            fontFamily: fonts.regular,
            padding: 12,
            borderWidth: 1,
            borderColor: theme.line,
            minHeight: 48,
          }}
        />
        <Pressable
          accessibilityRole="button"
          disabled={saving}
          style={styles.button}
          onPress={async () => {
            setSaving(true);
            try {
              await onSave(name);
              setMessage("Profil enregistré.");
            } catch (e) {
              setMessage(e instanceof Error ? e.message : String(e));
            } finally {
              setSaving(false);
            }
          }}
        >
          <Text style={styles.buttonText}>
            {saving ? "ENREGISTREMENT…" : "ENREGISTRER"}
          </Text>
        </Pressable>
        {!!message && (
          <Text accessibilityLiveRegion="polite" style={styles.text}>
            {message}
          </Text>
        )}
      </View>
      <Text style={styles.muted}>
        {stats.copies} exemplaires · {stats.duplicates} doublons
      </Text>
      <CollectionProgress
        collection={state.collection}
        detailed
        reduced={reduced}
      />
    </View>
  );
}
