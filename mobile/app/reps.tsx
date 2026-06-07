import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, Pressable, View } from "react-native";
import { router } from "expo-router";
import { theme } from "@/theme";
import type { Rep } from "@/types";
import { getReps, clearLocation } from "@/store/location";

export default function Reps() {
  const [reps, setReps] = useState<Rep[] | null>(null);

  useEffect(() => {
    getReps().then((r) => {
      if (!r.length) router.replace("/onboarding?next=/reps");
      else setReps(r);
    });
  }, []);

  if (!reps) return <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.bg} />;

  return (
    <View style={styles.container}>
      {reps.map((r) => (
        <View key={r.id} style={styles.row}>
          <Text style={styles.name}>{r.name}</Text>
          <Text style={styles.office}>
            {r.office}
            {r.constituency ? ` / ${r.constituency}` : ""}
          </Text>
        </View>
      ))}
      <Pressable
        style={styles.change}
        onPress={async () => {
          await clearLocation();
          router.replace("/onboarding?next=/reps");
        }}
      >
        <Text style={styles.changeText}>Change my postcode</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.space(5), gap: theme.space(3) },
  row: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius,
    padding: theme.space(4),
    gap: theme.space(1),
  },
  name: { fontSize: 17, fontWeight: "700", color: theme.colors.text },
  office: { fontSize: 13, color: theme.colors.textMuted },
  change: { padding: theme.space(3), alignItems: "center" },
  changeText: { color: theme.colors.bg, fontWeight: "700" },
});
