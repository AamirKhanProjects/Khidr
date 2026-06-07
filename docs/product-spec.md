# Khidr — Product Spec

> **Market:** UK first (see `docs/uk-plumbing.md`). The US is a later, legally-gated
> module on the same shell, not a second app.

## 0. Audience & mission

Khidr serves the **whole UK Muslim community**, explicitly including people **new to
politics who do not know what a constituency is or what an MP can do**, alongside the
politically fluent. The mission is **knowledge + action together**: every screen
teaches a little and lowers the barrier to acting a lot.

Design consequences (treat as requirements, not nice-to-haves):
- **Plain language, no jargon.** Define terms inline ("Your MP is the one person who
  represents your area in Parliament"). A short glossary is available.
- **No assumed prior knowledge.** The "How it works" onboarding and first-use
  coachmarks exist for exactly this.
- **Safe first action.** Reduce call/email anxiety with "what to expect" guidance.
- **Context on every story:** what happened, why it affects you, who can act.

## 0b. What needs a human (only the newsfeed)

A hard rule that keeps the app cheap to run, hard to get wrong, and neutral:

- **Human oversight is limited to the newsfeed**: choosing which stories to surface,
  writing the original summaries, and attaching the relevant bill to a story. That is
  the moat, and the only place editorial judgement lives.
- **Everything else is derived from public APIs, with no human in the loop:**
  - MP identity, party, constituency, contact → Members API.
  - MP committee memberships → Committees API (`/commonscommitteememberships`).
  - The "your MP is on the relevant committee" flag → derived from the attached bill's
    committee plus the MP's committee membership. The human only attaches the bill.
  - Voting record / scorecard → Commons Votes API (factual, no verdict).
  - Outcome of a followed bill → Bills API + Commons Votes API.
- **Do not ship editorial glue that needs a person to maintain.** For example, a line
  like "a vote is scheduled this week" is not a clean API field and was removed. If a
  fact cannot be pulled from an API or written once as part of curating a story, it
  does not belong in the product.
- Show small **provenance labels** ("from UK Parliament data") on factual blocks. They
  reinforce neutrality and trust at no cost.

## 1. Core loop

1. User opens app → sees **Today** (a calm daily digest) and the **curated feed**.
2. Each **feed item** = headline + original blurb (our POV) + "Read original" (opens
   in-app browser) + an **action layer**: contact your own MP.
3. First time a user takes an action, we ask for their **postcode once** and resolve
   their MP (postcodes.io → UK Parliament Members API). Cached thereafter.
4. **Email / WriteToThem (UK-primary):** pick the user's MP → optional AI-assisted
   draft the user edits in their own words → send via `mailto:` to the MP's
   `@parliament.uk` address, or hand off to WriteToThem in the in-app browser. We
   never send.
5. **Call (secondary in UK):** show a short script tailored to the story → tap to
   dial (`tel:`) the office number. After the call, a one-tap "I called ✓" log.

## 2. Screens

- **Today** (`/`): daily digest. The lead story + a pinned priority action when a
  vote is imminent.
- **Feed** (`/feed`): full curated list with a topic selector (underline tabs).
- **Item detail** (`/item/[id]`): full blurb, "Read original", action layer.
- **Your MP** (`/mp`): the user's MP, contact, "why they matter now"; change postcode.
- **Call** (`/action/call?item=`): script + tap-to-dial + log.
- **Write** (`/action/write?item=`): editable draft (optional AI assist) → send via
  own email or hand off to WriteToThem.
- **Impact** (`/impact`): your activity, the outcome of votes, how your MP voted.
- **Onboarding** (`/onboarding`): mission, how it works, then collect postcode + topics once.

## 3. Why the design works: volume, metadata, constituency

Two mechanics decide whether "make it easy" produces real pressure or just a
discounted number.

- **Calls carry volume; email leaks it.** Each call costs a staffer's time, jams
  the line, and is tallied as a discrete event, so 10,000 calls feel like 10,000
  things. Identical emails sent through the standard advocacy pipeline arrive with
  campaign metadata (a campaign ID and issue tags); the office CRM auto-groups them
  into a single line ("10,000 form emails, oppose"). Still counted, but near-zero
  weight per message. Calls are the pressure weapon; email is the persuasion weapon.
- **Constituency is the multiplier.** Offices weight in-district constituents far
  above everyone else, and the weekly tally a member sees is constituents by issue
  and position. The highest-leverage move is not maximising national volume, it is
  concentrating real constituents on the members who actually represent them.

### What this means for the UI (UK module)

UK MP culture is more email-led than the US phone-pressure culture, so the UK module
**leads with email / WriteToThem and offers calling as a secondary path** (the US
module will be calling-first).

- **Three send modes, and Khidr never transmits.** Khidr is a router, not a sender.
  Every action hands off so nothing leaves a Khidr server:
  1. **Email** the MP by handing off to the user's own mail client (`mailto:` to the
     `@parliament.uk` address), pre-filled but gated on a personal edit.
  2. **WriteToThem**: open `writetothem.com` in the in-app browser. It is the trusted
     UK civic channel and itself blocks mass-identical and vexatious messages, which
     reinforces our ethic. It has no bulk API by design, which is exactly why we hand
     off rather than automate.
  3. **Call** the office (tap to dial), for users who prefer it.
  A pre-written draft (optionally AI-assisted) is fine as a starting point; the only
  sin is the *identical* mass-send, which we never do. Because every message leaves
  from the user's own app or via WriteToThem, nothing carries a Khidr campaign ID, so
  it lands as an individual constituent statement rather than auto-batching.
