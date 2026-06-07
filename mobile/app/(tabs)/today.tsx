import { useCallback, useEffect, useState } from "react";
import { ScrollView, View, RefreshControl, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/theme";
import { Disp, Body, Kicker, Rule } from "@/components/ui";
import { StoryCard } from "@/components/StoryCard";
import { fetchFeed } from "@/services/api";
import type { FeedResponse } from "@/types";

export default function Today() {
  const [data, setData] = useState<FeedResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setData(await fetchFeed());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.head}>
        <Disp style={s.word}>Khidr.</Disp>
        <Body style={s.strap}>Today</Body>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 22 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.aqua} />}
      >
        {!data ? (
          <ActivityIndicator color={theme.colors.aqua} style={{ marginTop: 40 }} />
        ) : !data.lead ? (
          <View style={{ paddingTop: 30 }}>
            <Kicker>A quiet day</Kicker>
            <Disp style={{ fontSize: 22, marginTop: 10, lineHeight: 28 }}>Nothing new today.</Disp>
            <Body style={s.quiet}>Yesterday&apos;s stories are still in the Feed. We surface a handful of things well, not a firehose.</Body>
          </View>
        ) : (
          <>
            <Kicker>The lead</Kicker>
            <View style={{ marginTop: 8 }}>
              <StoryCard item={data.lead} big />
            </View>
            <Body style={s.blurb}>{data.lead.blurb}</Body>
            {data.items.length > 1 && (
              <>
                <Rule style={{ marginVertical: 18 }} />
                <Kicker color={theme.colors.creamFaint}>Also recent</Kicker>
                <View style={{ marginTop: 4 }}>
                  {data.items.slice(1, 5).map((it) => (
                    <StoryCard key={it.id} item={it} />
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.ink },
  head: { paddingHorizontal: 22, paddingTop: 6, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.line },
  word: { fontSize: 28 },
  strap: { fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: theme.colors.creamFaint, fontFamily: theme.font.bodySemi, marginTop: 6 },
  blurb: { fontSize: 15, color: theme.colors.creamDim, lineHeight: 23, marginTop: 14 },
  quiet: { fontSize: 14, color: theme.colors.creamDim, lineHeight: 22, marginTop: 12 },
});
