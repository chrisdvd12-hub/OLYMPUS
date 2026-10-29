import { memo, useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { EXTENSIONS, RARITIES, type Card } from "../domain/catalog";
import { filterCollection, type CollectionFilters } from "../domain/collection";
import { AppText as Text } from "./AppText";
import { CardFace } from "./CardFace";
import { CardBack } from "./CardBack";
import { CollectionProgress } from "./CollectionProgress";
import { fonts, styles, theme } from "./theme";
function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.outline,
        { minHeight: 44, padding: 10 },
        selected && styles.activeTab,
      ]}
    >
      <Text
        style={{
          color: selected ? theme.highlight : theme.muted,
          fontSize: 11,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function CardCollectionGrid({
  collection,
  recentDiscoveries = [],
  reduced,
  onInspect,
}: {
  collection: Record<string, number>;
  recentDiscoveries?: readonly string[];
  reduced: boolean;
  onInspect: (id: string) => void;
}) {
  const { width } = useWindowDimensions();
  const [filters, setFilters] = useState<CollectionFilters>({
    possession: "all",
    sort: "number",
  });
  const [viewMode, setViewMode] = useState<"grid" | "list" | "gallery">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [details, setDetails] = useState(false);
  const cards = useMemo(
    () => filterCollection(collection, { ...filters, newCardIds: recentDiscoveries }),
    [collection, filters, recentDiscoveries],
  );
  const gallery = viewMode === "gallery";
  const list = viewMode === "list";
  const columns = list
    ? 1
    : gallery
    ? width >= 700
      ? 2
      : 1
    : width >= 1000
      ? 6
      : width >= 700
        ? 5
        : width < 360
          ? 2
          : 3;
  const tileWidth = Math.min(
    gallery ? 400 : 200,
    (width - 44 - (columns - 1) * 12) / columns,
  );
  const update = (next: Partial<CollectionFilters>) =>
    setFilters((old) => ({ ...old, ...next }));
  const renderItem = useCallback(
    ({ item }: { item: Card }) => (
      <CollectionTile
        item={item}
        quantity={collection[item.id] ?? 0}
        width={tileWidth}
        reduced={reduced}
        gallery={gallery}
        list={list}
        onInspect={onInspect}
      />
    ),
    [collection, tileWidth, reduced, gallery, list, onInspect],
  );
  return (
    <FlatList
      key={columns}
      data={cards}
      extraData={collection}
      renderItem={renderItem}
      numColumns={columns}
      keyExtractor={(card) => card.id}
      initialNumToRender={columns * 2}
      maxToRenderPerBatch={columns * 2}
      windowSize={3}
      removeClippedSubviews={Platform.OS === "android"}
      contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 30 }}
      columnWrapperStyle={
        columns > 1 ? { gap: 12, justifyContent: "center" } : undefined
      }
      ListEmptyComponent={
        <Text style={[styles.muted, { padding: 30 }]}>
          Aucune carte ne correspond aux filtres.
        </Text>
      }
      ListHeaderComponent={
        <View style={{ paddingVertical: 18, gap: 14 }}>
          <Text accessibilityRole="header" style={styles.title}>
            L’ALBUM DIVIN
          </Text>
          <CollectionProgress
            collection={collection}
            detailed={details}
            reduced={reduced}
          />
          <TextInput
            accessibilityLabel="Rechercher par nom ou numéro"
            placeholder="Nom ou numéro de carte…"
            placeholderTextColor={theme.muted}
            value={filters.query ?? ""}
            onChangeText={(query) => update({ query })}
            style={{
              fontFamily: fonts.regular,
              color: theme.paper,
              borderWidth: 1,
              borderColor: theme.line,
              borderRadius: 6,
              padding: 14,
              backgroundColor: "#0b1426ee",
              minHeight: 48,
            }}
          />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            <FilterChip
              label="FILTRES"
              selected={showFilters}
              onPress={() => setShowFilters((old) => !old)}
            />
            <FilterChip
              label="GRILLE"
              selected={viewMode === "grid"}
              onPress={() => setViewMode("grid")}
            />
            <FilterChip
              label="LISTE"
              selected={viewMode === "list"}
              onPress={() => setViewMode("list")}
            />
            <FilterChip
              label="GALERIE"
              selected={viewMode === "gallery"}
              onPress={() => setViewMode("gallery")}
            />
            <FilterChip
              label="PROGRESSION"
              selected={details}
              onPress={() => setDetails((old) => !old)}
            />
          </View>
          {showFilters && (
            <View style={{ gap: 10 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6 }}
              >
                <FilterChip
                  label="TOUTES LES EXTENSIONS"
                  selected={!filters.extension}
                  onPress={() => update({ extension: undefined })}
                />
                {EXTENSIONS.map((e) => (
                  <FilterChip
                    key={e.id}
                    label={e.name}
                    selected={filters.extension === e.id}
                    onPress={() => update({ extension: e.id })}
                  />
                ))}
              </ScrollView>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6 }}
              >
                <FilterChip
                  label="TOUTES LES RARETÉS"
                  selected={filters.rarity === undefined}
                  onPress={() => update({ rarity: undefined })}
                />
                {RARITIES.map((label, rarity) => (
                  <FilterChip
                    key={label}
                    label={label.toUpperCase()}
                    selected={filters.rarity === rarity}
                    onPress={() => update({ rarity })}
                  />
                ))}
              </ScrollView>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6 }}
              >
                {(
                  [
                    ["all", "TOUTES"],
                    ["owned", "POSSÉDÉES"],
                    ["missing", "MANQUANTES"],
                    ["duplicates", "DOUBLONS"],
                    ["new", "NOUVELLES"],
                  ] as const
                ).map(([possession, label]) => (
                  <FilterChip
                    key={possession}
                    label={label}
                    selected={filters.possession === possession}
                    onPress={() => update({ possession })}
                  />
                ))}
              </ScrollView>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {(
                  [
                    ["number", "N°"],
                    ["name", "NOM"],
                    ["rarity", "RARETÉ"],
                  ] as const
                ).map(([sort, label]) => (
                  <FilterChip
                    key={sort}
                    label={`TRI ${label}`}
                    selected={filters.sort === sort}
                    onPress={() => update({ sort })}
                  />
                ))}
              </View>
            </View>
          )}
          <Text style={styles.muted}>
            {cards.length} carte{cards.length > 1 ? "s" : ""} affichée
            {cards.length > 1 ? "s" : ""}
          </Text>
        </View>
      }
    />
  );
}

