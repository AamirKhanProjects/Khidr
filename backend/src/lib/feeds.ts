// Publisher RSS feeds for the candidate aggregator. Editable — add/remove freely.
// We use direct publisher feeds (NOT Google News) so URLs are clean and there is
// no redirect to resolve. Candidates are only suggestions for the operator; they
// are never shown to end users and never auto-published.

export type Feed = { name: string; url: string };

export const FEEDS: Feed[] = [
  // Muslim / community outlets (mostly on-topic already)
  { name: "5Pillars", url: "https://5pillarsuk.com/feed/" },
  { name: "Middle East Monitor", url: "https://www.middleeastmonitor.com/feed/" },
  { name: "Hyphen", url: "https://hyphenonline.com/feed/" },
  { name: "The New Arab", url: "https://www.newarab.com/rss" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  // UK news / civil society (filtered for relevance)
  { name: "Byline Times", url: "https://bylinetimes.com/feed/" },
  { name: "BBC Politics", url: "https://feeds.bbci.co.uk/news/politics/rss.xml" },
  { name: "The Guardian — Politics", url: "https://www.theguardian.com/politics/rss" },
];

// Keep an item if its title/summary contains at least one of these (soft include).
export const INCLUDE_TERMS = [
  "muslim", "islam", "islamophobia", "islamophobic", "mosque",
  "gaza", "palestin", "israel", "ceasefire", "arms export", "arms sale",
  "sudan", "kashmir", "syria", "yemen", "rohingya", "uyghur",
  "prevent strategy", "counter-terror", "counter terror", "sharia", "halal",
  "hijab", "niqab", "refugee", "asylum", "deportation", "migrant",
  "faith school", "hate crime", "racism", "two-tier",
];

// Drop obvious noise (kept short — over-excluding is worse than a longer skim list).
export const EXCLUDE_TERMS = [
  "recipe", "football", "transfer window", "premier league", "celebrity",
  "horoscope", "box office", "fashion week", "gossip",
];

// Boost score when an item looks UK-relevant.
export const UK_SIGNALS = [
  "uk", "britain", "british", "westminster", "mp ", "mps", "commons",
  "council", "home office", "labour", "tory", "conservative", "reform uk",
  "starmer", "downing street", "whitehall",
];
