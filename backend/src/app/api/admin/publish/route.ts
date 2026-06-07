import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { publishSchema } from "@/lib/validation";
import { bustFeedCache } from "@/lib/feed";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let input;
  try {
    input = publishSchema.parse(await req.json());
  } catch (e) {
    const issues =
      e && typeof e === "object" && "errors" in e ? (e as { errors: unknown }).errors : null;
    return NextResponse.json({ error: "validation", issues }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("published_items")
    .insert({
      headline: input.headline,
      blurb: input.blurb,
      source_name: input.sourceName,
      source_url: input.sourceUrl,
      topics: input.topics,
      bill_id: input.billId || null,
      call_points: input.callPoints,
      email_context: input.emailContext || null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: "db", message: error.message }, { status: 500 });

  bustFeedCache();
  return NextResponse.json({ ok: true, id: data.id });
}
