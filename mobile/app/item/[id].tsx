import { ScrollView, StyleSheet, Text, Pressable, View } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { theme } from "@/theme";
import type { FeedItem } from "@/types";
import feed from "@/data/sample-feed.json";
import { FadeInView } from "@/components/Motion";

export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = (feed as FeedItem[]).find((i) => i.id === id);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.blurb}>Story not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <FadeInView style={{ gap: theme.space(3) }}>
        <Text style={styles.source}>{item.sourceName}</Text>
        <Text style={styles.headline}>{item.headline}</Text>
        <Text style={styles.blurb}>{item.blurb}</Text>

        {/* Always link OUT to the original (never republish). */}
        <Pressable
          style={styles.readOriginal}
          onPress={() => WebBrowser.openBrowserAsync(item.sourceUrl)}
        >
          <Text style={styles.readOriginalText}>Read the original ↗</Text>
        </Pressable>

        <View style={styles.divider} />

        <Text style={styles.actionLabel}>Make your voice heard</Text>
        <View style={styles.actions}>
          <Link href={`/action/email?item=${item.id}`} asChild>
            <Pressable style={[styles.btn, styles.btnPrimary]}>
              <Text style={styles.btnPrimaryText}>Email your MP</Text>
            </Pressable>
          </Link>
          <Link href={`/action/call?item=${item.id}`} asChild>
            <Pressable style={[styles.btn, styles.btnGhost]}>
              <Text style={styles.btnGhostText}>Call their office</Text>
            </Pressable>
          </Link>
        </View>
        <Text style={styles.note}>
          Your MP, one message at a time. You write and send every message yourself.
        </Text>
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.space(5), gap: theme.space(3) },
  source: { color: theme.colors.accent, fontWeight: "700", fontSize: 13 },
  headline: { color: theme.colors.text, fontSize: 22, fontWeight: "800", lineHeight: 29 },
  blurb: { color: theme.colors.text, fontSize: 16, lineHeight: 24 },
  readOriginal: { paddingVertical: theme.space(2) },
  readOriginalText: { color: theme.colors.bg, fontWeight: "700", fontSize: 15 },
  divider: { height: 1, backgroundColor: theme.colors.line, marginVertical: theme.space(2) },
  actionLabel: { color: theme.colors.textMuted, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 },
  actions: { gap: theme.space(2) },
  btn: { paddingVertical: theme.space(3.5), borderRadius: 12, alignItems: "center" },
  btnPrimary: { backgroundColor: theme.colors.bg },
  btnPrimaryText: { color: theme.colors.onDark, fontWeight: "700", fontSize: 16 },
  btnGhost: { borderWidth: 1, borderColor: theme.colors.bg },
  btnGhostText: { color: theme.colors.bg, fontWeight: "700", fontSize: 16 },
  note: { color: theme.colors.textMuted, fontSize: 12, lineHeight: 17 },
});
