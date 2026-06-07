import { useCallback, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { theme } from "@/theme";
import { Disp, Body, Kicker, Rule } from "@/components/ui";
import { getActions, getFollowed, type ActionLog } from "@/store/local";

export default function Impact() {
  const [actions, setActions] = useState<ActionLog[]>([]);
  const [followed, setFollowed] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setActions(await getActions());
        setFollowed(await getFollowed());
      })();
    }, [])
  );

  const calls = actions.filter((a) => a.type === "call").length;
  const emails = actions.filter((a) => a.type === "email").length;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 30 }}>
        <Disp style={{ fontSize: 28 }}>Your activity</Disp>
        <Body style={s.sub}>Everything here lives on this phone only. Nothing is uploaded.</Body>

        <View style={s.stats}>
          <Stat n={emails} label="Messages" />
          <Stat n={calls} label="Calls" />
          <Stat n={followed.length} label="Following" />
        </View>

        <Rule />
        <View style={{ marginTop: 18 }}>
          <Kicker>Recent</Kicker>
          {actions.length === 0 ? (
            <Body style={s.empty}>
              When you call or write your MP, it&apos;s logged here, on your device. Nothing leaves your phone.
            </Body>
          ) : (
            actions.slice(0, 20).map((a, i) => (
              <View key={i} style={s.actrow}>
                <Body style={s.acttype}>{a.type === "call" ? "Called your MP" : "Wrote to your MP"}</Body>
                <Body style={s.actdate}>{new Date(a.at).toLocaleDateString("en-GB")}</Body>
              </View>
            ))
          )}
        </View>

        <Body style={s.ondevice}>No account. No server-side history. If you change phones, this resets, by design.</Body>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <View style={s.stat}>
      <Disp style={s.statN}>{n}</Disp>
      <Body style={s.statL}>{label}</Body>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.ink },
  sub: { fontSize: 13.5, color: theme.colors.creamDim, fontStyle: "italic", marginTop: 8, lineHeight: 20 },
  stats: { flexDirection: "row", marginVertical: 22, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.line },
  stat: { flex: 1, paddingVertical: 20, alignItems: "center", borderRightWidth: 1, borderRightColor: theme.colors.line },
  statN: { fontSize: 32, color: theme.colors.cream },
  statL: { fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: theme.colors.creamFaint, marginTop: 8, fontFamily: theme.font.bodySemi },
  empty: { fontSize: 14, color: theme.colors.creamDim, lineHeight: 21, marginTop: 12 },
  actrow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: theme.colors.line },
  acttype: { fontSize: 14 },
  actdate: { fontSize: 12, color: theme.colors.creamFaint },
  ondevice: { fontSize: 11, color: theme.colors.creamFaint, fontStyle: "italic", textAlign: "center", marginTop: 26, lineHeight: 17 },
});
