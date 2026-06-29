# Environment Configuration Standards

Status: Approved
Owner: OWNER

## Purpose

Define the official environment configuration standards that build on the OWNER_050 environment model.

This addendum is governance/documentation only. It does not change runtime behavior, API implementation, storage implementation, database DDL, or secret values.

## Source Model

Canonical environment/API model reference: `dev/build/ProjectInstructions/addendums/environment_governance_model.md`.

This file owns environment variable names, URL configuration, R2 prefix configuration, and feature flag configuration only.

This standard builds on:

```text
Local (VS Code) -> DEV -> IST -> UAT -> PROD
```

The deployable artifact must remain identical across all environments.

Only `.env` values and environment-managed secret values may differ by environment.

Deployable artifacts must not contain environment-specific application code, runtime code, API/service code, database code, storage code, or feature behavior.

## Official Environment Files

Only `.env.example` is committed to the repository.

Real `.env` files are user/environment-owned and must live outside the repo clone or be injected by deployment.

Official external environment copy-source file names when a copy-source file is used outside the repo clone:

- `.env.local`
- `.env.dev`
- `.env.ist`
- `.env.uat`
- `.env.prod`

Example external layout:

- `/env/local/.env`
- `/env/dev/.env`
- `/env/ist/.env`
- `/env/uat/.env`
- `/env/prod/.env`
- `/GFS/` repo clone

The app/runtime reads `.env` values supplied by the target environment.

Runtime startup still reads `.env` values only. The official flow is for each environment to supply those values from outside the repo clone or through deployment injection before validation/startup.

`.env.prd` is legacy technical debt only. Do not introduce new references to `.env.prd` except when documenting migration or historical compatibility.

## Runtime Placement Policy

Local `.env` may exist at repository root for developer startup only.

Root `.env` is user/environment-owned, ignored, and never deployed as part of `www/` or `api/`.

Production uses deployment environment variables and environment-managed secrets instead of committed `.env` files.

`www/` must never contain secrets or environment-owned `.env` files.

`api/` reads environment values from `process.env` and the deployment environment.

## Environment Identity

Allowed `GAMEFOUNDRY_ENVIRONMENT` values:

- `local`
- `dev`
- `ist`
- `uat`
- `prod`

`GAMEFOUNDRY_ENVIRONMENT` identifies the active configuration lane. It must not cause application, runtime, API/service, database, storage, or feature behavior forks.

`GAMEFOUNDRY_ENVIRONMENT_LABEL` is display-only. It may be used for visual labels and diagnostics, but must not drive runtime behavior, API/service selection, database selection, storage selection, or feature behavior.

## Host And Domain Configuration

Local (VS Code) uses `127.0.0.1` hostnames.

DEV, IST, UAT, and PROD use configured `*.gamefoundrystudio.com` hostnames.

Host/domain differences are configuration values only. They must not create separate deployable artifacts or environment-specific code.

## R2 Prefix Configuration

Required Cloudflare R2 top-level prefixes:

- Local (VS Code): `/local/`
- DEV: `/dev/`
- IST: `/ist/`
- UAT: `/uat/`
- PROD: `/prod/`

R2 project, backup, export, import, or future storage paths must stay under the matching environment prefix.

## API/Service Contract Configuration

The canonical shared API/service contract rule lives in `dev/build/ProjectInstructions/addendums/environment_governance_model.md`.

This section owns configuration-only API URL requirements:

- API URLs may differ by `.env` only.
- Do not split Local API and Public API contracts.
- Do not create environment-specific API/service contracts.
- Browser/UI/runtime code must use the same API/service contract shape in every environment.

## Feature Flag Governance

Feature flags must not create permanent environment-specific behavior.

Allowed feature flag uses:

- staged rollout
- testing
- emergency mitigation

Feature flags must be removed, promoted to normal behavior, or documented as active temporary controls when the rollout, test, or mitigation ends.

Feature flags must not become a substitute for the environment invariance rule.
