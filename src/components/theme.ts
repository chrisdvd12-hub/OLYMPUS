import { StyleSheet } from "react-native";
export const fonts = {
  regular: "CinzelRegular",
  semibold: "CinzelSemiBold",
  bold: "CinzelBold",
} as const;
export const theme = {
  ink: "#07121e",
  navy: "#0B1E3A",
  gold: "#D4AF37",
  highlight: "#f0d59d",
  muted: "#b9b6aa",
  paper: "#F5E6D0",
  line: "#c9a45155",
};
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.ink },
  body: { paddingHorizontal: 22, paddingVertical: 18, gap: 16, width: "100%", maxWidth: 620, alignSelf: "center" },
  title: {
    color: theme.highlight, fontFamily: fonts.bold, fontSize: 28,
    lineHeight: 38, textAlign: "center", letterSpacing: 1.8,
    textShadowColor: "#0009", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },
  subtitle: { color: theme.highlight, fontFamily: fonts.semibold, textAlign: "center", letterSpacing: 2, fontSize: 11, lineHeight: 18 },
  text: { color: theme.paper, fontFamily: fonts.regular, fontSize: 14, lineHeight: 24 },
  muted: { color: theme.muted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 20, textAlign: "center" },
  button: {
    backgroundColor: theme.gold, paddingHorizontal: 18, paddingVertical: 17, borderRadius: 6,
    borderWidth: 1, borderColor: "#f2d588", alignItems: "center", justifyContent: "center", minHeight: 56,
    shadowColor: "#d4af37", shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 4 },
  },
  buttonText: { color: theme.ink, fontFamily: fonts.bold, fontSize: 13, lineHeight: 21, letterSpacing: 0.7, textAlign: "center" },
  outline: {
    borderWidth: 1, borderColor: theme.line, backgroundColor: "#0b1e3acc", paddingHorizontal: 16,
    paddingVertical: 14, alignItems: "center", justifyContent: "center", borderRadius: 6, minHeight: 50,
  },
  panel: {
    padding: 18, backgroundColor: "#0a1729ed", borderWidth: 1, borderColor: theme.line,
    borderRadius: 10, gap: 12,
  },
  wallet: { borderWidth: 1, borderColor: theme.line, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#07121edb" },
  offering: { alignItems: "center", gap: 5, borderWidth: 1, borderColor: theme.line, borderRadius: 8, padding: 10, backgroundColor: "#0b1e3ae8", maxWidth: 200 },
  navigation: { flexDirection: "row", padding: 4, borderWidth: 1, borderColor: theme.line, borderRadius: 8, backgroundColor: "#07121ee6" },
  tab: { flex: 1, minHeight: 46, justifyContent: "center", alignItems: "center", borderRadius: 5 },
  activeTab: { backgroundColor: "#d4af3724", borderWidth: 1, borderColor: theme.line },
});
