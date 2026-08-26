# CLAUDE.md

Service-specific commands for `catalog-ingester` (Go). See the root `CLAUDE.md` for cross-service architecture and rules.

## Commands

```bash
go run .                                    # local dev run (per INGEST_PERIOD_SECONDS)

go test ./...                               # all tests
go test -run TestBuildSemanticText ./...    # single test by name
go test -run TestBuildSemanticText -v ./...       # single test, verbose

golangci-lint run --fix                     # lint (strict config, see .golangci.yml)
go fmt ./...                                # format
```

Coverage gate (`testcoverage.yml`): 70% per file, 80% per package, 80% total, profile `cover.out`.
