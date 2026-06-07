import { useEffect, useState } from "react";
import { View, ScrollView, Pressable, StyleSheet, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { theme } from "@/theme";
import { Disp, Body, Kicker, PrimaryButton } from "@/components/ui";
import { fetchFeed } from "@/services/api";
import { getRep, logAction } from "@/store/local";
import type { FeedItem, Rep } from "@/types";

export default function Call() {
  const { item: itemId } = useLocalSearchParams<{ item: string }>();
  const [item, setItem] = useState<FeedItem | null>(null);
  const [rep, setRep] = useState<Rep | null>(null);
  const [called, setCalled] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await fetchFeed();
      setItem([data.lead, ...data.items].find((i) => i && i.id === itemId) ?? null);
      setRep(await getRep());
    })();
  }, [itemId]);

  const phone = rep?.phones?.[0] ?? null;

  function dial() {
    if (!phone) {
      Alert.alert("No phone number", "We don't have an office number for your MP.");
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert("Couldn't open the dialer", phone));
  }

  const points = item?.callPoints?.length
    ? item.callPoints
    : ["Ask where your MP stands on this", "Say briefly why it matters to you", "Ask them to act or speak on it"];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.head}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Body style={{ color: theme.colors.creamDim, fontFamily: theme.font.bodySemi }}>Close</Body>
        </Pressable>
        <Disp style={{ fontSize: 19 }}>Call their office</Disp>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 22 }}>
        {rep ? (
          <Body style={s.mp}>
            {rep.name}
            {rep.constituency ? ` · ${rep.constituency}` : ""}
          </Body>
        ) : null}

        <View style={s.expect}>
          <Kicker>What to expect</Kicker>
          <Body style={s.expectP}>
            A staffer usually answers and notes your name, postcode and view. It takes a minute. After hours you can leave the same as a voicemail.
          </Body>
        </View>

        <Kicker color={theme.colors.creamFaint}>Points you might raise</Kicker>
        <View style={{ marginTop: 10 }}>
          {points.map((p, i) => (
            <View key={i} style={s.point}>
              <Disp style={s.pn}>{i + 1}</Disp>
              <Body style={s.pp}>{p}</Body>
            </View>
          ))}
        </View>

        {phone ? <Disp style={s.number}>{phone}</Disp> : null}

        <View style={{ marginTop: 14 }}>
          <PrimaryButton label="Tap to call" onPress={dial} />
        </View>

        <Pressable
          onPress={() => {
            if (!called) logAction("call", itemId);
            setCalled((c) => !c);
          }}
          style={[s.log, called && s.logOn]}
          accessibilityRole="button"
        >
          <Body style={{ color: called ? theme.colors.aqua : theme.colors.creamDim, fontFamily: theme.font.bodySemi }}>
            {called ? "Logged on this phone ✓" : "I made the call"}
          </Body>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.ink2 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 22, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.line },
  mp: { fontSize: 14, fontFamily: theme.font.bodySemi, marginBottom: 16 },
  expect: { backgroundColor: theme.colors.tray, borderRadius: theme.radius, padding: 14, marginBottom: 18 },
  expectP: { fontSize: 12.5, color: theme.colors.creamDim, lineHeight: 19, marginTop: 8 },
  point: { flexDirection: "row", gap: 11, alignItems: "flex-start", paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: theme.colors.line },
  pn: { fontSize: 15, color: theme.colors.aquaDeep, width: 18 },
  pp: { fontSize: 14, color: theme.colors.cream, flex: 1, lineHeight: 20 },
  number: { fontSize: 22, color: theme.colors.cream, textAlign: "center", marginTop: 18, letterSpacing: 0.5 },
  log: { marginTop: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: theme.colors.line, borderRadius: theme.radius },
  logOn: { borderColor: theme.colors.aquaDeep },
});
