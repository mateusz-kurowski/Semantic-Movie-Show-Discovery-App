#!/bin/bash

atlas schema apply \
  --url "$DATABASE_URL" \
  --to file://schema.sql \
  --dev-url "docker://postgres/18/dev?search_path=public"