- **One MP, always.** Everyone has exactly one Westminster MP; every action routes to
  it, so the volume reads as constituent pressure rather than astroturf.
- We never store or transmit the composed message to a Khidr server; it goes straight
  into the OS composer or WriteToThem (privacy, anti-astroturf, lower liability).

## 4. Data model

```ts
type FeedItem = {
  id: string;
  headline: string;        // may mirror source headline
  blurb: string;           // ORIGINAL text, our POV, written in-house
  sourceName: string;      // e.g. "Reuters", "Al Jazeera"
  sourceUrl: string;       // opens in in-app browser
  publishedAt: string;     // ISO
  topics: string[];        // e.g. ["civil-rights", "foreign-policy"]
  // Optional action context the AI/script uses:
  callPoints?: string[];   // 2–4 talking points for the call script
  emailContext?: string;   // 1–2 sentences the AI draft can ground itself in
};

// UK MP. The shell stays country-agnostic; this is what the UK module returns.
type Rep = {
  id: string;              // Members API member id
  name: string;
  office: string;          // "Member of Parliament"
  party?: string;
  constituency?: string;   // 2024 constituency name
  constituencyCode?: string; // ONS code, e.g. "E14001172"
  phones: string[];        // parliamentary / constituency office numbers
  email?: string;          // @parliament.uk address
  writeToThemUrl?: string; // handoff to the trusted UK channel
  photoUrl?: string;       // Members API thumbnail
};

type UserLocation = { postcode?: string; resolvedRepIds: string[] };
```

## 5. MP lookup (borrow) — UK, free, no key

Full detail and verified endpoints in `docs/uk-plumbing.md`. The chain:

1. **postcode → constituency**: `api.postcodes.io/postcodes/{postcode}`, use the
   `parliamentary_constituency_2024` field (and its ONS code).
2. **constituency → MP**: `members-api.parliament.uk/api/Location/Constituency/Search`
   returns the current MP id, name, party.
3. **MP → contact**: `members-api.parliament.uk/api/Members/{id}/Contact` returns
   phone(s) and the `@parliament.uk` email; `/Thumbnail` for the photo.

- Implement behind one interface (`mobile/src/services/reps.ts`) so the country
  module is swappable (UK now, US later). Ships with a **mock** plus a **real**
  fetch implementation (no key needed).
- Handle missing fields gracefully: when an MP has no public email or office phone,
  fall back to **WriteToThem** (always available).

## 6. The write composer

**v1: you write it yourself.** The composer opens with a light, non-AI starting
scaffold (a greeting, a blank space for your point, a sign-off) that you edit in your
own words, then send from your own email or via WriteToThem. That is the whole v1
write experience. Simple, honest, and enough.

**AI assist is NOT in v1.** It moves to Next (see §9). When it comes, it is a small
"help me start" button: you give a couple of points and it drafts something you then
edit. It is a convenience for people who freeze at a blank box, never a way to mass-
produce messages.

### Why we ask you to write in your own words (the human version)

A note to carry into any copy or pitch, kept honest:

> The people who read these messages can tell the difference between a real one and a
> form letter, and they weigh them completely differently. A hundred identical
> messages get counted once and set aside. One message in your own voice, even a
> short clumsy one, lands as a real person who cares. So Khidr nudges you to add your
> own words. We are honest that this is a nudge, not a lock: you could paste anything
> in. We just make the good thing the easy thing, because a message that sounds like
> you is the one that actually moves someone.

Say it that way. Claim "we help you write in your own words", never "we prevent fake
messages", because the honest version is both true and more trustworthy.

## 7. Curation backend (later)

- v0: bundled `mobile/src/data/sample-feed.json` (ships now, makes the app runnable).
- v1: a tiny CMS/JSON endpoint the editor publishes to (Sanity, Notion-as-CMS, or a
  flat JSON in object storage). App fetches and caches.
