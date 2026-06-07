import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Rep, UserLocation } from "@/types";
import { resolveReps } from "@/services/reps";

const LOCATION_KEY = "khidr.location";

let cachedReps: Rep[] = [];

export async function getSavedLocation(): Promise<UserLocation | null> {
  const raw = await AsyncStorage.getItem(LOCATION_KEY);
  return raw ? (JSON.parse(raw) as UserLocation) : null;
}

/** Resolve the user's MP for a postcode and persist it. Called once at
 * onboarding (or when the user changes their postcode). */
export async function setLocation(postcode: string): Promise<Rep[]> {
  const reps = await resolveReps(postcode);
  cachedReps = reps;
  const loc: UserLocation = {
    postcode: postcode.trim().toUpperCase(),
    resolvedRepIds: reps.map((r) => r.id),
  };
  await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
  return reps;
}

/** The user's MP, resolved this session. Re-resolves from the saved postcode if empty. */
export async function getReps(): Promise<Rep[]> {
  if (cachedReps.length) return cachedReps;
  const loc = await getSavedLocation();
  if (!loc?.postcode) return [];
  cachedReps = await resolveReps(loc.postcode);
  return cachedReps;
}

export async function clearLocation(): Promise<void> {
  cachedReps = [];
  await AsyncStorage.removeItem(LOCATION_KEY);
}
