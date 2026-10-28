import type { Card } from "./catalog";

export function sortCardsForReveal(cards: readonly Card[]): Card[] {
  return cards
    .map((card, originalIndex) => ({ card, originalIndex }))
    .sort(
      (a, b) =>
        a.card.rarity - b.card.rarity || a.originalIndex - b.originalIndex,
    )
    .map(({ card }) => card);
}

export function revealTiming(
  rarity: number,
  final: boolean,
  reduced: boolean,
) {
  if (reduced) return { firstHalf: 0, secondHalf: 0 };
  const firstHalf = final
    ? 1450 + Math.max(0, rarity - 2) * 130
    : rarity >= 4
      ? 950
      : rarity >= 2
        ? 680
        : 500;
  return { firstHalf, secondHalf: final ? 520 : 300 };
}

export function finalRevealHold(rarity: number, reduced: boolean): number {
  return reduced ? 0 : 1200 + Math.max(0, rarity - 2) * 180;
}
