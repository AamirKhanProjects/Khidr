import { useState } from "react";
import { View, TextInput, Pressable, ScrollView, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { theme } from "@/theme";
import { Disp, Body, PrimaryButton } from "@/components/ui";
import { resolveReps } from "@/services/reps";
import { saveSetup } from "@/store/local";

const TOPICS = ["Gaza", "Sudan", "Kashmir", "Civil rights", "Community safety"];
const TOTAL = 5;

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [postcode, setPostcode] = useState("");
  const [topics, setTopics] = useState<string[]>(["Gaza", "Civil rights"]);
  const [busy, setBusy] = useState(false);

  function toggle(t: string) {
    setTopics((c) => (c.includes(t) ? c.filter((x) => x !== t) : [...c, t]));
  }

  async function finish() {
    if (!postcode.trim()) {
      setStep(3);
      Alert.alert("Postcode needed", "Enter your postcode so we can find your MP.");
      return;
    }
    setBusy(true);
    try {
      const reps = await resolveReps(postcode.trim());
      if (!reps.length) throw new Error("No MP found");
      await saveSetup(postcode.trim().toUpperCase(), reps[0], topics);
      router.replace("/today");
    } catch {
      Alert.alert("Couldn't find your MP", "Check the postcode and try again.");
      setStep(3);
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (step < TOTAL - 1) setStep(step + 1);
    else finish();
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.wrap}>
        {/* progress */}
        <View style={s.prog}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <View key={i} style={[s.dot, i <= step && { backgroundColor: theme.colors.aqua }]} />
          ))}
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {step === 0 && (
            <>
              <Disp style={s.h1}>Khidr.</Disp>
              <Body style={s.sub}>Know what&apos;s happening. Reach the one person who represents you.</Body>
              <Body style={s.p}>A calm, independent newsfeed of what affects our communities, with a simple way to tell your MP what you think.</Body>
              <Body style={s.p}>Free. No account. Nothing to sign up for.</Body>
            </>
          )}
          {step === 1 && (
            <>
              <Disp style={s.h2}>How it works</Disp>
              <Step n="1" t="Read what affects you" p="A short daily brief and a fuller feed, written plainly. No jargon." />
              <Step n="2" t="Reach your MP" p="Your MP is the one person who represents your area in Parliament. We route you straight to them." />
              <Step n="3" t="You write it, you send it" p="By email, WriteToThem, or a call. In your own words. That is what gets read." />
            </>
          )}
          {step === 2 && (
            <>
              <Disp style={s.h2}>What we never do</Disp>
              <Step n="·" t="We never send for you" p="Every message leaves from your own email or phone. We only open the door." />
              <Step n="·" t="No account, ever" p="No sign-up, no login, no profile of you on any server." />
              <Step n="·" t="It stays on your phone" p="Your postcode and activity live on this device. Nothing is uploaded." />
            </>
          )}
          {step === 3 && (
            <>
              <Disp style={s.h2}>Find your MP</Disp>
              <Body style={s.sub}>We use your postcode only to look up who represents you. It is stored on your phone and sent nowhere else.</Body>
              <Body style={s.label}>Your postcode</Body>
              <TextInput
                style={s.input}
                placeholder="e.g. SW1A 1AA"
                placeholderTextColor={theme.colors.creamFaint}
                autoCapitalize="characters"
                value={postcode}
                onChangeText={setPostcode}
              />
            </>
          )}
          {step === 4 && (
            <>
              <Disp style={s.h2}>Pick your topics</Disp>
              <Body style={s.sub}>We&apos;ll prioritise these in your feed. Optional, change them anytime.</Body>
              <View style={s.chips}>
                {TOPICS.map((t) => {
                  const on = topics.includes(t);
                  return (
                    <Pressable key={t} onPress={() => toggle(t)} style={[s.chip, on && s.chipOn]}>
                      <Body style={[s.chipText, on && { color: "#07130D" }]}>{t}</Body>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>

        <View style={s.nav}>
          {step > 0 ? (
            <Pressable onPress={() => setStep(step - 1)} style={s.back}>
              <Body style={{ color: theme.colors.creamDim, fontFamily: theme.font.bodySemi }}>Back</Body>
            </Pressable>
          ) : (
            <View style={{ flex: 0 }} />
          )}
          <View style={{ flex: 1 }}>
            {busy ? (
              <View style={[s.busy]}>
                <ActivityIndicator color="#07130D" />
              </View>
            ) : (
              <PrimaryButton label={step === TOTAL - 1 ? "Enter Khidr" : "Next"} onPress={next} />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Step({ n, t, p }: { n: string; t: string; p: string }) {
  return (
    <View style={s.step}>
      <Disp style={s.stepN}>{n}</Disp>
      <View style={{ flex: 1 }}>
        <Body style={s.stepT}>{t}</Body>
        <Body style={s.stepP}>{p}</Body>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.ink },
  wrap: { flex: 1, padding: 26, paddingTop: 14 },
  prog: { flexDirection: "row", gap: 7, marginBottom: 26 },
  dot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: theme.colors.lineStrong },
  h1: { fontSize: 40 },
  h2: { fontSize: 28, marginBottom: 8 },
  sub: { fontSize: 14, color: theme.colors.creamDim, fontStyle: "italic", lineHeight: 22, marginBottom: 22, marginTop: 8 },
  p: { fontSize: 14, color: theme.colors.creamDim, lineHeight: 23, marginTop: 14 },
  step: { flexDirection: "row", gap: 14, marginTop: 20 },
  stepN: { fontSize: 21, color: theme.colors.aqua, width: 30 },
  stepT: { fontSize: 16, fontFamily: theme.font.bodySemi, marginBottom: 3 },
  stepP: { fontSize: 13, color: theme.colors.creamDim, lineHeight: 19 },
  label: { fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", color: theme.colors.creamFaint, fontFamily: theme.font.bodySemi, marginBottom: 9 },
  input: { borderWidth: 1, borderColor: theme.colors.lineStrong, borderRadius: theme.radius, padding: 14, color: theme.colors.cream, fontSize: 15, fontFamily: theme.font.body },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginTop: 6 },
  chip: { paddingVertical: 9, paddingHorizontal: 14, borderWidth: 1, borderColor: theme.colors.lineStrong, borderRadius: theme.radius },
  chipOn: { backgroundColor: theme.colors.aqua, borderColor: theme.colors.aqua },
  chipText: { fontSize: 13, color: theme.colors.creamDim },
  nav: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14 },
  back: { paddingHorizontal: 6, paddingVertical: 14 },
  busy: { backgroundColor: theme.colors.aqua, borderRadius: theme.radius, paddingVertical: 15, alignItems: "center" },
});
