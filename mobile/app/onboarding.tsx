import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { theme } from "@/theme";
import { setLocation } from "@/store/location";

/**
 * Collect address/ZIP ONCE, resolve reps, then continue to wherever the user was
 * headed (?next=...). Borrowed rep-lookup plumbing lives in services/reps.ts.
 */
export default function Onboarding() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!value.trim()) return;
    setLoading(true);
    try {
      await setLocation(value.trim());
      if (next) router.replace(next as never);
      else router.replace("/reps");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find your MP</Text>
      <Text style={styles.body}>
        Enter your postcode. Your MP is the one person who represents your area in
        Parliament. We use your postcode only to look them up, and it stays on your
        device.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Postcode (e.g. SW1A 1AA)"
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={setValue}
        autoCapitalize="characters"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
      <Pressable style={styles.btn} onPress={onSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={theme.colors.onDark} />
        ) : (
          <Text style={styles.btnText}>Find my MP</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.space(6), gap: theme.space(4) },
  title: { fontSize: 24, fontWeight: "800", color: theme.colors.text },
  body: { fontSize: 15, lineHeight: 22, color: theme.colors.textMuted },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: 12,
    padding: theme.space(4),
    fontSize: 16,
    backgroundColor: theme.colors.card,
    color: theme.colors.text,
  },
  btn: {
    backgroundColor: theme.colors.bg,
    padding: theme.space(4),
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: theme.colors.onDark, fontWeight: "700", fontSize: 16 },
});
