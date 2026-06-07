import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { theme } from "@/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.bg },
          headerTintColor: theme.colors.onDark,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: "#F4F7F5" },
          // Smooth fade between screens (opening a story, going to call/write).
          animation: "fade",
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="index" options={{ title: "Khidr" }} />
        <Stack.Screen name="onboarding" options={{ title: "Find your MP" }} />
        <Stack.Screen name="reps" options={{ title: "Your MP" }} />
        <Stack.Screen name="item/[id]" options={{ title: "Story" }} />
        <Stack.Screen name="action/call" options={{ title: "Call" }} />
        <Stack.Screen name="action/email" options={{ title: "Write" }} />
      </Stack>
    </>
  );
}
