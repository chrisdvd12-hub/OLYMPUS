import * as Haptics from "expo-haptics";
// Unsupported devices/silent modes never block an interaction.
export function selectionFeedback(enabled = true) {
  if (enabled) void Haptics.selectionAsync().catch(() => {});
}
export function discoveryFeedback(enabled = true) {
  if (enabled)
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