const CollectionTile = memo(function CollectionTile({
  item,
  quantity,
  width,
  reduced,
  gallery,
  list,
  onInspect,
}: {
  item: Card;
  quantity: number;
  width: number;
  reduced: boolean;
  gallery: boolean;
  list: boolean;
  onInspect: (id: string) => void;
}) {
  return (
    <Animated.View
      entering={reduced ? undefined : FadeIn.duration(200)}
      style={{ width: width, marginBottom: list ? 10 : 20, gap: 6 }}
    >
      <View style={list ? { flexDirection: "row", alignItems: "center", gap: 14 } : undefined}>
      <Pressable
        accessibilityRole="button"
        disabled={!quantity}
        accessibilityLabel={
          quantity
            ? `Admirer ${item.name}, ${RARITIES[item.rarity]}, ${quantity} exemplaires`
            : `${item.number}, carte non découverte`
        }
        onPress={() => onInspect(item.id)}
        style={{ width: list ? 84 : width, aspectRatio: 5 / 7 }}
      >
        {quantity ? (
          <CardFace card={item} />
        ) : (
          <View style={{ flex: 1, opacity: 0.34 }}>
            <CardBack />
          </View>
        )}
        {quantity > 0 && item.rarity >= 4 && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: 0,
              left: "15%",
              right: "15%",
              height: 2,
              backgroundColor: item.rarity >= 5 ? theme.violet : theme.gold,
            }}
          />
        )}
      </Pressable>
      <View style={list ? { flex: 1, gap: 4 } : { gap: 4 }}>
      <Text
        numberOfLines={gallery ? 2 : 1}
        style={[
          styles.muted,
          {
            color: quantity ? theme.paper : theme.muted,
            fontSize: gallery ? 16 : 11,
          },
        ]}
      >
        {quantity ? item.name : "À DÉCOUVRIR"}
      </Text>
      <Text style={[styles.muted, { fontSize: 10 }]}>
        {item.number}
        {quantity > 1
          ? ` · DOUBLON ×${quantity}`
          : quantity
            ? ` · ${RARITIES[item.rarity]}`
            : ""}
      </Text>
      </View>
      </View>
    </Animated.View>
  );
});
