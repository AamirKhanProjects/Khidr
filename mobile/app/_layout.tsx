import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { LibreCaslonDisplay_400Regular } from "@expo-google-fonts/libre-caslon-display";
import {
  SourceSerif4_400Regular,
  SourceSerif4_500Medium,
  SourceSerif4_600SemiBold,
  SourceSerif4_700Bold,
} from "@expo-google-fonts/source-serif-4";
import { theme } from "@/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded] = useFonts({
    Caslon: LibreCaslonDisplay_400Regular,
    Serif: SourceSerif4_400Regular,
    SerifMed: SourceSerif4_500Medium,
    SerifSemi: SourceSerif4_600SemiBold,
    SerifBold: SourceSerif4_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 250,
          contentStyle: { backgroundColor: theme.colors.ink },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="item/[id]" />
        <Stack.Screen name="action/write" options={{ presentation: "modal" }} />
        <Stack.Screen name="action/call" options={{ presentation: "modal" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
