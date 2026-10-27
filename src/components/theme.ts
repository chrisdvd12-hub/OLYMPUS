import { StyleSheet } from "react-native";
export const theme = {
  ink: "#080f1e",
  gold: "#ddbd7b",
  muted: "#a9a698",
  paper: "#f2e5c5",
};
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.ink },
  body: { padding: 22, gap: 18 },
  title: {
    color: theme.gold,
    fontFamily: "serif",
    fontSize: 30,
    textAlign: "center",
    letterSpacing: 3,
  },
  subtitle: {
    color: theme.muted,
    textAlign: "center",
    letterSpacing: 3,
    fontSize: 11,
  },
  text: { color: theme.paper, fontSize: 15, lineHeight: 23 },
  muted: { color: theme.muted, fontSize: 12, textAlign: "center" },
  button: {
    backgroundColor: theme.gold,
    padding: 17,
    borderRadius: 4,
    alignItems: "center",
    minHeight: 52,
  },
  buttonText: {
    color: theme.ink,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 1,
  },
  outline: {
    borderWidth: 1,
    borderColor: "#695b3e",
    padding: 15,
    alignItems: "center",
    borderRadius: 4,
    minHeight: 48,
  },
  panel: {
    padding: 18,
    backgroundColor: "#121e30",
    borderWidth: 1,
    borderColor: "#574b33",
    borderRadius: 8,
    gap: 12,
  },
});
