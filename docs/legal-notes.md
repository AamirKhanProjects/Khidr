# Khidr — Legal Notes (common-sense read, NOT legal advice)

> This is a founder's working note from a quick review, not advice from a lawyer.
> Nothing here is a substitute for a consult before taking money or incorporating.
> The two triggers below (funding, framing) are the things to get a real opinion on.

## UK-first dissolves the main blocker

Khidr launches in the **UK first**. A UK person building a UK tool for UK people to
contact UK MPs is ordinary civic engagement, with **none of the FARA /
foreign-national exposure** that gated the US version. The US becomes a later module
once someone with US standing can carry the legal and editorial side.

UK items to handle (none are launch-blocking, but get them right):
- **Data protection (UK GDPR).** We keep the postcode and resolved MP **on the
  device** and never transmit messages, which keeps our data footprint minimal. Have
  a short, honest privacy notice saying exactly this.
- **Charity / funding structure.** Fund via small-dollar giving and grants under a UK
  charity (CIO) or a fiscal sponsor. Decide structure before taking money.
- **Electoral law (the scorecard is the live wire).** As a neutral
  information-and-contact tool we are low-exposure, but three features in
  combination, the **MP accountability scorecard**, **contact-in days** concentrating
  pressure on named MPs, and an explicitly **Muslim-community** audience, start to
  look like organising a bloc to hold specific candidates accountable. Near an
  election that is exactly what UK non-party-campaigner / third-party spending rules
  scrutinise during the **regulated period**, if activity can reasonably be regarded
  as intended to influence voters for or against candidates. Mitigations, treated as
  rules not preferences:
  - The scorecard is a **factual voting record only** (how the MP voted on listed
    divisions). **No editorial verdict, no rating, no "good/bad MP" gloss.**
  - **Extra legal review before any regulated pre-election period**, and be ready to
    soften or pause scorecard prominence and contact-in days during it.
  - Keep the "inform, don't instruct" rule everywhere else.
- **Third-party API terms.** Respect Open Parliament Licence, OGL, and WriteToThem's
  no-scrape / no-bulk terms (we link and hand off, never automate).

The US section below is **retained only for when the US module is on the table. It is
an untested, lawyer-gated hypothesis, not a cleared conclusion, and must not be
treated as license to ship a US tool.**

## Posture: we are a platform, not a political actor

Khidr is a neutral utility that helps **people contact their own elected
representative** (in the UK, their MP) about news that affects them. That is the same
category as 5 Calls, WriteToThem, or a phone book: infrastructure, not advocacy. The
user chooses to act, writes their own message, and sends it themselves. We
facilitate; we don't direct. (The scorecard is the one feature that strains this
posture; see the electoral-law note above.)

## FARA — US module only, untested hypothesis (NOT a conclusion)

> Do not treat this section as cleared. It is a layperson's reading, not legal
> advice, and it self-lawyers exactly the way the rest of this doc warns against.
> It exists to frame questions for a US attorney when (if) the US module is built.
> For the UK launch it is irrelevant.

FARA (Foreign Agents Registration Act) is a **disclosure** law, not a ban. It bites
when activity is **directed by a foreign government or foreign political party**, or
is intended **to promote the interests of** such a principal. The layperson's read is
that a UK *individual* building a neutral civic tool is none of those things, and
that the "other activities" exemption (22 U.S.C. § 613(d)(2)) may apply. **That is a
hypothesis to test with counsel, not a finding.**

What this is NOT: it is **not** a conclusion that the app "does not require FARA
registration." Only a US election/nonprofit attorney can say that, against the actual
funding, control, and editorial facts at the time. Until then, treat the US module as
**legally gated and unshipped.**

## The two real triggers (the "later, with a lawyer" list)

These don't block building. They block *scaling money/voice* without advice:

1. **Funding.** If Khidr takes donations/grants — especially foreign-source money —
   *and* engages in political activity, the analysis changes. Get advice before
   accepting outside money or setting up a 501(c)/PAC-adjacent structure. A US
   founder with a UK financier is also "foreign funding".
2. **Framing.** If the editorial voice shifts from *informing* ("here's what
   happened, here's your rep") to *steering* ("demand they vote no"), we start
   looking like an actor promoting an outcome. Keeping blurbs informational (see
   `curation-guide.md`) is both a product principle and the thing that keeps the
   FARA posture clean.

## Copyright

Covered in `curation-guide.md`. Short version: original blurbs + link-out =
standard, defensible aggregator behaviour. Avoid wire-service reliance.

## App-store / platform terms

- Apple/Google both allow civic-engagement apps. Keep it non-partisan in store
  metadata. "Contact your representatives about news that affects you" reads clean.
- `mailto:`/`tel:` and in-app browser are all standard, allowed APIs.

## Action items before money/entity

- [ ] 1-hour consult with a US election/nonprofit lawyer **before** taking any
      funding or incorporating a US entity.
- [ ] Decide entity + funding model with that advice (likely: US nonprofit, but the
      UK-founder angle is exactly what to ask about).
- [ ] Until then: operate as a free, neutral tool. No donations button yet.
