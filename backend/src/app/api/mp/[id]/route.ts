import { NextResponse } from "next/server";
import { getMpEnrichment } from "@/lib/mp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public, non-personal MP enrichment by Members API id. The postcode never
// reaches this endpoint — the app resolves postcode -> id on-device first.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!/^\d{1,8}$/.test(id)) {
    return NextResponse.json({ error: "bad_id" }, { status: 400 });
  }
  try {
    const data = await getMpEnrichment(id);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    });
  } catch {
    return NextResponse.json({ error: "enrichment_unavailable" }, { status: 502 });
  }
}
