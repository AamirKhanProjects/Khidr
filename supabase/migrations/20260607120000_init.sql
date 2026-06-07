-- Khidr initial schema. Applied automatically when Supabase is linked to this
-- GitHub repo (Supabase reads supabase/migrations/*.sql).
-- The backend connects with the SERVICE ROLE key (server-side only); RLS is
-- enabled and locked down (no anon access). The mobile app never touches the DB
-- directly — it only reads /api/feed.

-- ---------------------------------------------------------------------------
-- published_items: what the operator has published. The app reads these.
-- ---------------------------------------------------------------------------
create table if not exists published_items (
  id            uuid primary key default gen_random_uuid(),
  headline      text not null,
  -- OUR words. Required + non-empty. Never source text.
  blurb         text not null check (length(btrim(blurb)) > 0),
  source_name   text not null,
  source_url    text not null,
  topics        text[] not null default '{}',
  published_at  timestamptz not null default now(),
  bill_id       text,
  call_points   text[] not null default '{}',
  email_context text,
  created_by    text not null default 'operator'
);

create index if not exists published_items_published_at_idx
  on published_items (published_at desc);

-- ---------------------------------------------------------------------------
-- candidates: v1.1 seam for the (publisher-RSS) aggregator. UNUSED in v1.
-- raw_summary is the source's own text: operator-reading only in the admin UI;
-- NEVER served to end users or exposed on a public route.
-- ---------------------------------------------------------------------------
create table if not exists candidates (
  id             uuid primary key default gen_random_uuid(),
  headline       text not null,
  source_name    text,
  source_url     text not null,   -- store the NORMALISED resolved publisher URL
  raw_summary    text,            -- operator-reading only; never published
  matched_topics text[] not null default '{}',
  score          real not null default 0,
  seen_at        timestamptz not null default now(),
  dismissed      boolean not null default false,
  promoted_item  uuid references published_items(id)
);

create unique index if not exists candidates_url_uniq on candidates (source_url);
create index if not exists candidates_score_idx on candidates (score desc);

-- ---------------------------------------------------------------------------
-- RLS: deny all to anon/public. Only the service role (server-side backend)
-- bypasses RLS. No policies = no anon access, which is what we want.
-- ---------------------------------------------------------------------------
alter table published_items enable row level security;
alter table candidates      enable row level security;
