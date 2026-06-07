import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import { supabaseAdmin } from "./supabase";

export const FEED_TAG = "feed";

/** Public shape returned to the mobile app. Whitelisted fields only. */
export type PublicItem = {
  id: string;
  headline: string;
  blurb: string;
  sourceName: string;
  sourceUrl: string;
  topics: string[];
  publishedAt: string;
  billId: string | null;
  callPoints: string[];
  emailContext: string | null;
};

export type FeedResponse = {
  lead: PublicItem | null; // Today = newest published item
  items: PublicItem[]; // last 30 days, newest first
};

const THIRTY_DAYS = "30 days";

async function readFeed(): Promise<FeedResponse> {
  const sb = supabaseAdmin();
  const sinceIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await sb
    .from("published_items")
    .select(
      "id, headline, blurb, source_name, source_url, topics, published_at, bill_id, call_points, email_context"
    )
    .gt("published_at", sinceIso)
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);

  const items: PublicItem[] = (data ?? []).map((r) => ({
    id: r.id,
    headline: r.headline,
    blurb: r.blurb,
    sourceName: r.source_name,
    sourceUrl: r.source_url,
    topics: r.topics ?? [],
    publishedAt: r.published_at,
    billId: r.bill_id ?? null,
    callPoints: r.call_points ?? [],
    emailContext: r.email_context ?? null,
  }));

  return { lead: items[0] ?? null, items };
}

/** Cached feed read, tagged so publish/unpublish can bust it instantly. */
export const getFeed = unstable_cache(readFeed, ["khidr-feed"], {
  tags: [FEED_TAG],
  revalidate: 300, // 5-min backstop
});

export function bustFeedCache() {
  revalidateTag(FEED_TAG);
}

// Note: THIRTY_DAYS kept for documentation of the window; logic uses sinceIso.
void THIRTY_DAYS;
