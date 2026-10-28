import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { theme } from "../src/components/theme";
export default function Layout() {
  const [loaded, error] = useFonts({
    CinzelRegular: require("../assets/fonts/Cinzel-Regular.ttf"),
    CinzelSemiBold: require("../assets/fonts/Cinzel-SemiBold.ttf"),
    CinzelBold: require("../assets/fonts/Cinzel-Bold.ttf"),
  });
  if (!loaded && !error)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.ink,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator
          color={theme.gold}
          accessibilityLabel="Chargement du sanctuaire"
        />
      </View>
    );
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.ink },
        }}
      />
    </GestureHandlerRootView>
  );
}
