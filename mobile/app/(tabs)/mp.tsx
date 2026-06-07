import { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Linking, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { theme } from "@/theme";
import { Disp, Body, Kicker, Rule, PrimaryButton, LineButton } from "@/components/ui";
import { getRep } from "@/store/local";
import { fetchMp } from "@/services/api";
import { logAction } from "@/store/local";
import type { Rep, MpEnrichment } from "@/types";

export default function MpScreen() {
  const [rep, setRep] = useState<Rep | null>(null);
  const [enr, setEnr] = useState<MpEnrichment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await getRep();
      setRep(r);
      if (r) setEnr(await fetchMp(r.id));
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <SafeAreaView style={s.safe}>
        <ActivityIndicator color={theme.colors.aqua} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );

  if (!rep)
    return (
      <SafeAreaView style={s.safe}>
        <View style={{ padding: 22 }}>
          <Body style={{ color: theme.colors.creamDim }}>No MP set yet.</Body>
        </View>
      </SafeAreaView>
    );

  const email = rep.email ?? enr?.email ?? null;
  const phone = rep.phones?.[0] ?? enr?.phone ?? null;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 30 }}>
        <Disp style={{ fontSize: 24 }}>{rep.name}</Disp>
        <Body style={s.sub}>
          {[rep.party, rep.constituency].filter(Boolean).join(" · ")}
        </Body>

        {enr?.committees?.length ? (
          <View style={{ marginTop: 18 }}>
            <Kicker>Committees</Kicker>
            <Body style={s.committee}>{enr.committees.join(" · ")}</Body>
            <Body style={s.prov}>From UK Parliament data · Committees API</Body>
          </View>
        ) : null}

        <Rule style={{ marginVertical: 20 }} />
        <Kicker color={theme.colors.creamFaint}>The record</Kicker>
        <Body style={s.scorenote}>
          A factual record of recorded votes, from the public Commons Votes data. No verdict, no score, just what was cast.
        </Body>
        {enr?.votes?.length ? (
          enr.votes.map((v, i) => (
            <View key={i} style={s.vote}>
              <View style={[s.flag, v.vote === "Aye" ? s.flagFor : v.vote === "No" ? s.flagAgainst : s.flagAbsent]}>
                <Body style={[s.flagText, { color: v.vote === "Aye" ? theme.colors.aqua : v.vote === "No" ? theme.colors.danger : theme.colors.creamFaint }]}>
                  {v.vote === "No vote" ? "No vote" : v.vote}
                </Body>
              </View>
              <View style={{ flex: 1 }}>
                <Body style={s.vt}>{v.title}</Body>
                <Body style={s.vd}>{v.date}</Body>
              </View>
            </View>
          ))
        ) : (
          <Body style={{ color: theme.colors.creamFaint, fontStyle: "italic", marginTop: 8 }}>No recent recorded votes found.</Body>
        )}

        <Rule style={{ marginVertical: 20 }} />
        <Kicker>Contact your MP</Kicker>
        <View style={{ gap: 10, marginTop: 12 }}>
          {email && (
            <PrimaryButton
              label="Email your MP"
              onPress={() => {
                logAction("email");
                Linking.openURL(`mailto:${email}`);
              }}
            />
          )}
          {rep.writeToThemUrl && (
            <LineButton label="Send via WriteToThem" onPress={() => WebBrowser.openBrowserAsync(rep.writeToThemUrl!)} />
          )}
          {phone && (
            <LineButton
              label="Call their office"
              onPress={() => {
                logAction("call");
                Linking.openURL(`tel:${phone}`);
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.ink },
  sub: { fontSize: 13, color: theme.colors.creamDim, marginTop: 6 },
  committee: { fontSize: 14, color: theme.colors.cream, marginTop: 8, lineHeight: 21 },
  prov: { fontSize: 10.5, color: theme.colors.creamFaint, fontStyle: "italic", marginTop: 8 },
  scorenote: { fontSize: 12, color: theme.colors.creamFaint, fontStyle: "italic", marginTop: 8, lineHeight: 18, marginBottom: 8 },
  vote: { flexDirection: "row", gap: 14, alignItems: "flex-start", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.line },
  flag: { borderRadius: 3, paddingVertical: 4, paddingHorizontal: 8, marginTop: 2 },
  flagFor: { backgroundColor: "rgba(169,204,199,0.16)" },
  flagAgainst: { backgroundColor: "rgba(217,138,130,0.16)" },
  flagAbsent: { backgroundColor: "rgba(232,224,205,0.1)" },
  flagText: { fontSize: 10, letterSpacing: 1, textTransform: "uppercase", fontFamily: theme.font.bodyBold },
  vt: { fontSize: 14, lineHeight: 19, marginBottom: 3 },
  vd: { fontSize: 11.5, color: theme.colors.creamFaint },
});
