import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { isSetUp } from "@/store/local";
import { theme } from "@/theme";

// Entry: send the user to onboarding or the app depending on whether they've set up.
export default function Index() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const ready = await isSetUp();
      router.replace(ready ? "/today" : "/onboarding");
      setChecked(true);
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.ink, alignItems: "center", justifyContent: "center" }}>
      {!checked && <ActivityIndicator color={theme.colors.aqua} />}
    </View>
  );
}
