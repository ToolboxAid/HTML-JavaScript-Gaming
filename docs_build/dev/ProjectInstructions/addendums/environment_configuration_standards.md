# Environment Configuration Standards

Status: Approved
Owner: OWNER

## Purpose

Define the official environment configuration standards that build on the OWNER_050 environment model.

This addendum is governance/documentation only. It does not change runtime behavior, API implementation, storage implementation, database DDL, or secret values.

## Source Model

This standard builds on:

```text
Local (VS Code) -> DEV -> IST -> UAT -> PROD
```

The deployable artifact must remain identical across all environments.

Only `.env` values and environment-managed secret values may differ by environment.

Deployable artifacts must not contain environment-specific application code, runtime code, API/service code, database code, storage code, or feature behavior.

## Official Environment Files

Official environment copy-source file names:

- `.env.local`
- `.env.dev`
- `.env.ist`
- `.env.uat`
- `.env.prod`

Runtime startup still loads `.env` only. The official flow is to copy the selected source file to `.env` before validation/startup.

`.env.prd` is legacy technical debt only. Do not introduce new references to `.env.prd` except when documenting migration or historical compatibility.

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

One shared API/service contract is required across Local (VS Code), DEV, IST, UAT, and PROD.

Rules:

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
