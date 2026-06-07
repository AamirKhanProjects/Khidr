import "server-only";
import { unstable_cache } from "next/cache";

// Server-side MP enrichment, keyed by Members API id (NOT personal — it's just
// which MP). The mobile app resolves postcode -> MP id on-device, then asks us
// for this non-personal, cacheable enrichment. All from public Parliament APIs.

export type MpVote = { title: string; date: string; vote: "Aye" | "No" | "No vote" };

export type MpEnrichment = {
  id: number;
  name: string | null;
  party: string | null;
  phone: string | null;
  email: string | null;
  committees: string[];
  votes: MpVote[];
  provenance: string;
};

async function getJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json", "user-agent": "KhidrBot/0.1" },
      // server-side; let unstable_cache wrap caching
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function readMp(id: string): Promise<MpEnrichment> {
  const base = "https://members-api.parliament.uk/api/Members/" + id;

  const overview = await getJson(base);
  const v = overview?.value;

  const contactJson = await getJson(base + "/Contact");
  let phone: string | null = null;
  let email: string | null = null;
  for (const c of contactJson?.value ?? []) {
    if (!phone && c.phone) phone = c.phone;
    if (!email && c.email) email = c.email;
  }

  // Voting record (verified): Commons Votes member voting, most recent few.
  const votingJson = await getJson(
    `https://commonsvotes-api.parliament.uk/data/divisions.json/membervoting?queryParameters.memberId=${id}&queryParameters.take=5`
  );
  const votes: MpVote[] = Array.isArray(votingJson)
    ? votingJson.slice(0, 5).map((row: any) => ({
        title: row?.PublishedDivision?.Title ?? "Division",
        date: (row?.PublishedDivision?.Date ?? "").slice(0, 10),
        vote: row?.MemberVotedAye ? "Aye" : row?.MemberVotedNo ? "No" : "No vote",
      }))
    : [];

  // Committees: best-effort. Endpoint shape unconfirmed; tolerate failure so the
  // rest of the payload still works. TODO: confirm the correct committees-api
  // membership endpoint and map names here.
  const committees: string[] = [];

  return {
    id: Number(id),
    name: v?.nameDisplayAs ?? null,
    party: v?.latestParty?.name ?? null,
    phone,
    email,
    committees,
    votes,
    provenance: "UK Parliament data (Members API, Commons Votes API)",
  };
}

export function getMpEnrichment(id: string): Promise<MpEnrichment> {
  return unstable_cache(() => readMp(id), ["mp", id], {
    tags: [`mp:${id}`],
    revalidate: 86400, // 1 day
  })();
}
