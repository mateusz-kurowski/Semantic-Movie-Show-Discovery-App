# CLAUDE.md

Service-specific commands for `catalog-api` (TypeScript / Elysia / Bun). See the root `CLAUDE.md` for cross-service architecture and rules.

## Commands

```bash
bun run --watch src/index.ts     # local dev server (also: `bun run dev`)

bunx @biomejs/biome check .              # lint + format check
bunx @biomejs/biome check --write .      # lint + format, autofix

bunx drizzle-kit generate        # generate a migration from schema changes
bunx drizzle-kit migrate         # apply migrations
```

No unit test suite is configured (`bun run test` is a stub that exits 1) — there is no single-test command to run.
