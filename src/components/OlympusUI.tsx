import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, { FadeIn, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import { useEffect } from "react";
import { AppText as Text } from "./AppText";
import { fonts, theme } from "./theme";

export type OlympusIconName =
  | "sanctuary" | "album" | "missions" | "achievements" | "profile"
  | "settings" | "drachma" | "cards" | "duplicates" | "booster"
  | "level" | "edit" | "check" | "lock" | "gift" | "search" | "laurel" | "previous" | "next";

const ICON_PATHS: Record<OlympusIconName, string[]> = {
  sanctuary: ["M4 20h16M6 18h12M7 8h10v10H7zM4 8h16L12 3 4 8zM9 10v6M12 10v6M15 10v6"],
  album: ["M4 4h6c1.1 0 2 .9 2 2v14c0-1.1-.9-2-2-2H4V4zM20 4h-6c-1.1 0-2 .9-2 2v14c0-1.1.9-2 2-2h6V4z"],
  missions: ["M7 3h10v3H7zM5 5h14v16H5zM8 10h8M8 14h8M8 18h5"],
  achievements: ["M8 3h8v3c0 3-1.6 5-4 5S8 9 8 6V3zM8 4H4v2c0 3 2 5 5 5M16 4h4v2c0 3-2 5-5 5M12 11v5M8 21h8M9 16h6v5H9z"],
  profile: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-7 8-7s8 3 8 7"],
  settings: ["M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"],
  drachma: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v10M9 9.5c0-1.4 1.3-2.5 3-2.5s3 1 3 2.5-1.3 2.5-3 2.5-3 1-3 2.5 1.3 2.5 3 2.5 3-1 3-2.5"],
  cards: ["M6 5h12v16H6zM3 3h12v2M9 8h6M9 11h6"],
  duplicates: ["M4 4h11v14H4zM9 8h11v13H9"],
  booster: ["M7 3h10l2 4-1 14H6L5 7l2-4zM6 8h12M7 18h10"],
  level: ["M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z"],
  edit: ["M4 20l4.5-1 10-10-3.5-3.5-10 10L4 20zM13.5 7l3.5 3.5"],
  check: ["M5 12.5l4.2 4.2L19 7"],
  lock: ["M7 10h10v10H7zM9 10V7a3 3 0 0 1 6 0v3"],
  gift: ["M4 10h16v11H4zM3 7h18v3H3zM12 7v14M12 7c-4 0-5-5-2-5 2 0 2 5 2 5zM12 7c4 0 5-5 2-5-2 0-2 5-2 5z"],
  search: ["M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15zM16 16l5 5"],
  laurel: ["M18 3c-7 2-11 8-11 16M8 15l-4-1M9 11l-3-2M11 8L9 5M13 6l1-3M7 18l-4 1"],
  previous: ["M15 5l-7 7 7 7"],
  next: ["M9 5l7 7-7 7"],
};

export function OlympusIcon({ name, size = 24, color = theme.gold, strokeWidth = 1.45 }: { name: OlympusIconName; size?: number; color?: string; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      {ICON_PATHS[name].map((d, index) => <Path key={index} d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />)}
    </Svg>
  );
}

export function OlympusMarblePanel({ children, style, entering = false }: { children: ReactNode; style?: StyleProp<ViewStyle>; entering?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <Animated.View entering={entering && !reduced ? FadeIn.duration(260) : undefined} style={[ui.panel, style]}>
      <View pointerEvents="none" style={ui.panelInset} />
      {children}
    </Animated.View>
  );
}

export function OlympusSectionTitle({ children }: { children: string }) {
  return (
    <View style={ui.heading}>
      <View style={ui.line} />
      <View style={ui.diamond} />
      <Text style={ui.headingText}>{children}</Text>
      <View style={ui.diamond} />
      <View style={ui.line} />
    </View>
  );
}

export function OlympusProgressBar({ value, max, color = theme.gold, reduced = false, accessibilityLabel }: { value: number; max: number; color?: string; reduced?: boolean; accessibilityLabel?: string }) {
  const systemReduced = useReducedMotion();
  const target = Math.min(1, Math.max(0, value / Math.max(1, max)));
  const progress = useSharedValue(target);
  useEffect(() => { progress.value = withTiming(target, { duration: reduced || systemReduced ? 0 : 520 }); }, [progress, reduced, systemReduced, target]);
  const fill = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={accessibilityLabel} accessibilityValue={{ min: 0, max, now: Math.min(value, max) }} style={ui.track}>
      <Animated.View style={[ui.fill, { backgroundColor: color }, fill]} />
    </View>
  );
}

export function OlympusGoldButton({ label, icon, onPress, disabled = false, secondary = false }: { label: string; icon?: OlympusIconName; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [ui.goldButton, secondary && ui.secondaryButton, disabled && ui.disabled, pressed && ui.pressed]}>
      {icon ? <OlympusIcon name={icon} size={19} color={secondary ? theme.highlight : theme.ink} strokeWidth={1.7} /> : null}
      <Text style={[ui.goldButtonText, secondary && { color: theme.highlight }]}>{label}</Text>
    </Pressable>
  );
}

