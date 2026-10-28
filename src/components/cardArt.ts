// Archived complete Zeus front, with OLY-30 left and collection right.
// Not used in the live card: its baked-in epithet was moved to character details.
// Original frame, painting and complete images remain unchanged on disk.
export const CARD_ART = {
  "olympe-30": require("../../assets/cards/zeus-divine-front-transparent.png"),
} as const;

export function hasCardArt(id: string): id is keyof typeof CARD_ART {
  return Object.prototype.hasOwnProperty.call(CARD_ART, id);
}
