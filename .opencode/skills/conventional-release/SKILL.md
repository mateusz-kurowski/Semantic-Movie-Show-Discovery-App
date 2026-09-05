---
name: conventional-release
description: Applies Conventional Commits and the single-app release-please versioning workflow. Use when committing, squash-merging, or releasing this repo.
---

# Conventional Release

One version for the whole app. The git tag is the source of truth; `release-please` (`.github/workflows/release-please.yml`, config `release-please-config.json`, version `.release-please-manifest.json`) maintains the standing `chore(main): release x.y.z` PR, `CHANGELOG.md`, and `vX.Y.Z` tag on merge.

## Commit format

- `type(scope): summary` — e.g. `fix(catalog-api): validate qdrant vector dimension`.
- Scope to the service directory when service-local (`catalog-api`, `catalog-collector`, `catalog-ingester`, `frontend`).
- Only `feat`, `fix`, and `deps` bump the version. Use `test:` / `refactor:` / `chore:` literally — labelling a refactor as `feat:` ships a minor release.
- Bumps: `feat:` minor, `fix:` patch, `feat!:` / `BREAKING CHANGE:` major (below `1.0.0`, breaking bumps minor instead).

## Release rules

- Squash-merge PRs so intermediate `fix:` commits for unreleased bugs stay out of the changelog.
- Never bump versions by hand. `release-please` rewrites `frontend/package.json`, `catalog-api/package.json`, `catalog-collector/pyproject.toml` via `extra-files` — those numbers are bot-written app versions, not service versions.
- Footer reads the stamped version (`frontend/components/layout/footer/footer.tsx` imports `version` from `package.json`); Coolify auto-deploys `main`, so production runs ahead of the displayed version until the release PR merges.
- Docker `:latest` tracks `main` tip; `:vX.Y.Z` is published only by the `publish-images` job in `release-please.yml`.
