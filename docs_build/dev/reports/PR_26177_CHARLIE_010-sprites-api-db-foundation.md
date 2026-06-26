# PR_26177_CHARLIE_010-sprites-api-db-foundation

Status: PASS
Team: Charlie
Branch: PR_26177_CHARLIE_010-sprites-api-db-foundation
Date: 2026-06-26
Base branch: main

## Scope

This PR adds the Sprites API and database foundation only. It does not change the Sprites UI and does not implement import, preview, search, reference viewer, or final Playwright polish.

## Implementation Summary

- Added `src/dev-runtime/sprites/sprites-postgres-service.mjs`.
- Exposed shared Local API routes under `/api/sprites/records`.
- Added Postgres DDL/DML/seed artifacts for grouped Sprites ownership.
- Registered Sprites product data tables for provider/product snapshots.
- Added targeted service and Local API contract tests.

## API Contract

The foundation exposes:

- `GET /api/sprites/records`
- `GET /api/sprites/records/:key`
- `POST /api/sprites/records`
- `POST /api/sprites/records/:key`
- `POST /api/sprites/records/:key/archive`
- `POST /api/sprites/records/:key/delete`

Guest browsing is allowed through GET routes. Write routes require a signed-in actor key through the server API session.

## Database Foundation

Grouped database artifacts:

- `docs_build/database/ddl/sprites.sql`
- `docs_build/database/dml/sprites.sql`
- `docs_build/database/seed/sprites.json`
- `docs_build/database/seed/guest/sprites.json`

Owned tables:

- `sprite_records`
- `sprite_usage_references`

`sprite_records` includes server-owned audit fields:

- `key`
- `createdAt`
- `updatedAt`
- `createdBy`
- `updatedBy`

The API/service layer generates record keys and audit values. Browser-created keys are ignored and never trusted as authoritative.

## Palette/Colors Boundary

Sprites does not store reusable color definitions. It stores Palette/Colors references only through `paletteColorKeys`.

The service rejects payload keys that would transfer reusable color ownership into Sprites:

- `colors`
- `hex`
- `palette`
- `paletteColors`
- `swatches`

## Validation Summary

- PASS: `node ./scripts/run-node-test-files.mjs tests/dev-runtime/SpritesPostgresService.test.mjs tests/api/sprites/contract.test.mjs`
- PASS: `git diff --check`
- PASS: no `start_of_day` paths changed.
- PASS: no browser storage SSoT, MEM DB, local-mem, fake-login, imageDataUrl, or silent fallback terms added in Sprites foundation files.
- PASS: no runtime UI changes.
- NOTE: `tests/dev-runtime/SupabaseProductDataCutover.test.mjs` was attempted twice because product table metadata changed. It timed out both times before producing a failure payload, so it is recorded as a non-blocking broader-lane limitation. Required Sprites API/unit validation passed.

## Playwright

Playwright impacted: No. This PR adds API/database foundation only. UI consumption starts in PR_26177_CHARLIE_011.

## ZIP Artifact

`tmp/PR_26177_CHARLIE_010-sprites-api-db-foundation_delta.zip`
