import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { theme } from "@/theme";
import type { FeedItem } from "@/types";
import feed from "@/data/sample-feed.json";

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function Card({ item }: { item: FeedItem }) {
  return (
    <Link href={`/item/${item.id}`} asChild>
      <Pressable style={styles.card}>
        <View style={styles.metaRow}>
          <Text style={styles.source}>{item.sourceName}</Text>
          <Text style={styles.time}>{timeAgo(item.publishedAt)}</Text>
        </View>
        <Text style={styles.headline}>{item.headline}</Text>
        <Text style={styles.blurb} numberOfLines={3}>
          {item.blurb}
        </Text>
        <View style={styles.actions}>
          <Link href={`/action/call?item=${item.id}`} asChild>
            <Pressable style={[styles.btn, styles.btnPrimary]}>
              <Text style={styles.btnPrimaryText}>Call</Text>
            </Pressable>
          </Link>
          <Link href={`/action/email?item=${item.id}`} asChild>
            <Pressable style={[styles.btn, styles.btnGhost]}>
              <Text style={styles.btnGhostText}>Email</Text>
            </Pressable>
          </Link>
        </View>
      </Pressable>
    </Link>
  );
}

export default function Feed() {
  const items = useMemo(() => feed as FeedItem[], []);
  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      contentContainerStyle={{ padding: theme.space(4), gap: theme.space(3) }}
      ListHeaderComponent={
        <View style={{ gap: theme.space(2), marginBottom: theme.space(2) }}>
          <Text style={styles.tagline}>
            News that affects us — and the people who can act on it.
          </Text>
          <Link href="/reps" asChild>
            <Pressable>
              <Text style={styles.repsLink}>My representatives ›</Text>
            </Pressable>
          </Link>
        </View>
      }
      renderItem={({ item }) => <Card item={item} />}
    />
  );
}

const styles = StyleSheet.create({
  tagline: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginBottom: theme.space(2),
  },
  repsLink: { color: theme.colors.bg, fontWeight: "700", fontSize: 14 },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius,
    padding: theme.space(4),
    borderWidth: 1,
    borderColor: theme.colors.line,
    gap: theme.space(2),
  },
  metaRow: { flexDirection: "row", justifyContent: "space-between" },
  source: { color: theme.colors.accent, fontWeight: "700", fontSize: 12 },
  time: { color: theme.colors.textMuted, fontSize: 12 },
  headline: { color: theme.colors.text, fontSize: 17, fontWeight: "700", lineHeight: 23 },
  blurb: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: "row", gap: theme.space(2), marginTop: theme.space(2) },
  btn: {
    paddingVertical: theme.space(2.5),
    paddingHorizontal: theme.space(5),
    borderRadius: 10,
  },
  btnPrimary: { backgroundColor: theme.colors.bg },
  btnPrimaryText: { color: theme.colors.onDark, fontWeight: "700" },
  btnGhost: { borderWidth: 1, borderColor: theme.colors.bg },
  btnGhostText: { color: theme.colors.bg, fontWeight: "700" },
});
