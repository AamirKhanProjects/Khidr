import { Text, View, Pressable, StyleSheet, type TextProps, type ViewStyle } from "react-native";
import { theme } from "@/theme";

export function Disp({ style, ...p }: TextProps) {
  return <Text {...p} style={[{ fontFamily: theme.font.disp, color: theme.colors.cream }, style]} />;
}
export function Body({ style, ...p }: TextProps) {
  return <Text {...p} style={[{ fontFamily: theme.font.body, color: theme.colors.cream }, style]} />;
}
export function Kicker({ children, color }: { children: React.ReactNode; color?: string }) {
  return <Text style={[styles.kicker, color ? { color } : null]}>{children}</Text>;
}
export function Rule({ style }: { style?: ViewStyle }) {
  return <View style={[{ height: 1, backgroundColor: theme.colors.line }, style]} />;
}
export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: disabled ? "rgba(169,204,199,0.22)" : theme.colors.aqua, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={[styles.btnText, { color: disabled ? "rgba(7,19,13,0.45)" : "#07130D" }]}>{label}</Text>
    </Pressable>
  );
}
export function LineButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.btnLine, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Text style={[styles.btnText, { color: theme.colors.cream }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontFamily: theme.font.bodySemi,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: theme.colors.aqua,
  },
  btn: { borderRadius: theme.radius, paddingVertical: 15, alignItems: "center" },
  btnLine: {
    borderRadius: theme.radius,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.lineStrong,
  },
  btnText: { fontFamily: theme.font.bodySemi, fontSize: 15, letterSpacing: 0.2 },
});
