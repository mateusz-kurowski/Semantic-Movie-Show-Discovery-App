# CLAUDE.md

Service-specific commands for `frontend` (Next.js 16 App Router). See the root `CLAUDE.md` for cross-service architecture and rules, and `AGENTS.md` (included below) for full frontend conventions.

## Commands

```bash
bun run dev              # local dev server (next dev)

bun run lint             # lint + format check (= biome check)
bunx @biomejs/biome check --write .   # lint + format, autofix

bunx tsc --noEmit        # type check — must stay clean
bunx next typegen        # regenerate route types after moving/renaming routes
```

No test runner is installed yet (`AGENTS.md` documents the intended Vitest + Testing Library setup) — there is no single-test command to run until that's set up.

@AGENTS.md
