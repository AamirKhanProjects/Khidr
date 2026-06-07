import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "@/config";
import type { FeedResponse, MpEnrichment } from "@/types";

const FEED_CACHE = "khidr.feedCache";

/** Fetch the live feed; cache it; fall back to last-cached when offline. */
export async function fetchFeed(): Promise<FeedResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/feed`, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as FeedResponse;
    await AsyncStorage.setItem(FEED_CACHE, JSON.stringify(data));
    return data;
  } catch {
    const cached = await AsyncStorage.getItem(FEED_CACHE);
    if (cached) return JSON.parse(cached) as FeedResponse;
    return { lead: null, items: [] };
  }
}

/** Non-personal MP enrichment (votes, committees). Best-effort. */
export async function fetchMp(id: string): Promise<MpEnrichment | null> {
  try {
    const res = await fetch(`${API_BASE}/api/mp/${encodeURIComponent(id)}`, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as MpEnrichment;
  } catch {
    return null;
  }
}
