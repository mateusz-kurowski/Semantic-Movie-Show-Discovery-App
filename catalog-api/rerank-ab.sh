#!/usr/bin/env bash
# A/B comparison for RRF vs Voyage-reranked-results ordering.
# Rerank is env-controlled, so run this script twice and diff:
#
#   RERANK_ENABLED=false ./rerank-ab.sh > /tmp/run-rrf.txt
#   # restart the api with RERANK_ENABLED=true
#   RERANK_ENABLED=true ./rerank-ab.sh > /tmp/run-reranked.txt
#   diff /tmp/run-rrf.txt /tmp/run-reranked.txt
#
# Usage: ./rerank-ab.sh [base-url] [topK]
set -euo pipefail

BASE_URL="${1:-http://localhost:8080/api}"
TOP_K="${2:-5}"

command -v curl >/dev/null || { echo "curl is required" >&2; exit 1; }
command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }

QUERIES=(
  "cozy rainy-day mystery with an amateur detective"
  "lonely astronaut drifting in space"
  "feel-good underdog sports story"
  "90s family adventure with kids on bikes"
  "slow-burn revenge thriller in the snow"
  "spider-man 2002"
)

for q in "${QUERIES[@]}"; do
  echo "=== QUERY: $q"
  body=$(jq -n --arg phrase "$q" --argjson topK "$TOP_K" '{phrase: $phrase, topK: $topK}')
  curl -s --fail "$BASE_URL/search/hybrid" \
    -H 'Content-Type: application/json' \
    -d "$body" |
    jq -r '.[] | "\(.payload.title) (\(.payload.release_date // "?"))"'
  echo
done
