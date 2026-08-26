# SpecBattle Architecture

## 1. Product shape
SpecBattle is a one-page web experience where two phones are compared through a cinematic sequence of spec rounds. Only one spec card occupies the battle arena at a time. A round enters, reveals both devices, resolves the winner, exits, and the next round enters.

## 2. MVP stack
- Next.js App Router
- React + TypeScript
- Motion for React for animation
- PostgreSQL + Prisma
- Server-side API routes/actions for persistence
- Zod for input validation
- Vitest for unit tests; Playwright for browser tests

## 3. Core boundaries
- UI layer: presentation and animation only.
- Battle engine: deterministic scoring and round orchestration; no React dependencies.
- Data layer: Prisma repositories and database access.
- API layer: validates requests and invokes the engine/data services.
- Future realtime layer: WebSocket transport around the same battle state/events, without changing scoring rules.

## 4. Deployment
Browser -> Next.js/Vercel -> API/service layer -> PostgreSQL.
Static assets live under public/. No WebSocket server is required for MVP.

## 5. Future multiplayer
Add an authoritative Battle Room service. Clients send intent (join, ready, rematch); the server emits battle events and owns the canonical state. The battle engine remains shared and deterministic.
