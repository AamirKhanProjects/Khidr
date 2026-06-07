import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  verifyPassword,
  createSessionToken,
  cookieOptions,
  rateLimitLogin,
  SESSION_COOKIE,
} from "@/lib/auth";

export const runtime = "nodejs";

const schema = z.object({ password: z.string().min(1).max(200) });

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimitLogin(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "too_many_attempts" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 900) } }
    );
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (!verifyPassword(body.password)) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(), cookieOptions());
  return res;
}
