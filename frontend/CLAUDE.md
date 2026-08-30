# CLAUDE.md

Service-specific commands for `frontend` (Next.js 16 App Router). See the root `CLAUDE.md` for cross-service architecture and rules, and `AGENTS.md` (included below) for full frontend conventions.

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

@AGENTS.md
