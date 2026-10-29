import * as Haptics from "expo-haptics";
let feedbackEnabled = true;
export function setFeedbackEnabled(enabled: boolean) {
  feedbackEnabled = enabled;
}
// Unsupported devices/silent modes never block an interaction.
export function selectionFeedback(enabled = true) {
  if (enabled && feedbackEnabled) void Haptics.selectionAsync().catch(() => {});
}
export function discoveryFeedback(enabled = true) {
  if (enabled && feedbackEnabled)
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
