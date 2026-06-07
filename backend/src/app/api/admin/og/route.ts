import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/session";
import { fetchOgPreview } from "@/lib/ssrf";
import { ogSchema } from "@/lib/validation";

export const runtime = "nodejs";

// Operator pastes a URL; we fetch it (SSRF-guarded) and return OG tags to
// pre-fill the compose panel. og:description is for OPERATOR READING ONLY and is
// never published or shown to end users.
export async function POST(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { url: string };
  try {
    body = ogSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const og = await fetchOgPreview(body.url);
    return NextResponse.json(og);
  } catch (e) {
    return NextResponse.json(
      { error: "fetch_failed", message: e instanceof Error ? e.message : "failed" },
      { status: 422 }
    );
  }
}
