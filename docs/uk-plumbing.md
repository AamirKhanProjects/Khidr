# Khidr — UK Plumbing Report

How Khidr routes a user to their MP and lets them act, using only free, official
or open APIs. The UK path is simpler than the US one, has no API costs, and removes
the FARA / foreign-national problem entirely: a UK person building a UK tool for UK
people to contact UK MPs is ordinary civic engagement.

> **Confirm on first build.** The endpoints and data below were verified with live
> calls (most recently 2026-06-06: `M14 5SU` → Manchester Rusholme → Afzal Khan, id
> 4671, with phone and `@parliament.uk` email). The underlying *facts* are real, but
> field names like `parliamentary_constituency_2024` and the exact response shape of
> `/Location/Constituency/Search → currentRepresentation.member` can drift. Treat
> this as "very likely right, re-run the three calls before you build against them",
> not as gospel. A 20-minute check saves a debugging afternoon.

## 1. The routing chain (postcode → MP → contact)

Three calls, no key, all official/open. Last verified live 2026-06-06.

### Step 1 — postcode → constituency
`GET https://api.postcodes.io/postcodes/{postcode}`

- Use the **`parliamentary_constituency_2024`** field (the current 650-seat set
  after the 2024 boundary review). Do **not** use the legacy
  `parliamentary_constituency` field.
- Also returns the ONS constituency code under `codes.parliamentary_constituency_2024`
  (e.g. `E14001172`), useful as a stable identifier.
- Validate first with `GET /postcodes/{postcode}/validate`; offer
  `GET /postcodes/{postcode}/autocomplete` for typeahead.
- Free, no key, open data (OGL / OS OpenData). Self-hostable if we ever need to.

> Verified: `SW1A 1AA` → `parliamentary_constituency_2024: "Cities of London and
> Westminster"`, code `E14001172`.

### Step 2 — constituency → current MP
`GET https://members-api.parliament.uk/api/Location/Constituency/Search?searchText={name}`

- Returns the constituency with `currentRepresentation.member`, i.e. the sitting
  MP's `id`, `nameDisplayAs`, and `latestParty`.