export function OlympusStatCard({ value, label, icon, compact = false }: { value: number | string; label: string; icon: OlympusIconName; compact?: boolean }) {
  return (
    <OlympusMarblePanel style={[ui.stat, { width: compact ? "48%" : "23%" }]}>
      <View style={ui.iconSeal}><OlympusIcon name={icon} size={25} /></View>
      <Text style={ui.statValue}>{value}</Text>
      <Text style={ui.statLabel}>{label}</Text>
    </OlympusMarblePanel>
  );
}

export function OlympusBottomNavigation({ items, active, onSelect, compact = false }: { items: readonly (readonly [string, string, OlympusIconName])[]; active: string; onSelect: (id: string) => void; compact?: boolean }) {
  return (
    <View accessibilityRole="tablist" style={ui.navigation}>
      {items.map(([id, label, icon]) => {
        const selected = id === active;
        return (
          <Pressable key={id} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => onSelect(id)} style={({ pressed }) => [ui.navTab, selected && ui.navTabActive, pressed && ui.pressed]}>
            <OlympusIcon name={icon} size={compact ? 19 : 22} color={selected ? theme.highlight : theme.gold} strokeWidth={selected ? 1.8 : 1.35} />
            <Text numberOfLines={1} style={[ui.navLabel, { fontSize: compact ? 7 : 8 }, selected && { color: theme.highlight }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function OlympusLoadingScreen({ message }: { message: string }) {
  return (
    <View style={ui.loading}>
      <View style={ui.loadingSeal}><OlympusIcon name="sanctuary" size={38} color={theme.highlight} /></View>
      <Text style={ui.loadingTitle}>OLYMPUS</Text>
      <OlympusSectionTitle>LES PORTES DU SANCTUAIRE</OlympusSectionTitle>
      <Text style={ui.loadingMessage}>{message}</Text>
    </View>
  );
}

const ui = StyleSheet.create({
  panel: { position: "relative", overflow: "hidden", padding: 16, borderWidth: 1, borderColor: "#d6b66788", borderRadius: 9, backgroundColor: "#07182af0", gap: 11, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  panelInset: { position: "absolute", top: 3, right: 3, bottom: 3, left: 3, borderWidth: StyleSheet.hairlineWidth, borderColor: "#f1d78d3c", borderRadius: 7 },
  heading: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  line: { flex: 1, maxWidth: 80, height: StyleSheet.hairlineWidth, backgroundColor: theme.gold },
  diamond: { width: 5, height: 5, borderWidth: 1, borderColor: theme.gold, transform: [{ rotate: "45deg" }] },
  headingText: { color: theme.highlight, fontFamily: fonts.semibold, fontSize: 11, lineHeight: 17, letterSpacing: 0.8, textAlign: "center" },
  track: { height: 10, borderRadius: 6, borderWidth: 1, borderColor: "#7894ac66", padding: 1, backgroundColor: "#040c16", overflow: "hidden" },
  fill: { width: "100%", height: "100%", borderRadius: 5, transformOrigin: "left", shadowColor: "#fff", shadowOpacity: 0.5, shadowRadius: 5 },
  goldButton: { minHeight: 52, paddingHorizontal: 18, paddingVertical: 13, flexDirection: "row", gap: 9, alignItems: "center", justifyContent: "center", borderRadius: 7, borderWidth: 1, borderColor: "#f5dc9b", backgroundColor: theme.gold, shadowColor: theme.gold, shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  secondaryButton: { backgroundColor: "#0a1d32ed", borderColor: theme.line },
  disabled: { opacity: 0.45 },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.88 },
  goldButtonText: { color: theme.ink, fontFamily: fonts.bold, fontSize: 12, lineHeight: 18, letterSpacing: 0.7, textAlign: "center" },
  stat: { minHeight: 126, paddingHorizontal: 7, paddingVertical: 12, alignItems: "center", justifyContent: "center", gap: 5 },
  iconSeal: { width: 43, height: 43, borderRadius: 22, borderWidth: 1, borderColor: theme.line, backgroundColor: "#10243a", alignItems: "center", justifyContent: "center" },
  statValue: { color: theme.highlight, fontFamily: fonts.bold, fontSize: 21, lineHeight: 27 },
  statLabel: { color: theme.muted, fontFamily: fonts.semibold, fontSize: 8, lineHeight: 13, textAlign: "center", letterSpacing: 0.4 },
  navigation: { flexDirection: "row", padding: 4, borderWidth: 1, borderColor: theme.line, borderRadius: 11, backgroundColor: "#06111df2", shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: -3 } },
  navTab: { flex: 1, minWidth: 0, minHeight: 55, justifyContent: "center", alignItems: "center", gap: 2, borderRadius: 6 },
  navTabActive: { backgroundColor: "#d4af3730", borderWidth: 1, borderColor: "#d8b96d88", shadowColor: theme.gold, shadowOpacity: 0.2, shadowRadius: 8 },
  navLabel: { color: theme.muted, fontFamily: fonts.semibold, lineHeight: 12, letterSpacing: 0.1, textAlign: "center" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 28 },
  loadingSeal: { width: 78, height: 78, borderRadius: 39, borderWidth: 1, borderColor: theme.gold, backgroundColor: "#0b2037e8", alignItems: "center", justifyContent: "center", shadowColor: theme.gold, shadowOpacity: 0.35, shadowRadius: 14 },
  loadingTitle: { color: theme.highlight, fontFamily: fonts.bold, fontSize: 28, letterSpacing: 2.5 },
  loadingMessage: { color: theme.muted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 20, textAlign: "center" },
});

export const olympusUIStyles = ui;
