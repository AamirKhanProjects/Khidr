# Khidr — Build Brief (v1, corrections folded in)

Single source of truth for turning the scaffold into a working app + admin
dashboard. Read `docs/product-spec.md`, `docs/uk-plumbing.md`,
`docs/curation-guide.md`, `docs/legal-notes.md` first — they are binding. This file
supersedes the original brief where they differ.

## v1 corrections (LOCKED — do not re-open)

1. **Defer the RSS aggregator (Method 2 / candidate queue) to v1.1.** v1 ships the
   manual loop only. Keep the `candidates` table as a seam; build no aggregator
   logic yet. When built later, use **publisher RSS feeds** (BBC, Guardian, Al
   Jazeera, Middle East Eye, …), NOT Google News (its article URLs are encoded
   redirects that no longer resolve reliably).
2. **Drop `is_lead`.** Today = the newest published item. Simpler and unambiguous.
3. **Split MP data by privacy:** postcode → MP id stays **on-device** (postcodes.io
   + Members API), so the postcode never leaves the phone. The app then calls the
   backend `GET /api/mp/{id}` for **enrichment** (committees + voting record),
   computed and cached server-side. MP id is not personal.
4. **Bust the feed cache on publish** (on-demand `revalidateTag('feed')`) with a
   short stale-while-revalidate backstop, so a new post shows quickly.
5. **Cron (only when the aggregator is built later):** at most every 6h, with
   concurrency-limited fetches, within Vercel tier/timeout limits.
6. **Accessibility is part of the mobile build, not a phase:** nav labels, dynamic
   type, contrast, reduce-motion.

## Locked product decisions (unchanged)

- **No AI in v1.** No model calls anywhere. Drafts are static templates only.
- **No user accounts.** Postcode + resolved MP + personal activity cached on-device
  (`AsyncStorage`). Never send a user's location or composed message to any server.
- **Khidr never sends.** Every action hands off: `mailto:`, `tel:`, or WriteToThem in
  an in-app browser. The Email composer has the edit-gate; WriteToThem is a pure
  handoff (no in-app composer).
- **Personal, never mass.** A pre-filled email draft must be edited before the send
  affordance enables (anti-astroturf nudge, kept visible). Gate logic: changed from
  the template AND no `[...]` placeholder remaining AND length > 40 chars.
- **Inform, don't instruct.** Blurbs state facts + framing, never "demand X".
- **Copyright:** never display a source's summary/body to users. Headline + our blurb
  + link only. The blurb is mandatory on every published item.
- **Feed mechanics:** Today = newest published item. Feed = published items from the
  last 30 days, newest first. Expiry is purely time-based (publishedAt + 30 days).
  No vote-date field; any date goes in the blurb text.
- **Cadence ~1/day.** A quiet day is a valid, guilt-free state. Build nothing that
  nags the operator.

## Architecture

- **Backend + admin:** one Next.js (App Router) app on Vercel (`backend/`). Serves the
  admin dashboard, the public `/api/feed` the mobile app reads, and `/api/mp/[id]`.
  (Aggregator cron added in v1.1.)
- **Database:** Supabase (Postgres). Tables below. Service role key server-side only.
- **Admin auth:** single operator. `ADMIN_PASSWORD` → signed, httpOnly, Secure,
  SameSite=Strict session cookie (HMAC via `SESSION_SECRET`). Timing-safe compare,
  login rate-limited.
- **Mobile:** reads one public, edge-cached endpoint (`/api/feed`) plus the existing
  on-device postcodes.io / Members lookup, plus `/api/mp/[id]` for enrichment.

## Data model (Supabase) — see `backend/supabase/schema.sql`

`published_items`: id, headline, blurb (required, our words), source_name,
source_url (resolved publisher URL), topics[], published_at, bill_id?, call_points[],
email_context?, created_by. (No `is_lead`.)

`candidates` (v1.1 seam, unused in v1): id, headline, source_name, source_url
(unique, normalised), raw_summary (operator-reading only, NEVER served to users),
matched_topics[], score, seen_at, dismissed, promoted_item.

The feed endpoint returns `published_items` where `published_at > now() - interval
'30 days'`, newest first; the first row is the Today lead.

## Security requirements (do all; nothing is "skip because free")

- Secrets (Supabase service key, `ADMIN_PASSWORD`, `SESSION_SECRET`) are **server-side
  only**. Never in the mobile bundle, never `NEXT_PUBLIC_*`.
- Admin routes (`/admin`, `/api/admin/*`) behind auth middleware. Public `/api/feed`
  and `/api/mp/[id]` expose only whitelisted fields (never `raw_summary`).
- **SSRF guard** on the server-side URL fetch (OG preview, and later redirect
  resolution): http/https only, resolve host and block private/reserved IPs
  (10/8, 172.16/12, 192.168/16, 127/8, 169.254/16, ::1, fc00::/7), block odd ports,
  5s timeout, ~2MB cap, validate `text/html`.
- Login: timing-safe password compare + in-memory rate limit (note: per-instance on
  serverless; acceptable for one operator).
- Input validation (zod) on every write. Blurb required at DB (NOT NULL + check) and
  UI.
- Security headers (CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff,
  Referrer-Policy, Permissions-Policy) via middleware.

## Build order (commit after each)

1. Backend skeleton + schema + `/api/feed` (+ cache-bust on publish) + auth.
2. Manual add (Method 1) dashboard with live card preview. **Ship this.**
3. Mobile wiring: Expo app → `/api/feed`; Today/Feed/Item detail in the prototype look.
4. Action tray (mailto edit-gate / WriteToThem handoff / tel) + MP screen via
   `/api/mp/[id]`.
5. **Stop. Ship. Use for two weeks.**
6. v1.1: publisher-RSS aggregator, candidate queue, promote flow.

## Acceptance checks

- [ ] Nothing publishes without an operator-written blurb (DB + UI).
- [ ] No source summary/body text is ever shown to end users.
- [ ] Email send affordance disabled until the draft is edited (per gate logic above).
- [ ] No user postcode, location, or composed message reaches any server.
- [ ] Feed shows only items < 30 days old; oldest drop off automatically.
- [ ] Feed cache busts on publish; MP payload carries provenance.
- [ ] No AI/model calls anywhere in v1.
- [ ] Admin behind auth; public routes expose only published fields.
- [ ] Secrets server-side only; SSRF guard on server fetches.

## Out of scope for v1

AI drafting · accounts/sync · devolved reps & councillors · US module (keep the seam) ·
donations · push notifications · the RSS aggregator (v1.1) · any user-identifying
analytics.
