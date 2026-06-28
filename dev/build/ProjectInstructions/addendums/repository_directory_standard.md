# Repository Directory Standard

Status: Approved
Owner: OWNER

## Purpose

Define the target repository directory ownership model for the post-restructure repository.

This document is governance only. It does not move runtime, UI, API, tests, or production files by itself.

## Directory Ownership

- Repository root contains production/public product sections and standard repository configuration only.
- `src/` contains deployable application code.
- `dev/` contains non-deployable build, test, bootstrap, governance, report, and local workspace items.
- `docs/` remains at root because it is production Docs & Help.
- `games/` remains at root because it is public game discovery.
- `toolbox/` remains at root because it is the Creator toolbox/workspace.
- Other public product roots such as `account/`, `admin/`, `legal/`, and `assets/` remain root-level product sections when present.

## Final Src Layer Standard

The final `src/` ownership model is:

- `src/web/` for browser-facing deployable application modules used by public pages, account/admin surfaces, and Creator tools.
- `src/api-runtime/` for deployable API/runtime service modules that back the shared Browser -> API -> Postgres/R2 contract.
- `src/runtime/` for deployable game, tool, engine, and shared runtime capabilities.

Transition rule:

- Existing top-level `src/advanced/`, `src/api/`, `src/dev-runtime/`, `src/engine/`, `src/shared/`, and `src/tools/` directories are legacy transition buckets until explicit migration PRs move them.
- Do not add new top-level `src/` layer names outside `src/web/`, `src/api-runtime/`, or `src/runtime/` without OWNER approval.
- Do not use team names in runtime source filenames.

## Development Workspace Paths

- `dev/build/` owns active development governance, Project Instructions, and PR workflow material.
- `dev/reports/` owns generated reports using flat filenames.
- `dev/tests/` owns non-deployable test suites.
- `dev/scripts/` owns development-only scripts and runners.
- `dev/config/` owns development-only runner and tooling configuration.
- `dev/deploy/` owns development-only deployment assets and local deployment configuration.
- `dev/workspace/` owns generated non-report artifacts and ignored local temporary workspace output.
- `dev/archive/` owns historical development reference material that is not active governance.
- `dev/build/ProjectInstructions/` is the only active Project Instructions source.
- Root `docs_build/`, root `tests/`, root `archive/`, root `tmp/`, and root `project-instructions/` are not active workspace locations after the restructure.
- Root `tmp/` may remain ignored as legacy local scratch only; required Codex ZIPs belong under `dev/workspace/zips/`, and generated temporary artifacts belong under `dev/workspace/tmp/`.

## Legacy Reference Exceptions

Path references to old root `docs_build/`, `tests/`, `archive/`, or `tmp/` locations are allowed only when they are:

- historical/reference content under `dev/archive/` or `dev/build/pr/reference/`
- explicit legacy exception notes in active governance
- ignore rules that keep obsolete local scratch from entering commits
- migration reports documenting the old path and its replacement

Active commands, templates, and Project Instructions must use the final `dev/`, `dev/reports/`, and `dev/workspace/` paths.

## Creator Data Boundary

- Creator data must not write to repository folders.
- Creator metadata must go through the API to Postgres.
- Creator assets must go through the API to Cloudflare R2.
- Repo folders may contain fixtures, templates, governance, and development artifacts only when they are not Creator-owned production data.

## Environment And Runtime Rules

- Postgres is the only active runtime database.
- The same application code path must run across LOCAL, DEV, IST, UAT, and PROD.
- Environment differences must come from `.env` values or environment-managed secrets.
- Runtime source filenames must not use team names.

## PR Chain Boundary

The development workspace restructure must proceed through sequential scoped PRs. A PR may only move or update the paths named in its purpose.

Final path-governance PRs may document target paths and legacy exceptions, but they must not move deployable application code unless explicitly scoped.
