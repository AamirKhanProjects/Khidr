import { useEffect, useState } from "react";
import { View, ScrollView, TextInput, Pressable, StyleSheet, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { theme } from "@/theme";
import { Disp, Body, Kicker, PrimaryButton } from "@/components/ui";
import { fetchFeed } from "@/services/api";
import { getRep, logAction } from "@/store/local";
import type { FeedItem, Rep } from "@/types";

const PLACEHOLDER = "[Add a line here in your own words: why this matters to you.]";

function buildDraft(rep: Rep | null, item: FeedItem | null): string {
  const name = rep?.name ?? "[your MP]";
  const where = rep?.constituency ? ` in ${rep.constituency}` : "";
  const about = item?.emailContext || item?.headline || "an issue I've been following";
  return [
    `Dear ${name},`,
    "",
    `I am a constituent${where}. I am writing about ${about}.`,
    "",
    PLACEHOLDER,
    "",
    "I would be grateful to know your position.",
    "",
    "Yours sincerely,",
    "[Your name]",
  ].join("\n");
}

export default function Write() {
  const { item: itemId } = useLocalSearchParams<{ item: string }>();
  const [item, setItem] = useState<FeedItem | null>(null);
  const [rep, setRep] = useState<Rep | null>(null);
  const [base, setBase] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    (async () => {
      const data = await fetchFeed();
      const found = [data.lead, ...data.items].find((i) => i && i.id === itemId) ?? null;
      const r = await getRep();
      setItem(found);
      setRep(r);
      const d = buildDraft(r, found);
      setBase(d);
      setBody(d);
    })();
  }, [itemId]);

  // Anti-astroturf nudge: must change the draft and remove the placeholder.
  const edited = body.trim() !== base.trim() && !body.includes("[Add a line here") && body.trim().length > 40;

  function send() {
    if (!edited) return;
    logAction("email", itemId);
    const subject = `Constituent message: ${item?.headline ?? "a story I'm following"}`;
    const email = rep?.email;
    if (email) {
      Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`).catch(
        () => Alert.alert("Couldn't open your mail app")
      );
    } else if (rep?.writeToThemUrl) {
      Alert.alert("No direct email", "We'll open WriteToThem, where you can send your message to your MP.", [
        { text: "Cancel", style: "cancel" },
        { text: "Open WriteToThem", onPress: () => WebBrowser.openBrowserAsync(rep.writeToThemUrl!) },
      ]);
    }
    router.back();
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.head}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Body style={{ color: theme.colors.creamDim, fontFamily: theme.font.bodySemi }}>Close</Body>
        </Pressable>
        <Disp style={{ fontSize: 19 }}>Email your MP</Disp>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 22 }} keyboardShouldPersistTaps="handled">
        {rep?.email ? <Body style={s.to}>To: {rep.name} · {rep.email}</Body> : null}
        <Kicker>Your message · make it your own</Kicker>
        <TextInput
          style={s.editor}
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
          placeholderTextColor={theme.colors.creamFaint}
        />
        <View style={{ marginTop: 14 }}>
          <PrimaryButton label={edited ? "Open my email to send" : "Add your own words to send"} onPress={send} disabled={!edited} />
        </View>
        <Body style={s.micro}>
          A message in your own voice lands as a real person; identical ones get filtered. Opens your own email app — Khidr never sends it.
        </Body>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.ink2 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 22, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.line },
  to: { fontSize: 12, color: theme.colors.creamFaint, fontStyle: "italic", marginBottom: 14 },
  editor: { minHeight: 240, backgroundColor: theme.colors.ink, borderWidth: 1, borderColor: theme.colors.lineStrong, borderRadius: theme.radius, padding: 14, color: theme.colors.cream, fontFamily: theme.font.body, fontSize: 15, lineHeight: 22, marginTop: 10 },
  micro: { fontSize: 12, color: theme.colors.creamFaint, fontStyle: "italic", lineHeight: 18, marginTop: 13 },
});