- Match on the constituency name from Step 1 (the 2024 name lines up with the
  Members API's current constituencies).
- Free, no key. Official UK Parliament API. Open Parliament Licence.

> Verified: "Cities of London and Westminster" → MP id `5257`, "Rachel Blake",
> Labour (Co-op).

### Step 3 — MP → contact details
`GET https://members-api.parliament.uk/api/Members/{id}/Contact`

- Returns an array of contact blocks. The useful ones:
  - **Parliamentary office**: `phone` and `email` (the `@parliament.uk` address).
  - **Constituency office**: often a casework `email`, sometimes a local `phone`.
  - Social links (Instagram, X) which we ignore.
- Photo: `GET https://members-api.parliament.uk/api/Members/{id}/Thumbnail`.
- Free, no key.

> Verified: id `5257` → phone `0207 219 6543`, email
> `rachel.blake.mp@parliament.uk`.

**That is the whole lookup.** No Geocodio, no Cicero, no point-in-polygon, no
paid datasets. One MP per person, no senators or sub-districts.

## 2. The three send modes, mapped to the UK

Khidr is a router, not a sender (see `product-spec.md`). UK norms are more
email-led than the US phone-pressure culture, so in the UK module **email /
WriteToThem lead and calling is secondary** (still offered, still one-tap).

1. **Email the MP** — `mailto:` to the `@parliament.uk` address from Step 3, with a
   pre-filled, personally-edited draft. Opens the user's own mail app. No campaign
   metadata, sent from the user's own address.
2. **WriteToThem** — open `https://www.writetothem.com/` in the in-app browser.
   This is the trusted UK civic channel and the analogue of the US "contact form".
   Crucially, **WriteToThem itself blocks mass-identical messages and vexatious
   patterns** — its design reinforces our anti-astroturf ethic. It has no bulk API
   by deliberate policy, which is exactly why we hand off to it rather than
   automate it.
3. **Call** — tap-to-dial the parliamentary or constituency office `phone` from
   Step 3. Secondary in the UK, but kept for users who prefer it.

When a field is missing (some MPs lack a public direct email or a constituency
phone), fall back to WriteToThem, which always works.

## 3. The outcome loop, bills, and voting (for the "follow a story" / Impact features)

- **Bills**: `https://bills-api.parliament.uk` (Bills API, free, official) to attach
  the actual legislation to a story, the UK analogue of Congress.gov.
- **Divisions / how your MP voted**: `https://commonsvotes-api.parliament.uk`
  (Commons Votes API, free) gives recorded divisions and each member's vote. This
  powers "your MP voted X" on the Impact screen and the accountability scorecard.
- **Voting summaries / record**: TheyWorkForYou API (`getMP`, `getMPInfo`,
  `getConstituency`) is free with an API key. Note: TheyWorkForYou explicitly does
  **not** serve MP contact details, so use it for voting record / Hansard context,
  and the Members API for contact.
- **Committee memberships**: `https://committees-api.parliament.uk` (Committees API,
  free) exposes `/commonscommitteememberships` (member, committee, dates). This powers
  the "your MP is on the relevant committee" flag, with no human judgement: cross the
  attached bill's committee with the MP's memberships. The only human step is the
  editor attaching the right bill to the story.
- **Upcoming business (caveat)**: future scheduled votes live in the Commons Order
  Paper / Future Business (`commonsbusiness.parliament.uk`), published as documents
  rather than a clean per-story field. Treat "a vote is scheduled" as **editorial
  glue to avoid**, not an API fact. Surface timing only through the curated story
  itself, not as a separate maintained claim.

## 4. Data sources at a glance

| Need | Source | Key? | Cost | Licence / notes |
|---|---|---|---|---|
| postcode → constituency (2024) | postcodes.io | No | Free | OGL / OS OpenData; self-hostable |
| constituency → MP | UK Parliament Members API | No | Free | Open Parliament Licence |
| MP contact (phone/email) | Members API `/Contact` | No | Free | Same |
| MP photo | Members API `/Thumbnail` | No | Free | Same |
| Send: email | OS `mailto:` handoff | No | Free | User's own client |
| Send: WriteToThem | writetothem.com (in-app browser) | No | Free | No bulk API by policy; link only, never scrape/auto-send |
| Bills | Bills API | No | Free | Open Parliament Licence |
| How MP voted | Commons Votes API | No | Free | Open Parliament Licence |
| Voting record / Hansard | TheyWorkForYou API | Yes (free) | Free | Attribution + rate limits; nonprofit use fine |

## 5. Caveats and gotchas (read before building)

- **Use the 2024 constituency field.** The 2024 boundary review changed almost
  every seat. `parliamentary_constituency_2024` is correct; the legacy field is not.
- **Handle missing contact fields.** Constituency phone is frequently null; a few
  MPs have no public direct email. Always fall back to WriteToThem.
- **Westminster only for v1.** Everyone has exactly one Westminster MP, which is the
  whole audience. Devolved reps (MSPs in Scotland, MSs in Wales, MLAs in NI) are
  separate bodies with their own TheyWorkForYou endpoints; treat as a later layer.
- **Northern Ireland nuance.** Some NI MPs (e.g. Sinn Féin) abstain from Westminster.
  They still have contact details and constituents can still write; just do not
  imply a Commons vote where the member abstains.
- **Be a polite client.** Cache lookups (postcode → MP changes rarely between
  elections). Do not hammer postcodes.io or the Members API; both are free goodwill
  services. Cache contact details and refresh periodically.
- **WriteToThem terms.** Link and hand off only. Never scrape it or attempt to send
  through it programmatically; that breaks its terms and its anti-astroturf purpose.
- **Vacancies.** Between an MP's death/resignation and a by-election a seat can have
  no sitting member; `currentRepresentation.member` can be null. Show a "seat
  currently vacant" state.

## 6. Architecture: one shell, swappable country module

Build the app shell (feed + Today + action UI + onboarding) once, country-agnostic.
Put everything country-specific behind a `CountryModule` interface:

```
interface CountryModule {
  lookupByPostcodeOrZip(input: string): Promise<Representative[]>;
  sendModes: ("call" | "email" | "writetothem" | "webform")[];
  billSource: ...;      // Bills API (UK) | Congress.gov (US)
  votingSource: ...;    // Commons Votes (UK) | Congress roll calls (US)
}
```

- **UK module (now):** postcodes.io + Members API + WriteToThem + Bills/Commons
  Votes. Email/WriteToThem-first. Legally clean.
- **US module (later):** Geocodio/Cicero + Congress.gov + tap-to-dial. Calling-first.
  Gated on US legal clearance and someone with US standing.

"Both" is the architecture from day one; "UK first" is the launch.
