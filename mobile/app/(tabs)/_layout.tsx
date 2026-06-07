import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { theme } from "@/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.ink,
          borderTopColor: theme.colors.line,
          height: 66,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.aqua,
        tabBarInactiveTintColor: theme.colors.creamFaint,
        tabBarLabelStyle: { fontFamily: theme.font.bodySemi, fontSize: 10, letterSpacing: 0.4 },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{ title: "Today", tabBarIcon: ({ color }) => <Feather name="sunrise" size={20} color={color} /> }}
      />
      <Tabs.Screen
        name="feed"
        options={{ title: "Feed", tabBarIcon: ({ color }) => <Feather name="list" size={20} color={color} /> }}
      />
      <Tabs.Screen
        name="mp"
        options={{ title: "MP", tabBarIcon: ({ color }) => <Feather name="user" size={20} color={color} /> }}
      />
      <Tabs.Screen
        name="impact"
        options={{ title: "Impact", tabBarIcon: ({ color }) => <Feather name="bar-chart-2" size={20} color={color} /> }}
      />
    </Tabs>
  );
}
