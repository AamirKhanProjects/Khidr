import { useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, Pressable, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { theme } from "@/theme";
import type { FeedItem, Rep } from "@/types";
import feed from "@/data/sample-feed.json";
import { RepPicker } from "@/components/RepPicker";
import { Pulse } from "@/components/Motion";

export default function CallAction() {
  const { item: itemId } = useLocalSearchParams<{ item: string }>();
  const item = (feed as FeedItem[]).find((i) => i.id === itemId);
  const [rep, setRep] = useState<Rep | undefined>();
  const [called, setCalled] = useState(false);

  const next = `/action/call?item=${itemId}`;

  function dial() {
    const phone = rep?.phones[0];
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert("Couldn't open the dialer", phone)
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {item ? <Text style={styles.story}>{item.headline}</Text> : null}

      <RepPicker selectedId={rep?.id} onSelect={setRep} next={next} />

      {item?.callPoints?.length ? (
        <View style={styles.scriptBox}>
          <Text style={styles.scriptTitle}>Points you might raise</Text>
          <Text style={styles.scriptIntro}>
            "Hi, my name is ___ and I'm a constituent. I'm calling about{" "}
            {item.headline.toLowerCase()}."
          </Text>
          {item.callPoints.map((p, i) => (
            <Text key={i} style={styles.point}>
              • {p}
            </Text>
          ))}
          <Text style={styles.scriptOutro}>
            Be brief and polite. Ask them to share the member's position. Thank
            them for their time.
          </Text>
        </View>
      ) : null}

      <Pressable style={[styles.btn, !rep && styles.btnDisabled]} disabled={!rep} onPress={dial}>
        <Text style={styles.btnText}>
          {rep ? `Call ${rep.name}` : "Select a representative"}
        </Text>
      </Pressable>

      <Pressable
        style={[styles.logBtn, called && styles.logDone]}
        onPress={() => setCalled((c) => !c)}
      >
        <Pulse active={called}>
          <Text style={[styles.logText, called && styles.logTextDone]}>
            {called ? "Logged, thank you ✓" : "I made the call"}
          </Text>
        </Pulse>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.space(5), gap: theme.space(4) },
  story: { fontSize: 15, fontWeight: "700", color: theme.colors.text, lineHeight: 21 },
  scriptBox: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius,
    padding: theme.space(4),
    gap: theme.space(2),
  },
  scriptTitle: { fontSize: 13, fontWeight: "800", color: theme.colors.accent, textTransform: "uppercase", letterSpacing: 1 },
  scriptIntro: { fontSize: 15, fontStyle: "italic", color: theme.colors.text, lineHeight: 21 },
  point: { fontSize: 15, color: theme.colors.text, lineHeight: 22 },
  scriptOutro: { fontSize: 13, color: theme.colors.textMuted, lineHeight: 19, marginTop: theme.space(1) },
  btn: { backgroundColor: theme.colors.bg, padding: theme.space(4), borderRadius: 12, alignItems: "center" },
  btnDisabled: { backgroundColor: theme.colors.textMuted },
  btnText: { color: theme.colors.onDark, fontWeight: "700", fontSize: 16 },
  logBtn: { padding: theme.space(3), alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: theme.colors.line },
  logDone: { borderColor: theme.colors.bg, backgroundColor: "#E7F0EB" },
  logText: { color: theme.colors.textMuted, fontWeight: "700" },
  logTextDone: { color: theme.colors.bg },
});
