import { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, Pressable, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { theme } from "@/theme";
import type { FeedItem, Rep } from "@/types";
import feed from "@/data/sample-feed.json";
import { RepPicker } from "@/components/RepPicker";
import { generateDraft, hasBeenEdited } from "@/services/draft";

export default function EmailAction() {
  const { item: itemId } = useLocalSearchParams<{ item: string }>();
  const item = (feed as FeedItem[]).find((i) => i.id === itemId);
  const [rep, setRep] = useState<Rep | undefined>();
  const [draft, setDraft] = useState(""); // the AI's original draft
  const [body, setBody] = useState(""); // what the user is editing
  const next = `/action/email?item=${itemId}`;

  useEffect(() => {
    if (item && rep) {
      generateDraft(item, rep).then((d) => {
        setDraft(d);
        setBody(d);
      });
    }
  }, [item, rep?.id]);

  // ANTI-ASTROTURF: Send stays disabled until the user meaningfully edits.
  const edited = hasBeenEdited(draft, body);

  function send() {
    if (!rep || !edited) return;
    const subject = `Constituent message: ${item?.headline ?? "a story I'm following"}`;
    if (rep.email) {
      const url = `mailto:${rep.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      Linking.openURL(url).catch(() => Alert.alert("Couldn't open your mail app"));
    } else if (rep.writeToThemUrl) {
      // No public email: hand off to WriteToThem, the trusted UK channel.
      Alert.alert(
        "Send via WriteToThem",
        "We'll open WriteToThem, which delivers your message to your MP. Copy your text first, then paste it in.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open WriteToThem", onPress: () => WebBrowser.openBrowserAsync(rep.writeToThemUrl!) },
        ]
      );
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {item ? <Text style={styles.story}>{item.headline}</Text> : null}

      <RepPicker selectedId={rep?.id} onSelect={setRep} next={next} />

      <View style={styles.draftHeader}>
        <Text style={styles.draftLabel}>Your message, make it your own</Text>
      </View>
      <Text style={styles.helper}>
        This is a starting point, not a finished message. Make it yours: add a
        personal sentence and fill in the brackets. A message in your own words
        carries far more weight than a template.
      </Text>

      <TextInput
        style={styles.editor}
        value={body}
        onChangeText={setBody}
        multiline
        textAlignVertical="top"
      />

      <Pressable style={[styles.btn, !edited && styles.btnDisabled]} disabled={!edited} onPress={send}>
        <Text style={styles.btnText}>
          {!rep
            ? "Select a representative"
            : edited
            ? `Send to ${rep.name}`
            : "Edit the draft to enable sending"}
        </Text>
      </Pressable>
      <Text style={styles.note}>
        You send this from your own email — Khidr never sends on your behalf, and
        only ever to one office at a time.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.space(5), gap: theme.space(3) },
  story: { fontSize: 15, fontWeight: "700", color: theme.colors.text, lineHeight: 21 },
  draftHeader: { marginTop: theme.space(2) },
  draftLabel: { fontSize: 13, fontWeight: "800", color: theme.colors.accent, textTransform: "uppercase", letterSpacing: 1 },
  helper: { fontSize: 13, color: theme.colors.textMuted, lineHeight: 19 },
  editor: {
    minHeight: 220,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius,
    padding: theme.space(4),
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.text,
  },
  btn: { backgroundColor: theme.colors.bg, padding: theme.space(4), borderRadius: 12, alignItems: "center" },
  btnDisabled: { backgroundColor: theme.colors.textMuted },
  btnText: { color: theme.colors.onDark, fontWeight: "700", fontSize: 16 },
  note: { fontSize: 12, color: theme.colors.textMuted, lineHeight: 17 },
});
