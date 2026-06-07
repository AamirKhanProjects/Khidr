import "server-only";
import { supabaseAdmin } from "./supabase";
import { FEEDS, INCLUDE_TERMS, EXCLUDE_TERMS, UK_SIGNALS, type Feed } from "./feeds";

type RawItem = { title: string; link: string; summary: string; date: number };

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&#8217;/g, "'").replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/&#8211;/g, "-");
}
function clean(s: string): string {
  return decodeEntities(stripCdata(s).replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}
function pick(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? m[1] : "";
}

function parseFeed(xml: string): RawItem[] {
  const out: RawItem[] = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  for (const b of blocks) {
    const title = clean(pick(b, "title"));
    // RSS <link>url</link>, or Atom <link href="url"/>
    let link = clean(pick(b, "link"));
    if (!link) {
      const m = b.match(/<link[^>]*href="([^"]+)"/i);
      if (m) link = m[1];
    }
    const summary = clean(
      pick(b, "description") || pick(b, "content:encoded") || pick(b, "summary")
    ).slice(0, 400);
    const dateStr = clean(pick(b, "pubDate") || pick(b, "updated") || pick(b, "published") || pick(b, "dc:date"));
    const date = dateStr ? Date.parse(dateStr) || Date.now() : Date.now();
    if (title && link) out.push({ title, link, summary, date });
  }
  return out;
}

function normaliseUrl(raw: string): string {
  try {
    const u = new URL(raw);
    u.hash = "";
    u.search = "";
    let s = u.toString().replace(/\/$/, "");
    return s.toLowerCase();
  } catch {
    return raw.trim().toLowerCase();
  }
}
function normaliseTitle(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

async function fetchFeed(feed: Feed): Promise<{ feed: Feed; items: RawItem[] }> {
  try {
    const res = await fetch(feed.url, {
      headers: { "user-agent": "Mozilla/5.0 KhidrBot/0.1", accept: "application/rss+xml, application/xml, text/xml" },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { feed, items: [] };
    const xml = await res.text();
    return { feed, items: parseFeed(xml).slice(0, 40) };
  } catch {
    return { feed, items: [] };
  }
}

function matches(text: string, terms: string[]): string[] {
  const hits: string[] = [];
  for (const t of terms) if (text.includes(t)) hits.push(t);
  return hits;
}

export type AggregateResult = { fetched: number; kept: number; inserted: number };

export async function runAggregate(): Promise<AggregateResult> {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));

  // Flatten, dedupe by URL, track cross-source counts by title.
  const byUrl = new Map<string, { item: RawItem; source: string; topics: string[] }>();
  const titleCount = new Map<string, number>();
  let fetched = 0;

  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    const { feed, items } = r.value;
    for (const item of items) {
      fetched++;
      const hay = (item.title + " " + item.summary).toLowerCase();
      if (matches(hay, EXCLUDE_TERMS).length > 0) continue;
      const topics = matches(hay, INCLUDE_TERMS);
      if (topics.length === 0) continue; // soft include filter
      const url = normaliseUrl(item.link);
      if (!byUrl.has(url)) byUrl.set(url, { item, source: feed.name, topics });
      const nt = normaliseTitle(item.title);
      titleCount.set(nt, (titleCount.get(nt) || 0) + 1);
    }
  }

  const now = Date.now();
  const rows = [...byUrl.entries()].map(([url, { item, source, topics }]) => {
    const ageDays = Math.max(0, (now - item.date) / 86_400_000);
    const recency = Math.exp(-ageDays / 3); // decay over ~3 days
    const ukHit = matches((item.title + " " + item.summary).toLowerCase(), UK_SIGNALS).length > 0 ? 1 : 0;
    const cross = (titleCount.get(normaliseTitle(item.title)) || 1) - 1;
    const score = recency * 2 + ukHit * 1.0 + Math.min(cross, 3) * 1.5;
    return {
      headline: item.title.slice(0, 300),
      source_name: source,
      source_url: url,
      raw_summary: item.summary || null,
      matched_topics: topics.slice(0, 8),
      score: Number(score.toFixed(3)),
      seen_at: new Date(item.date || now).toISOString(),
    };
  });

  const sb = supabaseAdmin();

  // Prune candidates older than 7 days (keeps the queue fresh; promoted/dismissed
  // older than that drop too — fine, they're already actioned).
  await sb.from("candidates").delete().lt("seen_at", new Date(now - 7 * 86_400_000).toISOString());

  let inserted = 0;
  if (rows.length) {
    // ignoreDuplicates: existing rows (incl. dismissed/promoted) are left untouched.
    const { data, error } = await sb
      .from("candidates")
      .upsert(rows, { onConflict: "source_url", ignoreDuplicates: true })
      .select("id");
    if (!error && data) inserted = data.length;
  }

  return { fetched, kept: rows.length, inserted };
}
