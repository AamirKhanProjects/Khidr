# Khidr backend (Next.js + Supabase)

Serves the admin dashboard, the public `/api/feed` the mobile app reads, and
`/api/mp/[id]` enrichment. No AI, no user accounts. See `docs/build-brief.md`.

## Setup

1. **Supabase**: create a project. The schema in `supabase/migrations/` (repo root)
   is applied automatically when you link this GitHub repo to Supabase. (Or paste
   `supabase/migrations/20260607120000_init.sql` into the SQL editor once.) Copy the
   project URL and the **service role** key (Project Settings → API).
2. **Env**: `cp .env.example .env.local` and fill:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD` (a strong password you choose)
   - `SESSION_SECRET` — generate:
     `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
3. **Install & run**:
   ```bash
   npm install
   npm run dev      # http://localhost:3000/admin
   ```

## Deploy (Vercel)

- Import the `backend/` folder as a Vercel project.
- Add the four env vars in Vercel Project Settings → Environment Variables
  (all server-side; do NOT prefix with `NEXT_PUBLIC`).
- The mobile app points at `https://<your-deployment>/api/feed`.

## Routes

| Route | Auth | Purpose |
|---|---|---|
| `GET /api/feed` | public | Published items, last 30 days, newest first. Today = first. |
| `GET /api/mp/[id]` | public | Non-personal MP enrichment (name, party, contact, votes) by Members id. |
| `POST /api/admin/login` | public | Password → signed httpOnly session cookie. Rate-limited. |
| `POST /api/admin/logout` | cookie | Clear session. |
| `POST /api/admin/og` | admin | SSRF-guarded OG preview for a pasted URL. |
| `POST /api/admin/publish` | admin | Insert a published item (blurb required). Busts feed cache. |
| `GET/DELETE /api/admin/items` | admin | List / unpublish live items. |

## Security notes

- Service role key + admin password + session secret are **server-side only**.
- Admin routes/pages are behind cookie auth (presence gate in middleware,
  authoritative signature+expiry check server-side per route).
- Server-side URL fetches are SSRF-guarded (private/reserved IPs blocked, http(s)
  only, 5s timeout, 2MB cap, HTML only).
- The public feed returns whitelisted fields only; `candidates.raw_summary` is
  never exposed.

## Not built yet (v1.1)

The publisher-RSS aggregator and the `candidates` queue. The table exists as a seam.
