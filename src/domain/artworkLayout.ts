// Bounds measured from the transparent aperture of each official master frame.
// A small overlap stays beneath the opaque ornaments to avoid empty edge strips.
export const FRAME_APERTURES = [
  { x: 0.111, y: 0.073, width: 0.78, height: 0.598 },
  { x: 0.123, y: 0.073, width: 0.755, height: 0.562 },
  { x: 0.115, y: 0.071, width: 0.772, height: 0.591 },
  { x: 0.12, y: 0.071, width: 0.761, height: 0.582 },
  { x: 0.118, y: 0.07, width: 0.765, height: 0.576 },
  { x: 0.106, y: 0.07, width: 0.79, height: 0.57 },
  { x: 0.115, y: 0.072, width: 0.77, height: 0.589 },
] as const;
export interface ArtworkFocus {
  x: number;
  y: number;
}
// Focus = face/upper-body centre in the original, uncropped painting (normalised).
export const ARTWORK_FOCUS: Readonly<Record<string, ArtworkFocus>> = {
  "olympe-1": { x: 0.513, y: 0.164 },
  "olympe-2": { x: 0.596, y: 0.227 },
  "olympe-3": { x: 0.565, y: 0.178 },
  "olympe-4": { x: 0.441, y: 0.213 },
  "olympe-5": { x: 0.463, y: 0.229 },
  "olympe-6": { x: 0.531, y: 0.218 },
  "olympe-7": { x: 0.612, y: 0.297 },
  "olympe-8": { x: 0.532, y: 0.229 },
  "olympe-9": { x: 0.585, y: 0.236 },
  "olympe-10": { x: 0.573, y: 0.191 },
  "olympe-11": { x: 0.564, y: 0.218 },
  "olympe-12": { x: 0.565, y: 0.207 },
  "olympe-13": { x: 0.409, y: 0.209 },
  "olympe-14": { x: 0.587, y: 0.249 },
  "olympe-15": { x: 0.533, y: 0.283 },
  "olympe-16": { x: 0.62, y: 0.213 },
  "olympe-17": { x: 0.483, y: 0.227 },
  "olympe-18": { x: 0.585, y: 0.193 },
  "olympe-19": { x: 0.563, y: 0.234 },
  "olympe-20": { x: 0.515, y: 0.246 },
  "olympe-21": { x: 0.516, y: 0.244 },
  "olympe-22": { x: 0.445, y: 0.196 },
  "olympe-23": { x: 0.524, y: 0.222 },
  "olympe-24": { x: 0.543, y: 0.196 },
  "olympe-25": { x: 0.589, y: 0.24 },
  "olympe-26": { x: 0.511, y: 0.233 },
  "olympe-27": { x: 0.544, y: 0.231 },
  "olympe-28": { x: 0.543, y: 0.224 },
  "olympe-29": { x: 0.393, y: 0.221 },
  "olympe-30": { x: 0.548, y: 0.166 },
  "titans-1": { x: 0.61, y: 0.319 },
  "titans-2": { x: 0.467, y: 0.194 },
  "titans-3": { x: 0.477, y: 0.173 },
  "titans-4": { x: 0.571, y: 0.15 },
  "titans-5": { x: 0.439, y: 0.181 },
  "titans-6": { x: 0.593, y: 0.236 },
  "titans-7": { x: 0.494, y: 0.168 },
  "titans-8": { x: 0.511, y: 0.156 },
  "titans-9": { x: 0.605, y: 0.185 },
  "titans-10": { x: 0.48, y: 0.23 },
  "titans-11": { x: 0.59, y: 0.315 },
  "titans-12": { x: 0.49, y: 0.267 },
  "titans-13": { x: 0.5, y: 0.26 },
  "titans-14": { x: 0.62, y: 0.19 },
  "titans-15": { x: 0.38, y: 0.25 },
  "titans-16": { x: 0.5, y: 0.21 },
  "titans-17": { x: 0.5, y: 0.16 },
  "titans-18": { x: 0.53, y: 0.15 },
  "titans-20": { x: 0.56, y: 0.23 },
  "titans-21": { x: 0.38, y: 0.225 },
  "titans-22": { x: 0.6, y: 0.24 },
  "titans-23": { x: 0.495, y: 0.155 },
  "titans-24": { x: 0.61, y: 0.24 },
  "titans-25": { x: 0.62, y: 0.27 },
  "titans-26": { x: 0.6, y: 0.18 },
  "titans-27": { x: 0.47, y: 0.35 },
  "titans-28": { x: 0.51, y: 0.25 },
  "titans-29": { x: 0.49, y: 0.15 },
  "titans-30": { x: 0.51, y: 0.16 },
  "heros-1": { x: 0.6, y: 0.26 },
  "heros-2": { x: 0.55, y: 0.18 },
  "heros-3": { x: 0.46, y: 0.24 },
  "heros-4": { x: 0.52, y: 0.29 },
  "heros-5": { x: 0.55, y: 0.21 },
  "heros-6": { x: 0.55, y: 0.21 },
  "heros-8": { x: 0.58, y: 0.2 },
  "heros-9": { x: 0.58, y: 0.2 },
  "heros-10": { x: 0.58, y: 0.18 },
  "heros-11": { x: 0.55, y: 0.19 },
  "heros-12": { x: 0.53, y: 0.18 },
  "heros-13": { x: 0.56, y: 0.18 },
  "heros-14": { x: 0.57, y: 0.23 },
  "heros-15": { x: 0.55, y: 0.18 },
  "heros-16": { x: 0.5, y: 0.21 },
  "heros-17": { x: 0.55, y: 0.22 },
  "heros-18": { x: 0.51, y: 0.19 },
  "heros-19": { x: 0.53, y: 0.22 },
  "heros-20": { x: 0.48, y: 0.23 },
  "heros-21": { x: 0.52, y: 0.25 },
  "heros-22": { x: 0.54, y: 0.19 },
  "heros-23": { x: 0.55, y: 0.18 },
  "heros-24": { x: 0.54, y: 0.2 },
  "heros-25": { x: 0.54, y: 0.19 },
  "heros-26": { x: 0.55, y: 0.19 },
  "heros-27": { x: 0.55, y: 0.2 },
  "heros-28": { x: 0.55, y: 0.17 },
  "heros-29": { x: 0.55, y: 0.17 },
  "heros-30": { x: 0.52, y: 0.2 },
  "creatures-1": { x: 0.55, y: 0.15 },
  "creatures-2": { x: 0.55, y: 0.16 },
  "creatures-3": { x: 0.57, y: 0.17 },
  "creatures-4": { x: 0.59, y: 0.19 },
  "creatures-9": { x: 0.56, y: 0.24 },
  "creatures-10": { x: 0.49, y: 0.31 },
  "creatures-11": { x: 0.57, y: 0.23 },
  "creatures-12": { x: 0.55, y: 0.27 },
  "creatures-13": { x: 0.45, y: 0.27 },
  "creatures-14": { x: 0.6, y: 0.24 },
  "creatures-15": { x: 0.54, y: 0.24 },
  "creatures-16": { x: 0.54, y: 0.29 },
  "creatures-17": { x: 0.52, y: 0.37 },
  "creatures-18": { x: 0.54, y: 0.29 },
  "creatures-19": { x: 0.56, y: 0.22 },
  "creatures-20": { x: 0.57, y: 0.34 },
  "creatures-21": { x: 0.5, y: 0.23 },
  "creatures-22": { x: 0.52, y: 0.28 },
  "creatures-23": { x: 0.53, y: 0.28 },
  "creatures-24": { x: 0.51, y: 0.22 },
  "creatures-25": { x: 0.57, y: 0.22 },
  "creatures-26": { x: 0.55, y: 0.25 },
  "creatures-27": { x: 0.55, y: 0.2 },
  "creatures-28": { x: 0.56, y: 0.25 },
  "creatures-29": { x: 0.53, y: 0.26 },
  "creatures-30": { x: 0.55, y: 0.27 },
};
export function artworkLayout(
  cardId: string,
  rarity: number,
  cardWidth: number,
  sourceAspect = 5 / 7,
) {
  const aperture = FRAME_APERTURES[rarity];
  if (
    !aperture ||
    !Number.isFinite(cardWidth) ||
    cardWidth <= 0 ||
    !Number.isFinite(sourceAspect) ||
    sourceAspect <= 0
  )
    throw Error("Dimensions d’illustration invalides");
  const cardHeight = (cardWidth * 7) / 5;
  const viewport = {
    left: aperture.x * cardWidth,
    top: aperture.y * cardHeight,
    width: aperture.width * cardWidth,
    height: aperture.height * cardHeight,
  };
  const focus = ARTWORK_FOCUS[cardId] ?? { x: 0.5, y: 0.22 };
  // A restrained zoom provides enough horizontal travel to centre an off-axis subject.
  const zoom = Math.min(1.34, Math.max(1, 0.5 / focus.x, 0.5 / (1 - focus.x)));
  const width = Math.max(viewport.width, viewport.height * sourceAspect) * zoom;
  const height = width / sourceAspect;
  const clamp = (value: number, minimum: number) =>
    Math.max(minimum, Math.min(0, value));
  // Face in the upper third, painting centred horizontally; offsets may never reveal a gap.
  const left = clamp(
    viewport.width * 0.5 - width * focus.x,
    viewport.width - width,
  );
  const top = clamp(
    viewport.height * 0.32 - height * focus.y,
    viewport.height - height,
  );
  return { viewport, image: { width, height, left, top } };
}
