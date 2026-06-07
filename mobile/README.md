# Khidr — mobile (Expo + React Native + TypeScript)

A runnable scaffold of the curated feed + native action layer (calls-first,
anti-batch email). Ships with sample data and a **mock** rep-lookup + AI-draft so
it runs with **no API keys**.

## Prerequisites

- **Node.js** (LTS) — *not currently installed on this machine; install it first.*
- The **Expo Go** app on your phone (iOS/Android), or an emulator.

## Run

```bash
cd mobile
npm install
# reconcile any version drift to the installed Expo SDK:
npx expo install --fix
npm start
```

Scan the QR code with Expo Go (or press `i` / `a` for a simulator, `w` for web).

> If `npm install` complains about version mismatches, run
> `npx expo install --fix` — it pins each Expo package to the right version for
> the SDK that resolved.

## What works out of the box

- **Feed** with sample stories (`src/data/sample-feed.json`).
- **Story detail** with "Read the original" → opens in the in-app browser.
- **Call flow**: pick one rep → talking-points script → tap to dial (`tel:`) → log.
- **Email flow**: AI-drafted starter → **Send disabled until you edit it** →
  `mailto:` (or opens the office web form). Khidr never sends for you.
- **Onboarding**: enter ZIP/address once → reps resolved (mock) → cached locally.

## Wiring real services later

| Concern | File | What to do |
|---|---|---|
| MP lookup (UK) | `src/services/reps.ts` | `UkRepProvider` is live and key-less (postcodes.io + UK Parliament Members API). See `docs/uk-plumbing.md`. Swap to `MockRepProvider` for offline demos. |
| AI draft assist | `src/services/draft.ts` | Point `generateDraft()` at your backend (which calls Claude). Keep the edit-before-send rule. |
| Curated feed | `src/data/sample-feed.json` | Replace with a fetch from your CMS/JSON endpoint. |
| Send modes | `app/action/*` | Email via `mailto:`; WriteToThem via in-app browser; `tel:` for calls. Khidr never transmits. |

## Project structure

```
mobile/
├── app/                      ← expo-router screens (file-based routing)
│   ├── _layout.tsx
│   ├── index.tsx             ← feed
│   ├── onboarding.tsx        ← collect address once
│   ├── reps.tsx              ← your representatives
│   ├── item/[id].tsx         ← story detail
│   └── action/
│       ├── call.tsx          ← script + tap-to-dial
│       └── email.tsx         ← AI draft + edit-to-send
└── src/
    ├── components/RepPicker.tsx
    ├── services/{reps,draft}.ts
    ├── store/location.ts
    ├── data/sample-feed.json
    ├── types.ts
    └── theme.ts
```

## Design principles baked into the code

- **Calls-first** — calls are the proven pressure mechanism.
- **One rep at a time** — `RepPicker` has no "select all"; this is deliberate.
- **Edit-to-send** — `hasBeenEdited()` gates the email Send button so unedited AI
  copy can't be blasted (it reads as astroturf at scale).
- **Inform, don't instruct** — call points are *points to raise*, not demands.
