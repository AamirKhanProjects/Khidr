import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthed } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// The ranked candidate queue (operator-only). raw_summary IS included here because
// this route is admin-gated and used as a reading aid — it is never on a public route.
export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("candidates")
    .select("id, headline, source_name, source_url, raw_summary, matched_topics, score, seen_at")
    .eq("dismissed", false)
    .is("promoted_item", null)
    .order("score", { ascending: false })
    .limit(60);
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  return NextResponse.json({ candidates: data });
}

const actionSchema = z.object({ id: z.string().uuid(), action: z.enum(["dismiss"]) });

export async function POST(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: z.infer<typeof actionSchema>;
  try {
    body = actionSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const sb = supabaseAdmin();
  const { error } = await sb.from("candidates").update({ dismissed: true }).eq("id", body.id);
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
