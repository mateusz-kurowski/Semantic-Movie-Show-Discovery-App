<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

Service-specific commands for `frontend` (Next.js 16 App Router). See the root `AGENTS.md` for cross-service architecture and rules.

## Commands

```bash
bun run dev              # local dev server (next dev)

bun run lint             # lint + format check (= biome check)
bunx @biomejs/biome check --write .   # lint + format, autofix

bunx tsc --noEmit        # type check — must stay clean
bunx next typegen        # regenerate route types after moving/renaming routes

bun run test             # unit tests (= vitest run)
bun run test:watch       # unit tests in watch mode
bun run test movie-card  # single file — vitest filters by path substring
```

# Frontend Development Guidelines

This project is a Next.js 16 App Router application (React 19, TypeScript, Tailwind CSS v4, shadcn/ui on Base UI, TanStack Query, Biome). Follow these rules unless the code in front of you proves otherwise.

## Next.js (App Router)

- **App Router only.** All routes live under `app/`. Route groups like `app/(main)/` do not affect the URL; they group pages sharing a layout. Page folders use `page.tsx`; scoped components live in `_components/` inside the route folder (see `app/(main)/search/_components/`).
- **Server Components by default.** Pages are server components unless they need hooks, browser APIs, or event handlers — then add `"use client"` at the top of the file and nothing else.
- **Before writing any Next.js code, consult the local docs** in `node_modules/next/dist/docs/` (`01-app/02-guides`, `01-app/03-api-reference`). Heed deprecation notices — this is Next.js 16, not the version in your training data.
- Use `next/link` (`Link`) for internal navigation, never raw `<a>`.
- Dynamic routes: `app/(main)/movies/[movieId]/page.tsx` — the segment name is the prop name (`{ params }: { params: Promise<{ movieId: string }> }` in async server components).
- Client-side data fetching goes through TanStack Query (`useQuery`); the API layer lives in `lib/api/*` (e.g. `lib/api/movies.ts`). Keep `fetch` calls in the `lib/api` layer, not in components.
- Environment variables for the browser must be prefixed `NEXT_PUBLIC_` (e.g. `NEXT_PUBLIC_SEARCH_API_URL`). Never commit real secrets.
- Regenerate route types after moving/renaming routes: `bunx next typegen`, then `bunx tsc --noEmit`. Stale `.next/types/` artifacts from deleted routes must be removed.

## React Development

- Function components and hooks only. Follow the Rules of Hooks — no conditional hook calls, no hooks in loops; use `useCallback`/`useMemo` only when there is a measurable reason.
- Server state (API data) goes in TanStack Query (`@tanstack/react-query`); local UI state uses `useState`. No hand-rolled fetching in components.
- Forms use `react-hook-form`; validation with `@hookform/resolvers`. Prefer the existing component library (`components/ui/*`, shadcn-style) over new markup.
- Every async view needs explicit states: pending, error, empty, success (existing pattern: `isPending`, `isError`, `data` in query hooks; `Loading...` / `Error: ...` placeholders).
- Keys on lists: `key={item.id}` or a stable unique field — never the array index.
- Keep components small and single-purpose. Colocate non-reusable pieces next to their page in `_components/`; share only genuinely reused pieces in `components/`.

## Unit Tests

- **Setup:** **Vitest** + **@testing-library/react** + **jsdom**, configured in `vitest.config.mts` (jsdom environment, `@` alias, `NEXT_PUBLIC_SEARCH_API_URL` stubbed) and `vitest.setup.ts` (jest-dom matchers, per-test cleanup, jsdom shims for `scrollBy`/pointer capture/`ResizeObserver`/`matchMedia`). `test/render.tsx` exports `renderWithQuery` for components that read from TanStack Query.
- Test files are colocated next to the code: `lib/api/movies.test.ts`, `components/.../component.test.tsx`. Use `*.test.ts(x)` naming.
- Focus tests on: the `lib/api/*` service layer (mock `fetch` or inject a mock client), query hooks, forms (submit + validation), and pure helpers/enums. Prefer behavior assertions (`render`, `fireEvent`/`userEvent`, `screen.getByRole`) over implementation details.
- Mock boundaries: mock `@/lib/api/*` modules and `next/navigation` — never hit the real network, and never mock the component under test's own internals.
- Run `bun run test` (or `bunx vitest run`) and `bunx tsc --noEmit` before finishing. Tests are not covered by Biome — lint and tests are separate gates.

## Compliance with Good Practices

- Follow the existing coding style, naming, and project structure; prefer editing existing files over creating new ones.
- TypeScript: no `any`/`as unknown` casts without a commented reason; prefer explicit types on exported functions and props. Run `bunx tsc --noEmit` — the project must stay type-clean.
- No `console.log`/`debugger` leftovers; no dead code, unused imports, or commented-out blocks.
- Accessibility: semantic HTML, labels on form fields, `alt` on images, keyboard-operable controls, sufficient contrast.
- Error handling: don't swallow errors — surface them in the UI with the existing state pattern.
- No hardcoded secrets, credentials, or personal data. No new dependencies unless they add clear value — prefer the existing stack (Base UI, shadcn, TanStack, Tailwind v4, lucide-react icons).

## BiomeJS Linting

- **The command is `bun run lint` (= `biome check`)**. Run it before finishing any change; fix with `bunx @biomejs/biome check --write <files>` for safe autofixes (formatting, import organization).
- The project config lives in `biome.json`: indent with **tabs**, **double quotes**, `organizeImports` on, `recommended` preset plus `next`/`react` recommended domains, VCS integration on (`.gitignore` respected), and `files.ignoreUnknown: false` — unknown file types are errors, not silently skipped.
- **Never pass CLI flags that override `biome.json`** (e.g. `--files-ignore-unknown=true`). CLI flags win over config and make the hook behave differently from `bun run lint` — this exact bug was fixed in `.lefthook.yml`.
- `.lefthook.yml` runs biome on staged files pre-commit (with `--write`, `stage_fixed: true`) and on push. Files under `design/` are excluded via `linter.includes` — do not lint them.
- Do not disable lint rules or add `biome-ignore` comments without a strong, commented justification; prefer fixing the underlying issue.
- The config `$schema` may lag the CLI version — the schema-version warning is informational; if you touch `biome.json`, align `$schema` with the installed CLI (`bunx biome migrate`).
