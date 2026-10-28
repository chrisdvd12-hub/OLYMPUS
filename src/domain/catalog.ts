import { CATALOGUE_DATA } from "./catalogueData.ts";
import { ZEUS_DIVINE } from "./zeus.ts";

export const RARITIES = [
  "Commune",
  "Peu commune",
  "Rare",
  "Épique",
  "Légendaire",
  "Mythique",
  "Divine",
] as const;
export type Rarity = (typeof RARITIES)[number];
export const WEIGHTS = [5500, 2500, 1200, 500, 250, 45, 5] as const;
export const COLORS = [
  "#aca69a",
  "#729b72",
  "#619fee",
  "#b47ae0",
  "#edc05d",
  "#be8ae7",
  "#fff3c4",
];
export const EXTENSIONS = [
  {
    id: "olympe",
    name: "LES MAÎTRES DE L’OLYMPE",
    hero: "Zeus",
    color: "#174b8b",
    symbol: "ϟ",
    names: [
      "Hestia",
      "Hermès",
      "Artémis",
      "Apollon",
      "Athéna",
      "Héra",
      "Zeus",
      "Poséidon",
      "Déméter",
      "Dionysos",
    ],
  },
  {
    id: "titans",
    name: "L’ÈRE DES TITANS",
    hero: "Cronos",
    color: "#17624e",
    symbol: "◷",
    names: [
      "Thémis",
      "Téthys",
      "Hypérion",
      "Japet",
      "Rhéa",
      "Océan",
      "Cronos",
      "Gaïa",
      "Ouranos",
      "Mnémosyne",
    ],
  },
  {
    id: "heros",
    name: "LES HÉROS DE LÉGENDE",
    hero: "Achille",
    color: "#852c39",
    symbol: "⚔",
    names: [
      "Atalante",
      "Orphée",
      "Jason",
      "Thésée",
      "Persée",
      "Ulysse",
      "Achille",
      "Héraclès",
      "Hector",
      "Bellérophon",
    ],
  },
  {
    id: "creatures",
    name: "LES CRÉATURES DU MYTHE",
    hero: "Méduse",
    color: "#59367f",
    symbol: "♆",
    names: [
      "Harpie",
      "Satyre",
      "Centaure",
      "Cerbère",
      "Minotaure",
      "Hydre",
      "Méduse",
      "Pégase",
      "Sphinx",
      "Chimère",
    ],
  },
] as const;
export type Extension = (typeof EXTENSIONS)[number];
export interface Card {
  id: string;
  extension: string;
  name: string;
  rarity: number;
  number?: string;
  epithet?: string;
  category?: string;
  description?: string;
  history?: string;
  attributes?: readonly string[];
  relations?: readonly string[];
  editorialNote?: string;
}
// Preserve save-slot identifiers; the approved Zeus front and copy take precedence.
export const CARDS: Card[] = CATALOGUE_DATA.map((card) =>
  card.id === ZEUS_DIVINE.id ? { ...card, ...ZEUS_DIVINE } : card,
);

const CARD_BY_ID = new Map(CARDS.map((card) => [card.id, card]));

// Resolve legacy receipt snapshots against current editorial data, without changing the draw.
export function resolveCard(card: Card): Card {
  const current = CARD_BY_ID.get(card.id);
  // A pending booster keeps the rarity that was drawn before an editorial update.
  return current ? { ...current, rarity: card.rarity } : card;
}

export function findCard(id: string): Card | undefined {
  return CARD_BY_ID.get(id);
}
