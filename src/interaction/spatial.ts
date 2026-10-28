// Pure geometry shared by the UI worklets and deterministic interaction tests.
export function wrapIndex(value: number, count = 4): number {
  "worklet";
  return ((Math.round(value) % count) + count) % count;
}
export function normalizeDegrees(value: number): number {
  "worklet";
  return ((value % 360) + 360) % 360;
}
export function nearestWheelPosition(
  index: number,
  position: number,
  count = 4,
): number {
  "worklet";
  return index + Math.round((position - index) / count) * count;
}
export function wheelPose(
  index: number,
  position: number,
  radius: number,
  count = 4,
) {
  "worklet";
  const angle = (index - position) * ((2 * Math.PI) / count);
  const depth = Math.cos(angle);
  return {
    x: Math.sin(angle) * radius,
    y: (1 - depth) * 23,
    z: (depth - 1) * 100,
    scale: 0.58 + (depth + 1) * 0.21,
    opacity: 0.22 + (depth + 1) * 0.39,
    rotateY: -Math.sin(angle) * 58,
    zIndex: Math.round((depth + 1) * 100),
  };
}
export function cardOrientation(yaw: number, pitch: number) {
  "worklet";
  const normalized = normalizeDegrees(yaw);
  return {
    yaw,
    pitch: Math.max(-35, Math.min(35, pitch)),
    front: normalized <= 90 || normalized >= 270,
  };
}
export function projectedYaw(yaw: number, velocityX: number): number {
  "worklet";
  return yaw + Math.max(-100, Math.min(100, velocityX * 0.065));
}

export function materialResponse(
  yaw: number,
  pitch: number,
  shimmer = 0,
): number {
  "worklet";
  return (
    -190 +
    (Math.sin((yaw * Math.PI) / 180) + 1) * 145 +
    pitch * 2 +
    shimmer * 200
  );
}

export function wheelPositionFromDrag(
  anchor: number,
  translationX: number,
): number {
  "worklet";
  return anchor - translationX / 115;
}
