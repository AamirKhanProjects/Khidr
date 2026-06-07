import { useEffect, useState } from "react";
import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { theme } from "@/theme";
import { Disp, Body, Kicker, PrimaryButton, LineButton } from "@/components/ui";
import { fetchFeed } from "@/services/api";
import { getRep, toggleFollow, getFollowed } from "@/store/local";
import type { FeedItem, Rep } from "@/types";

export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<FeedItem | null>(null);
  const [rep, setRep] = useState<Rep | null>(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await fetchFeed();
      const found = [data.lead, ...data.items].find((i) => i && i.id === id) ?? null;
      setItem(found);
      setRep(await getRep());
      setFollowing((await getFollowed()).includes(String(id)));
      setLoading(false);
    })();
  }, [id]);

  if (loading)
    return (
      <SafeAreaView style={s.safe}>
        <ActivityIndicator color={theme.colors.aqua} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  if (!item)
    return (
      <SafeAreaView style={s.safe}>
        <Back />
        <Body style={{ color: theme.colors.creamDim, padding: 22 }}>Story not found.</Body>
      </SafeAreaView>
    );

  function writeToThem() {
    if (rep?.writeToThemUrl) WebBrowser.openBrowserAsync(rep.writeToThemUrl);
    else Alert.alert("WriteToThem", "Set up your MP first to use WriteToThem.");
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <Back />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={{ paddingHorizontal: 22 }}>
          {item.topics?.length ? <Kicker>{item.topics.join(" / ")}</Kicker> : null}
          <Disp style={s.h1}>{item.headline}</Disp>
          <Body style={s.src}>{item.sourceName}</Body>
          <Body style={s.blurb}>{item.blurb}</Body>
          <Pressable onPress={() => WebBrowser.openBrowserAsync(item.sourceUrl)} accessibilityRole="link">
            <Body style={s.readorig}>Read the original ↗</Body>
          </Pressable>
          {item.billId ? <Body style={s.attach}>Attached bill: {item.billId} (UK Bills API)</Body> : null}
          <Pressable
            onPress={async () => setFollowing(await toggleFollow(String(id)))}
            style={s.followBtn}
            accessibilityRole="button"
          >
            <Body style={{ color: theme.colors.aqua, fontFamily: theme.font.bodySemi, fontSize: 13 }}>
              {following ? "✓ Following — you'll get the outcome" : "Follow this story"}
            </Body>
          </Pressable>
        </View>

        <View style={s.tray}>
          <Kicker>Take action · contact your MP</Kicker>
          <View style={{ gap: 10, marginTop: 13 }}>
            <PrimaryButton label="Email your MP" onPress={() => router.push(`/action/write?item=${item.id}`)} />
            <LineButton label="Send via WriteToThem" onPress={writeToThem} />
            <LineButton label="Call their office" onPress={() => router.push(`/action/call?item=${item.id}`)} />
          </View>
          <Body style={s.micro}>
            You write and send every message yourself. Khidr never sends on your behalf, and nothing is stored.
          </Body>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Back() {
  return (
    <Pressable onPress={() => router.back()} style={s.back} accessibilityRole="button" accessibilityLabel="Back">
      <Body style={{ color: theme.colors.aqua, fontFamily: theme.font.bodySemi }}>‹ Back</Body>
    </Pressable>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.ink },
  back: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 6 },
  h1: { fontSize: 26, lineHeight: 31, marginTop: 11 },
  src: { fontSize: 12.5, color: theme.colors.creamDim, fontStyle: "italic", marginTop: 10, marginBottom: 14 },
  blurb: { fontSize: 15.5, color: theme.colors.cream, opacity: 0.92, lineHeight: 25, marginBottom: 14 },
  readorig: { fontSize: 14, color: theme.colors.aqua, fontFamily: theme.font.bodySemi },
  attach: { fontSize: 11, color: theme.colors.creamFaint, fontStyle: "italic", marginTop: 12 },
  followBtn: { marginTop: 16, paddingVertical: 4 },
  tray: { backgroundColor: theme.colors.tray, padding: 22, marginTop: 22, borderTopWidth: 1, borderTopColor: theme.colors.lineStrong },
  micro: { fontSize: 12, color: theme.colors.creamFaint, fontStyle: "italic", lineHeight: 18, marginTop: 14 },
});
