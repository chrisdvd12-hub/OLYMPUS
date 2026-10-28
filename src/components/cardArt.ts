// Exact complete front approved by the owner, with OLY-30 left and collection right.
// The original frame and painting are also kept under assets/cards for future designs.
export const CARD_ART = {
  "olympe-30": require("../../assets/cards/zeus-divine-front-transparent.png"),
} as const;

export function hasCardArt(id: string): id is keyof typeof CARD_ART {
  return Object.prototype.hasOwnProperty.call(CARD_ART, id);
}
