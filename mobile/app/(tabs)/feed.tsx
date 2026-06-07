import { useCallback, useEffect, useMemo, useState } from "react";
import { View, ScrollView, Pressable, RefreshControl, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/theme";
import { Disp, Body } from "@/components/ui";
import { StoryCard } from "@/components/StoryCard";
import { fetchFeed } from "@/services/api";
import type { FeedItem } from "@/types";

export default function Feed() {
  const [items, setItems] = useState<FeedItem[] | null>(null);
  const [active, setActive] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await fetchFeed();
    setItems(data.items);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tabs = useMemo(() => {
    const set = new Set<string>();
    (items ?? []).forEach((i) => i.topics.forEach((t) => set.add(t)));
    return ["All", ...Array.from(set).slice(0, 8)];
  }, [items]);

  const shown = (items ?? []).filter((i) => active === "All" || i.topics.includes(active));

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.head}>
        <Disp style={s.word}>Feed</Disp>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabs} contentContainerStyle={{ paddingHorizontal: 22, gap: 20 }}>
        {tabs.map((t) => (
          <Pressable key={t} onPress={() => setActive(t)} style={[s.tab, active === t && s.tabOn]}>
            <Body style={[s.tabText, active === t && { color: theme.colors.cream }]}>{t}</Body>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
            tintColor={theme.colors.aqua}
          />
        }
      >
        {!items ? (
          <ActivityIndicator color={theme.colors.aqua} style={{ marginTop: 40 }} />
        ) : shown.length === 0 ? (
          <Body style={{ color: theme.colors.creamDim, marginTop: 30 }}>Nothing here yet.</Body>
        ) : (
          shown.map((it) => <StoryCard key={it.id} item={it} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.ink },
  head: { paddingHorizontal: 22, paddingTop: 6, paddingBottom: 6 },
  word: { fontSize: 26 },
  tabs: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: theme.colors.line },
  tab: { paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabOn: { borderBottomColor: theme.colors.aqua },
  tabText: { fontSize: 13.5, color: theme.colors.creamDim, fontFamily: theme.font.bodySemi },
});
