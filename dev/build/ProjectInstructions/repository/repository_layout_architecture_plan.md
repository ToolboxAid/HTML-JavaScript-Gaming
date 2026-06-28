# Repository Layout Architecture Plan

Status: Proposed
Owner: Owner
Scope: Documentation/governance only

## Purpose

Document the proposed repository architecture simplification before any file moves occur.

This plan does not authorize moving files, changing runtime behavior, changing package commands, or mixing feature work into layout migration PRs.

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

## Proposed Stacked PR Sequence

1. `www/` shell and governance
   - Create the destination shell and document browser-served ownership.
   - Do not move product pages yet.

2. `api/` shell and governance
   - Create the destination shell and document API/server ownership.
   - Do not move API/runtime implementation yet.

3. Browser-served public section moves
   - Move root browser-served product sections into `www/` in small groups.
   - Preserve routes through compatibility redirects or server/static configuration as needed.

4. Browser asset moves
   - Move browser assets into `www/` ownership.
   - Preserve asset URLs or update references in the same PR.

5. API/server moves
   - Move Node/API/server entry points and service code into `api/`.
   - Preserve API contract shape and route behavior.

6. Runtime/shared source boundary cleanup
   - Move deployable browser/runtime/API modules into `www/` or `api/` ownership as appropriate.
   - Keep shared runtime dependency direction explicit.

7. Developer bootstrap and validation updates
   - Update local developer bootstrap and validation paths after deployable surfaces are moved.
   - Keep `dev/` developer-only.

8. Legacy path cleanup
   - Remove or archive obsolete empty folders and compatibility shims only after validation proves they are unused.

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

