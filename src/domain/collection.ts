import { CARDS, EXTENSIONS, type Card } from "./catalog.ts";
export interface CollectionFilters {
  extension?: string;
  rarity?: number;
  query?: string;
  possession?: "all" | "owned" | "missing" | "duplicates";
  sort?: "number" | "name" | "rarity";
}
export function normalizedName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/[’']/g, "'")
    .trim();
}
export function filterCollection(
  collection: Record<string, number>,
  filters: CollectionFilters,
): Card[] {
  const query = normalizedName(filters.query ?? "");
  return CARDS.filter((card) => {
    const quantity = collection[card.id] ?? 0;
    return (
      (!filters.extension || card.extension === filters.extension) &&
      (filters.rarity === undefined || card.rarity === filters.rarity) &&
      (!query ||
        normalizedName(
          `${card.name} ${card.number} OLY-${String(cardOrder(card)).padStart(3, "0")} ${card.epithet}`,
        ).includes(query)) &&
      (!filters.possession ||
        filters.possession === "all" ||
        (filters.possession === "owned" && quantity > 0) ||
        (filters.possession === "missing" && quantity === 0) ||
        (filters.possession === "duplicates" && quantity > 1))
    );
  }).sort((a, b) =>
    filters.sort === "name"
      ? a.name.localeCompare(b.name, "fr") || cardOrder(a) - cardOrder(b)
      : filters.sort === "rarity"
        ? b.rarity - a.rarity || cardOrder(a) - cardOrder(b)
        : cardOrder(a) - cardOrder(b),
  );
}
export function cardOrder(card: Card): number {
  return (
    EXTENSIONS.findIndex((e) => e.id === card.extension) * 30 +
    Number(card.id.split("-").at(-1))
  );
}
export function collectionStats(collection: Record<string, number>) {
  const owned = CARDS.filter((card) => (collection[card.id] ?? 0) > 0);
  return {
    owned: owned.length,
    missing: CARDS.length - owned.length,
    percent: Math.round((owned.length / CARDS.length) * 100),
    copies: owned.reduce((total, card) => total + collection[card.id]!, 0),
    duplicates: owned.reduce(
      (total, card) => total + Math.max(0, collection[card.id]! - 1),
      0,
    ),
    byExtension: EXTENSIONS.map((e) => ({
      ...e,
      owned: owned.filter((c) => c.extension === e.id).length,
      total: 30,
    })),
    byRarity: Array.from({ length: 7 }, (_, rarity) => ({
      rarity,
      owned: owned.filter((c) => c.rarity === rarity).length,
      total: CARDS.filter((c) => c.rarity === rarity).length,
    })),
  };
}
export function relatedCards(name: string): Card[] {
  return CARDS.filter(
    (card) => normalizedName(card.name) === normalizedName(name),
  );
}
export function validProfileName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 30)
    throw Error("Le nom doit contenir entre 1 et 30 caractères.");
  return trimmed;
}
