# SpecBattle

> Your Phone vs Mine. Let the Specs Decide.

SpecBattle is a one-page web battle experience that detects the user's device where the browser permits, resolves the detected model against a server-side device specification provider, and presents a sequential category battle.

## Current flow

```text
User phone → browser device hints → Next.js server → MobileAPI.dev → normalized specs → battle engine → cinematic rounds
```

The battle runs one card at a time:

`Battle Start → Performance → Camera → Display → Battery → Storage → Connectivity → Final Verdict`

## Real-device data

The browser collects information it is allowed to expose, including screen metrics, hardware concurrency, memory hints, touch capability, graphics capability, battery state where supported, and network information. High-entropy User-Agent Client Hints are used when available to identify the model.

The server then resolves the model with MobileAPI.dev. The provider API key is server-only and must never use a `NEXT_PUBLIC_` prefix.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Create a MobileAPI.dev account and obtain an API key.
3. Set `MOBILEAPI_KEY` in `.env.local` or your Vercel project environment.
4. Run `npm install` and `npm run dev`.

## Important limitation

A web browser cannot reliably expose every internal phone specification. Camera sensor details, battery capacity, internal storage capacity, and exact chipset information may require the verified model lookup. SpecBattle does not fabricate missing browser data.

## Stack

- Next.js
- TypeScript
- React
- Framer Motion
- PostgreSQL / Prisma (foundation)
- Vercel

## Status

**Real-device integration implemented.** The remaining production dependency is configuring the server environment with `MOBILEAPI_KEY` and testing device-model coverage across target browsers.
