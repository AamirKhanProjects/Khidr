import { NextResponse, type NextRequest } from "next/server";
import { isAuthed } from "@/lib/session";
import { runAggregate } from "@/lib/aggregate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Authorised by EITHER the Vercel cron secret (Vercel sends
// `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET env is set) OR an
// admin session (the dashboard "Refresh" button). Nothing here auto-publishes.
function cronAuthed(req: NextRequest): boolean {
  const s = process.env.CRON_SECRET;
  return !!s && req.headers.get("authorization") === `Bearer ${s}`;
}

async function handle(req: NextRequest) {
  if (!cronAuthed(req) && !isAuthed()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const r = await runAggregate();
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    return NextResponse.json(
      { error: "aggregate_failed", message: e instanceof Error ? e.message : "failed" },
      { status: 500 }
    );
  }
}

export const GET = handle;
export const POST = handle;
