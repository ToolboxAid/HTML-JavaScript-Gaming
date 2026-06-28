# Repository Layout Architecture Plan

Status: Active Scaffold
Owner: Owner
Scope: Documentation/governance only

## Purpose

Document the proposed repository architecture simplification before any file moves occur.

This plan does not authorize moving files, changing runtime behavior, changing package commands, or mixing feature work into layout migration PRs.

## Current Migration Status

`PR_26180_OWNER_005-repository-layout-scaffold` created the empty canonical destination shells:

- `www/`
- `api/`
- `dev/local-runtime/`

`PR_26180_OWNER_006-www-migration-map` documents the current browser-served surface and safe move requirements before any browser files move into `www/`.

No browser, API, server, test, script, or runtime files move in the scaffold or migration-map PRs.

## Proposed Future Layout

```text
www/
api/
dev/
```

### www/

`www/` is the browser-served application.

It will own deployable browser pages, browser assets, and static application entry points currently spread across root product folders, `assets/`, `docs/`, `games/`, `toolbox/`, and browser-facing runtime surfaces.

`www/` must not own authoritative product data.

### api/

`api/` is the Node/API/server application.

It will own server entry points, API routing, API services, environment adapters, database access, storage access, server-side setup, and deployable API/runtime support code.

`api/` owns the Browser -> API -> Postgres/R2 boundary.

### dev/

`dev/` is the developer-only workspace.

It owns Project Instructions, governance, architecture docs, reports, tests, scripts, templates, local developer bootstrap, generated output, zips, logs, and historical archive material.

Production runtime, browser application code, and API deployment code must never depend on `dev/`.

## Deployment Model

The proposed target deployment model has two deployable application surfaces:

- `www/` deploys the browser-served application.
- `api/` deploys the Node/API/server application.

`dev/` is not deployed as product runtime and must be excluded from runtime dependency paths.

Environment differences remain governed by `.env` values and environment-managed secrets. The same deployable browser and API code paths must be promoted through Local, DEV, IST, UAT, and PROD.

## Browser/API/Database Flow

Required product-data flow:

```text
Browser -> API -> Postgres/R2
```

Rules:

- Browser code reads and writes authoritative product data only through the API/service contract.
- Product metadata is persisted in Postgres.
- Product assets are persisted in Cloudflare R2.
- Browser storage, page arrays, source JSON files, `/tmp`, and dev workspace files are not authoritative product-data sources.
- Seed data is allowed only when it seeds the database through server/API/setup ownership.

## Developer Local-Runtime Flow

Local development may use the team-aware developer bootstrap and local runtime support, but the runtime boundary remains the same:

```text
Developer command -> dev bootstrap -> local www server + local api server -> Postgres/R2 or approved local provider
```

Current local bootstrap commands remain unchanged by this plan. This PR does not modify `package.json` commands.

The local developer workflow must continue to prove the same browser/API/database contract that deployed environments use.

## Migration Strategy

Migration must happen through small, reviewable, stacked PRs after this architecture plan is accepted.

Rules:

- No file moves occur in this plan PR.
- No feature work may be mixed into migration PRs.
- Each migration PR moves or rewires one bounded ownership area.
- Each migration PR must preserve the same product behavior unless the PR is explicitly a behavior change.
- Each migration PR must update references, validation, reports, and ZIP artifacts for only its scoped move.
- Each migration PR must include rollback notes or clear validation evidence.

## Active Stacked PR Sequence

1. `PR_26180_OWNER_005-repository-layout-scaffold`
   - Create `www/`, `api/`, and `dev/local-runtime/` shells.
   - Update architecture docs and backlog status only.

2. `PR_26180_OWNER_006-www-migration-map`
   - Document current browser-served root paths, imports, local server behavior, test assumptions, compatibility needs, and validation lanes.
   - Do not move browser files or change package commands.

3. `PR_26180_OWNER_007-www-route-root-compatibility`
   - Prepare runtime/test route-root compatibility for the future `www/` move.
   - Preserve public URLs.
   - Keep repository-root serving as the default until the actual move.

4. `PR_26180_OWNER_008-move-www-application`
   - Move browser-served application files into `www/`.
   - Include root HTML pages, `assets/`, `toolbox/`, `account/`, `legal/`, `learn/`, `play/`, and other browser-served static routes.
   - Update internal static references only as needed.
   - Do not move API/server files.

5. `PR_26180_OWNER_009-move-api-application`
   - Move server/API application files into `api/`.
   - Include Local API server runtime files, API routes, services, database, storage, auth, publishing, and admin server code.
   - Do not move developer-only startup orchestration.
   - Browser code must not import from `api/`.

6. `PR_26180_OWNER_010-move-dev-local-runtime`
   - Move developer-only local runtime into `dev/local-runtime/`.
   - Include team-aware bootstrap, port config, local startup orchestration, local diagnostics, and browser launch support.
   - Update `package.json` commands to point to the new local-runtime paths.

7. `PR_26180_OWNER_011-move-tests-and-validation`
   - Ensure all tests and validation suites live under `dev/tests/` or the current canonical dev test structure.
   - Update test paths after the `www/`, `api/`, and `dev/` migrations.
   - Do not change behavior.

8. `PR_26180_OWNER_012-update-ci-and-scripts`
   - Update CI, package scripts, validation scripts, and developer utilities for the new layout.
   - Preserve `npm run dev:bootstrap`, `npm run dev:api`, `npm run dev:web`, and `npm run dev:local-api`.

9. `PR_26180_OWNER_013-remove-legacy-layout`
   - Remove or retire obsolete legacy paths after all references are updated.
   - Hard stop if any runtime, test, or CI reference still points to old locations.

10. `PR_26180_OWNER_014-final-layout-validation`
   - Validate final repository layout.
   - Confirm `www/` owns the browser-served app, `api/` owns the server app, and `dev/` owns the developer workspace.
   - Confirm runtime does not depend on `dev/`, browser code does not import `api/`, and legacy references are removed or documented.
   - Mark Repository Architecture Simplification complete in `BACKLOG_MASTER.md`.

## Hard Rules

- No feature work may be mixed into repository layout migration.
- Runtime must never depend on `dev/`.
- Browser code must never own authoritative product data.
- Browser code must use Browser -> API -> Postgres/R2 for product data.
- API/server code must not import from developer-only reports, Project Instructions, tests, or workspace artifacts.
- Migration PRs must not change package commands unless the PR explicitly owns command migration.
- Migration PRs must not introduce Creator-writeable repository folders.
- Migration PRs must not hide behavior changes inside path moves.

## Validation Expectations

Every layout migration PR must at minimum run:

```text
git diff --check
npm run validate:canonical-structure
```

Additional targeted validation must match the moved surface.
