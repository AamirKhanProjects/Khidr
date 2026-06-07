import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { bustFeedCache } from "@/lib/feed";

export const runtime = "nodejs";

// Live items (last 30 days) for the dashboard "Live now" list.
export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sb = supabaseAdmin();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await sb
    .from("published_items")
    .select("id, headline, source_name, published_at, topics")
    .gt("published_at", since)
    .order("published_at", { ascending: false });
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  return NextResponse.json({ items: data });
}

// Unpublish (hard delete — the 30-day window means we don't keep an archive).
export async function DELETE(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  const sb = supabaseAdmin();
  const { error } = await sb.from("published_items").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  bustFeedCache();
  return NextResponse.json({ ok: true });
}