- Editorial rules live in `docs/curation-guide.md`.

## 8. Tech choices

- **Expo (managed) + React Native + TypeScript**, `expo-router` for file-based nav.
- `expo-web-browser` for in-app browser; `Linking` for `tel:`/`mailto:`.
- State: keep it boring — React state + `expo-secure-store`/`AsyncStorage` for the
  cached location & reps. No backend needed for v0.

## 9. Accepted features (the loop that earns trust)

All six are in scope, sequenced Now / Next:

1. **Call-anxiety reducers** (Now): a "what to expect" line and an after-hours
   "leave a voicemail" prompt. Directly lifts the conversion the product depends on.
2. **"Your MP is the decider" flag** (Now-ish): when a story's committee or vote
   involves the user's own MP, say so prominently. Highest-leverage moment.
3. **Follow a story / bill, get the outcome** (Next): notify on resolution, show how
   the user's MP voted (Commons Votes API). Closes the loop, drives return visits.
4. **Contact-in day** (Next): a scheduled, countdown event concentrating messages
   around a key vote. Mirrors the surge mechanic; timing makes volume felt.
5. **MP accountability over time** (Next): a **factual voting record only** of how
   the user's MP voted on listed divisions. **No editorial verdict, no rating, no
   "good/bad MP" gloss.** This is the feature that most strains the "platform, not
   actor" posture, so it carries a hard rule: factual record only, and **extra legal
   review before any regulated pre-election period** (see `legal-notes.md`).
6. **Trust mechanics** (Now): named sources on every blurb, a corrections log, a
   deliberately calm tone (no red-alert outrage design).

## 9a. Accounts & data: none, by design

Every feature on this list works **without a single login**. Accounts only buy
cross-device sync, whose cost (a user identity we would have to protect) outweighs
its benefit for this audience.

- **Public scorecard** = computed from the public **Commons Votes API** and attached
  to the **MP**, not the person. The "personalisation" is just which MP's public card
  to show, derived from the postcode in local storage. Zero user data server-side.
- **Personal tracking** (follow a story, "I wrote ✓", issues you acted on) =
  **on-device only** (`AsyncStorage` / `expo-secure-store`), the same pattern as the
  cached postcode/MP. When a followed bill resolves, the app checks the Bills /
  Commons Votes API on open and surfaces the outcome. The device remembers, not Khidr.
- **Stated plainly as a feature:** "Your activity never leaves your phone."
- **Aggregate counts** ("Khidr users acted N times") are deliberately **not collected
  at launch.** If ever wanted for impact/grant reporting, the only acceptable form is
  an **anonymous, un-keyed** event ping (no identifier, no postcode) giving totals not
  individuals, and even that should be opt-in. Not holding a database of which
  constituents pressure which MPs is protective on both privacy and electoral-law
  grounds.

## 10. Out of scope for v0

- Accounts/auth (not needed, and deliberately avoided; see 9a).
- Devolved reps (MSPs / MSs / MLAs) and local councillors — Westminster MP only for v1.
- The **US module** — same shell, swappable country module, gated on US legal
  clearance (see `docs/uk-plumbing.md` and `legal-notes.md`).
- Donations/grants flow — fund via small-dollar giving + grants under a UK charity /
  fiscal sponsor; turn on once the entity is set up.

## 11. Motion & animation

Calm, smooth, never jarring. Motion should reassure (especially the beginner
audience), not entertain. Implemented in `mobile/src/components/Motion.tsx`.

- **Screen transitions:** cross-fade between screens, ~300ms. Opening a story or
  moving to Call / Write should fade, not hard-cut. (Set on the expo-router Stack:
  `animation: "fade"`.)
- **Content fade-in:** big content blocks (story detail, action screens) fade in with
  a small upward rise, ~320ms, ease-out. Use `<FadeInView>`.
- **Confirmation "blink":** when a big action succeeds (call logged, message handed
  off), a gentle opacity pulse, **deliberately not too short**: ~350ms each way,
  ~700ms per cycle, repeated twice. Reads as a calm acknowledgement, not a flicker.
  Use `<Pulse active={...}>`.
- **Button press:** subtle, quick feedback (e.g. opacity/scale to ~0.97). Keep it
  short so the UI feels responsive.
- **Do not** use bouncy/elastic/spring overshoot, long or looping attention-grabbing
  animation, or anything that delays the user from acting. Big actions get the
  smooth fade and the gentle pulse; everything else stays quiet.
- **Respect reduced-motion:** honour the OS "reduce motion" setting (fall back to a
  plain fade or none) before launch.
