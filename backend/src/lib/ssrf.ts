import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * SSRF-guarded fetch of an HTML page, for parsing Open Graph tags on operator-
 * pasted URLs. Only the trusted operator triggers this, but we still harden it:
 * https/http only, resolve the host and reject private/reserved IPs, cap time
 * and size, require an HTML content-type.
 *
 * (There is a small TOCTOU gap between DNS check and fetch; acceptable for a
 * single trusted operator. A fuller fix would pin the resolved IP.)
 */

const TIMEOUT_MS = 5000;
const MAX_BYTES = 2 * 1024 * 1024; // 2MB

function ipIsPrivate(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const p = ip.split(".").map(Number);
    if (p[0] === 10) return true;
    if (p[0] === 127) return true;
    if (p[0] === 0) return true;
    if (p[0] === 169 && p[1] === 254) return true; // link-local / cloud metadata
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
    if (p[0] === 192 && p[1] === 168) return true;
    if (p[0] === 100 && p[1] >= 64 && p[1] <= 127) return true; // CGNAT
    if (p[0] >= 224) return true; // multicast / reserved
    return false;
  }
  if (v === 6) {
    const l = ip.toLowerCase();
    if (l === "::1" || l === "::") return true;
    if (l.startsWith("fc") || l.startsWith("fd")) return true; // unique local
    if (l.startsWith("fe80")) return true; // link-local
    // IPv4-mapped ::ffff:a.b.c.d
    const m = l.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (m) return ipIsPrivate(m[1]);
    return false;
  }
  return true; // unknown form -> treat as unsafe
}

async function assertSafeUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http/https URLs are allowed");
  }
  if (url.port && url.port !== "80" && url.port !== "443") {
    throw new Error("Disallowed port");
  }
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("Disallowed host");
  }
  const addrs = await lookup(host, { all: true });
  if (addrs.length === 0) throw new Error("Host did not resolve");
  for (const a of addrs) {
    if (ipIsPrivate(a.address)) throw new Error("Host resolves to a private address");
  }
  return url;
}

export type OgPreview = {
  finalUrl: string;
  title: string | null;
  siteName: string | null;
  description: string | null; // operator-reading only; never published
  image: string | null;
};

export async function fetchOgPreview(raw: string): Promise<OgPreview> {
  const url = await assertSafeUrl(raw);

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "KhidrBot/0.1 (+civic tool; OG preview)", accept: "text/html" },
    });
  } finally {
    clearTimeout(t);
  }

  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("text/html")) throw new Error("Not an HTML page");

  // Read with a hard byte cap.
  const reader = res.body?.getReader();
  let received = 0;
  const chunks: Uint8Array[] = [];
  if (reader) {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_BYTES) {
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
  }
  const html = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf8");

  const meta = (prop: string): string | null => {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']`,
      "i"
    );
    const m = html.match(re);
    return m ? decodeEntities(m[1].trim()) : null;
  };
  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i);

  return {
    finalUrl: res.url || url.toString(),
    title: meta("og:title") ?? (titleTag ? decodeEntities(titleTag[1].trim()) : null),
    siteName: meta("og:site_name") ?? url.hostname.replace(/^www\./, ""),
    description: meta("og:description") ?? meta("description"),
    image: meta("og:image"),
  };
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
