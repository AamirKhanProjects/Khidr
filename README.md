# Khidr

A curated news feed of Muslim-affecting stories with a native civic-action layer.
Each item is a **headline + an original short blurb (our POV) + a link that opens
the original article in an in-app browser**. Next to every item sits an action
layer: contact your own MP, by **email**, **WriteToThem**, or **phone**, with a
draft you write and send yourself.

> We are a *platform*. We help people in the UK contact their own MP about stories
> that affect them. We never republish full articles, and we never send messages on
> anyone's behalf. The user writes, edits, and sends every one.

## Who it's for

Khidr is built for the whole spectrum of the UK Muslim community: from the
politically fluent to **people who have never engaged with politics before and do
not know what a constituency is or what an MP can do**. The entire app is about two
things working together: **giving knowledge and empowering action**. Every screen
should teach a little and lower the barrier to acting a lot, in plain,
jargon-free language, with no assumed prior knowledge.

## Why this exists, and why the UK first

Offices feel volume, and individual constituent contact carries weight. The UK is
the stronger and cleaner starting point: Muslims are ~6.5% of the population (about
five times the US share), concentrated in dense constituencies that first-past-the-
post amplifies, and the 2024 election already proved the electoral leverage is
real. The UK also dissolves the legal blocker: a UK person building a UK tool for
UK people to contact UK MPs is ordinary civic engagement, with none of the
FARA / foreign-national exposure the US version carries.

The product is easy. **The editorial curation is the only moat**, and the
discipline of keeping the tool neutral-but-opinionated is what keeps it both
effective and legally clean. The US is a later module, not a second app (see
`docs/uk-plumbing.md`).

## The three principles (do not violate)

1. **Personal, never mass.** We help an *individual* write a *personal* message to
   *their own* MP. We never blast identical messages; at scale that reads as
   astroturf and offices discount it. WriteToThem enforces the same rule, which is
   why we hand off to it rather than automate it. The friction is the feature.
2. **Teach while you act.** Assume no prior knowledge. Explain the terms, show who
   the MP is and why they matter, make the first action feel safe and simple.
3. **Inform, don't instruct.** Blurbs carry a POV but present facts. We surface
   what's happening and who represents you; we don't script "demand X." This is
   what keeps us a platform rather than a political actor.

## Accepted features (the loop that earns trust)

1. **Call-anxiety reducers** (what to expect, leave-a-voicemail after hours).
2. **"Your MP is the decider" flag** when a user's MP sits on the relevant committee.
3. **Follow a story / bill, get the outcome** (and how your MP voted).
4. **A "contact-in day"** that concentrates messages around a key vote.
5. **MP accountability over time**: a **factual voting record only**, no verdict or
   rating. This is the feature that strains the platform posture, so it is rule-bound
   and lawyer-reviewed before any pre-election period (see `docs/legal-notes.md`).
6. **Trust mechanics**: named sources, a corrections log, a deliberately calm tone.

**No accounts, by design.** Every feature works without a login. The public
scorecard is computed from the Commons Votes API and attached to the MP; personal
tracking lives on the device only. *Your activity never leaves your phone.* (See
`docs/product-spec.md` §9a.)

## What we build vs. borrow (UK)

| Borrow (don't rebuild) | Build (our value) |
|---|---|
| postcode → constituency (`postcodes.io`, free) | Editorial curation + original blurbs |
| constituency → MP + contact (UK Parliament Members API, free) | The feed + Today digest + action UX |
| WriteToThem (in-app browser handoff) | Plain-language explainers / knowledge layer |
| Native `tel:` dialer, `mailto:` composer, in-app browser | Personal, anti-astroturf contact flow |
| Bills + Commons Votes APIs (free) | The outcome loop + accountability scorecard |

## Repo layout

```
Khidr/
├── README.md                ← you are here
├── docs/
│   ├── product-spec.md       ← calls-first / anti-batch design, screens, data model
│   ├── curation-guide.md     ← how to write blurbs; copyright-safe sourcing rules
│   ├── uk-plumbing.md        ← UK routing report: APIs, send modes, caveats (verified)
│   ├── legal-notes.md        ← platform posture, FARA note, funding gate
│   └── validation-plan.md    ← 4-week manual editorial test before heavy build
├── design/                   ← mockup.html (look) + board.html (full product board)
└── mobile/                   ← Expo (React Native + TypeScript) app scaffold
    └── README.md             ← how to install & run
```

## Status

- [x] Concept validated, scope locked (calls-first, anti-batch, platform posture)
- [x] Docs + Expo scaffold authored
- [ ] Install Node + run the scaffold (`mobile/README.md`)
- [ ] Wire real rep-lookup API (Cicero/Geocodio key)
- [ ] Replace sample feed with a real curation backend
- [ ] 4-week manual editorial validation (`docs/validation-plan.md`)

## Heads-up

`Node.js` is not installed on this machine. Install it (LTS) before running the
`mobile/` app — see `mobile/README.md`.
