# Environment Governance Model

Status: Approved
Owner: OWNER

## Purpose

Define the official Game Foundry Studio environment model and the invariance rules that keep promotion, deployment, API/service contracts, auth, database, and storage consistent from local development through production.

## Official Environment Model

The official environment model is:

```text
Local (VS Code) -> DEV -> IST -> UAT -> PROD
```

Environment stages:

- `Local (VS Code)`
- `DEV`
- `IST`
- `UAT`
- `PROD`

The old three-letter production abbreviation is not an official environment name for new governance text. Existing `.env.prd` file naming is treated only as a legacy copy-source filename for PROD values until a separately scoped rename is approved.

## Environment Invariance Rule

The deployable artifact must be identical across Local (VS Code), DEV, IST, UAT, and PROD.

Only `.env` values and environment-managed secret values may differ between environments.

Do not vary these by environment name:

- application code
- runtime code
- API/service code
- API/service contract shape
- database runtime scripts
- migration shape
- bundles
- product behavior

## Shared API/Service Contract

One shared API/service contract is required across all environments.

Rules:

- Browser/UI/runtime code must consume the same API/service contract in Local (VS Code), DEV, IST, UAT, and PROD.
- Environment-specific endpoints, keys, buckets, credentials, and prefixes are configuration values only.
- Do not create environment-specific API/service contracts.
- Do not branch API/service behavior by environment name.

## Required Services

Every environment requires:

- Supabase Auth
- Supabase Postgres
- Cloudflare R2

Mock, memory, fixture, or legacy database adapters may be used only when separately scoped as test/dev tooling. They are not the official runtime service model.

## Guest Seed Data

All environments receive approved guest seed data for all tools.

Rules:

- Guest seed data is shared environment setup data, not an environment-specific behavior fork.
- Guest seed data must be applied through the shared data/service contract.
- Guest seed data must not require per-environment application code.

## R2 Prefixes

Required Cloudflare R2 top-level prefixes:

- Local (VS Code): `/local/`
- DEV: `/dev/`
- IST: `/ist/`
- UAT: `/uat/`
- PROD: `/prod/`

Derived paths must stay under the matching top-level prefix. Examples:

- Local project assets: `/local/projects/`
- DEV project assets: `/dev/projects/`
- IST project assets: `/ist/projects/`
- UAT project assets: `/uat/projects/`
- PROD project assets: `/prod/projects/`
- Local Postgres backups: `/local/backups/postgres/`
- DEV Postgres backups: `/dev/backups/postgres/`
- IST Postgres backups: `/ist/backups/postgres/`
- UAT Postgres backups: `/uat/backups/postgres/`
- PROD Postgres backups: `/prod/backups/postgres/`

## Database Direction

Postgres is the authoritative active runtime database for the official environment model.

SQLite is deprecated/retired and is not an active runtime database for Local (VS Code), DEV, IST, UAT, or PROD.

Rules:

- New database work must target Postgres.
- Do not introduce new SQLite runtime persistence.
- Do not introduce new SQLite services, DDL, or seed data.
- Existing SQLite references may remain only as documented technical debt when already present.

## Scope Boundary

This governance addendum defines documentation and configuration contract rules only. It does not change runtime code, API implementation code, storage implementation code, database DDL, or secret values.
