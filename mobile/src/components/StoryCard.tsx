import { Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { theme } from "@/theme";
import { Disp, Body } from "./ui";
import type { FeedItem } from "@/types";

export function StoryCard({ item, big }: { item: FeedItem; big?: boolean }) {
  return (
    <Pressable
      onPress={() => router.push(`/item/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={item.headline}
      style={({ pressed }) => [s.row, pressed && { backgroundColor: theme.colors.ink2 }]}
    >
      {item.topics?.length ? (
        <Body style={s.kicker}>{item.topics.slice(0, 2).join(" / ")}</Body>
      ) : null}
      <Disp style={[s.h, big && { fontSize: 24 }]}>{item.headline}</Disp>
      <Body style={s.src}>{item.sourceName}</Body>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: { paddingVertical: 19, borderBottomWidth: 1, borderBottomColor: theme.colors.line },
  kicker: {
    fontFamily: theme.font.bodySemi,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: theme.colors.aqua,
    marginBottom: 8,
  },
  h: { fontSize: 19, lineHeight: 24, marginBottom: 8 },
  src: { fontSize: 12, color: theme.colors.creamDim, fontStyle: "italic" },
});
