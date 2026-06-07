-- Khidr database schema (Supabase / Postgres).
-- Run in the Supabase SQL editor. The backend connects with the SERVICE ROLE key
-- (server-side only), so RLS is enabled and locked down: no anon access at all.
-- The mobile app NEVER talks to Supabase directly; it only reads /api/feed.

-- ---------------------------------------------------------------------------
-- published_items: what the operator has chosen to publish. Mobile reads these.
-- ---------------------------------------------------------------------------
create table if not exists published_items (
  id            uuid primary key default gen_random_uuid(),
  headline      text not null,
  -- OUR words. Required. Never source text. Enforced NOT NULL + non-empty.
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
-- raw_summary is the source's own text: FOR OPERATOR READING ONLY in the admin
-- dashboard. It must NEVER be served to end users or exposed on a public route.
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
-- Row Level Security: deny everything to anon/public. Only the service role
-- (used server-side by the Next.js backend) bypasses RLS. No policies = no
-- access for anon, which is exactly what we want.
-- ---------------------------------------------------------------------------
alter table published_items enable row level security;
alter table candidates      enable row level security;
