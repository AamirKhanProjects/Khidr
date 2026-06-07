import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { theme } from "@/theme";
import type { Rep } from "@/types";
import { getReps } from "@/store/location";

/**
 * Lets the user pick ONE representative. Anti-batch by design: there is no
 * "select all". If no reps are resolved yet, routes to onboarding and returns.
 */
export function RepPicker({
  selectedId,
  onSelect,
  next,
}: {
  selectedId?: string;
  onSelect: (rep: Rep) => void;
  next: string;
}) {
  const [reps, setReps] = useState<Rep[] | null>(null);

  useEffect(() => {
    getReps().then((r) => {
      if (!r.length) router.replace(`/onboarding?next=${encodeURIComponent(next)}`);
      else {
        setReps(r);
        if (!selectedId && r[0]) onSelect(r[0]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!reps) return <ActivityIndicator color={theme.colors.bg} />;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Choose one representative</Text>
      {reps.map((r) => {
        const active = r.id === selectedId;
        return (
          <Pressable
            key={r.id}
            style={[styles.row, active && styles.rowActive]}
            onPress={() => onSelect(r)}
          >
            <View style={styles.radio}>{active ? <View style={styles.dot} /> : null}</View>
            <View>
              <Text style={styles.name}>{r.name}</Text>
              <Text style={styles.office}>{r.office}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.space(2) },
  label: { color: theme.colors.textMuted, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space(3),
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: 12,
    padding: theme.space(3.5),
  },
  rowActive: { borderColor: theme.colors.bg, borderWidth: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.bg },
  name: { fontSize: 16, fontWeight: "700", color: theme.colors.text },
  office: { fontSize: 12, color: theme.colors.textMuted },
});
