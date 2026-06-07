// Shape returned by GET /api/feed (whitelisted public fields).
export type FeedItem = {
  id: string;
  headline: string;
  blurb: string;
  sourceName: string;
  sourceUrl: string;
  topics: string[];
  publishedAt: string;
  billId: string | null;
  callPoints: string[];
  emailContext: string | null;
};

export type FeedResponse = {
  lead: FeedItem | null; // Today = newest published item
  items: FeedItem[]; // last 30 days, newest first
};

// The user's MP, resolved on-device from postcode (postcodes.io + Members API).
export type Rep = {
  id: string;
  name: string;
  office: string;
  party?: string;
  constituency?: string;
  constituencyCode?: string;
  phones: string[];
  email?: string;
  writeToThemUrl?: string;
  photoUrl?: string;
};

// Non-personal enrichment from GET /api/mp/[id] (votes + committees).
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
