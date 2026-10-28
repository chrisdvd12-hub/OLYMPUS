// Shared transparent frame library for all four extensions.
// Master assets supplied by the owner; never synthesize per-card borders.
export const RARITY_FRAME_ART = [
  require("../../assets/frames/commune.png"),
  require("../../assets/frames/peu-commune.png"),
  require("../../assets/frames/rare.png"),
  require("../../assets/frames/epique.png"),
  require("../../assets/frames/legendaire.png"),
  require("../../assets/frames/mythique.png"),
  require("../../assets/frames/divine.png"),
] as const;
