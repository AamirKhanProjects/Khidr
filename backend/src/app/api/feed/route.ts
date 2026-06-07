import { NextResponse } from "next/server";
import { getFeed } from "@/lib/feed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // we manage caching via unstable_cache tags

// Public endpoint the mobile app reads. Whitelisted fields only (see feed.ts).
export async function GET() {
  try {
    const data = await getFeed();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({ error: "feed_unavailable" }, { status: 500 });
  }
}
