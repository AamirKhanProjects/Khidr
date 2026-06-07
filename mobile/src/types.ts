export type FeedItem = {
  id: string;
  headline: string;
  /** ORIGINAL text written in-house. Never source body copy. */
  blurb: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string; // ISO
  topics: string[];
  /** UK Bills API id, to attach the actual legislation. */
  billId?: string;
  /** Neutral points a constituent might raise (NOT scripted demands). */
  callPoints?: string[];
  /** 1–2 factual sentences the AI draft can ground itself in. */
  emailContext?: string;
};

/**
 * A UK MP. The app shell is country-agnostic; the UK module returns this shape.
 * (A future US module would map its officials into the same type.)
 */
export type Rep = {
  id: string; // Members API member id
  name: string;
  office: string; // "Member of Parliament"
  party?: string;
  constituency?: string; // 2024 constituency name
  constituencyCode?: string; // ONS code, e.g. "E14001172"
  phones: string[]; // parliamentary / constituency office numbers
  email?: string; // @parliament.uk address
  /** Handoff to the trusted UK channel; always available as a fallback. */
  writeToThemUrl?: string;
  photoUrl?: string; // Members API thumbnail
};

export type UserLocation = {
  postcode?: string;
  resolvedRepIds: string[];
};
