import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Rep } from "@/types";

// All user data lives on the device only. Nothing is uploaded.
const K = {
  postcode: "khidr.postcode",
  rep: "khidr.rep",
  topics: "khidr.topics",
  followed: "khidr.followed",
  actions: "khidr.actions",
};

export type ActionLog = { type: "call" | "email"; itemId?: string; at: string };

export async function saveSetup(postcode: string, rep: Rep, topics: string[]): Promise<void> {
  await AsyncStorage.multiSet([
    [K.postcode, postcode],
    [K.rep, JSON.stringify(rep)],
    [K.topics, JSON.stringify(topics)],
  ]);
}

export async function getRep(): Promise<Rep | null> {
  const raw = await AsyncStorage.getItem(K.rep);
  return raw ? (JSON.parse(raw) as Rep) : null;
}
export async function getPostcode(): Promise<string | null> {
  return AsyncStorage.getItem(K.postcode);
}
export async function getTopics(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(K.topics);
  return raw ? (JSON.parse(raw) as string[]) : [];
}
export async function isSetUp(): Promise<boolean> {
  return Boolean(await AsyncStorage.getItem(K.rep));
}
export async function clearSetup(): Promise<void> {
  await AsyncStorage.multiRemove([K.postcode, K.rep, K.topics]);
}

// follow a story
export async function getFollowed(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(K.followed);
  return raw ? (JSON.parse(raw) as string[]) : [];
}
export async function toggleFollow(id: string): Promise<boolean> {
  const cur = await getFollowed();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  await AsyncStorage.setItem(K.followed, JSON.stringify(next));
  return next.includes(id);
}

// activity log
export async function logAction(type: "call" | "email", itemId?: string): Promise<void> {
  const raw = await AsyncStorage.getItem(K.actions);
  const list: ActionLog[] = raw ? JSON.parse(raw) : [];
  list.unshift({ type, itemId, at: new Date().toISOString() });
  await AsyncStorage.setItem(K.actions, JSON.stringify(list.slice(0, 200)));
}
export async function getActions(): Promise<ActionLog[]> {
  const raw = await AsyncStorage.getItem(K.actions);
  return raw ? (JSON.parse(raw) as ActionLog[]) : [];
}
