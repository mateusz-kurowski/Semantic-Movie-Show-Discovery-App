---
name: frontend-nextjs16
description: Guides Next.js 16 App Router frontend edits with server components and TanStack Query. Use when editing anything under frontend/.
---

# Frontend Next.js 16

Stack: Next.js 16 App Router, React 19, Tailwind v4, shadcn/BaseUI, TanStack Query, Biome. Colocated Vitest + React Testing Library + jsdom (`*.test.*`).

## Before writing Next.js code

- MUST consult `node_modules/next/dist/docs` first for the relevant API (routing, caching, server/client boundaries) before writing or changing Next.js code.

## Conventions

- App Router with server components by default; add `"use client"` only where interactivity/data-fetching requires it.
- Data fetching via TanStack Query through `frontend/lib/api` (or the established `lib/` path) — follow existing query patterns, keep loading/error states explicit.
- Mobile-friendly, keyboard-accessible UI; follow the established design system and existing component patterns; prefer incremental changes.
- After route moves/adds: run `bunx next typegen` so generated route types stay current.
- Version display: footer imports `version` from `package.json` — never hardcode it.

## Commands (run in `frontend/`)

- Dev: `bun run dev` (start before Playwright screenshot/click-through of a UI change).
- Type safety: `bunx tsc --noEmit` must be clean.
- Tests: `bun run test` (Vitest colocated suites; pre-push hook runs these).
- Lint/format: `bun run lint` / Biome. Repo style is tabs + double quotes — never override `biome.json` with CLI flags.

## Verify

- `bunx tsc --noEmit` clean + `bunx next typegen` after route changes.
- `bun run test` passes; `bun run lint` clean.
- For UI changes, screenshot or drive sign-in → search → watchlist via the `playwright` MCP server.
