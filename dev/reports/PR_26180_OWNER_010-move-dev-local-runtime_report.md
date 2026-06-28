# PR_26180_OWNER_010-move-dev-local-runtime Report

## Executive Summary

PASS. This PR moves developer-only local runtime/bootstrap entrypoints into `dev/local-runtime/` while preserving the public npm command surface.

## Scope Completed

- Moved `dev/scripts/start-dev.mjs` to `dev/local-runtime/start-dev.mjs`.
- Moved `dev/scripts/start-local-api-server.mjs` to `dev/local-runtime/start-local-api-server.mjs`.
- Moved `dev/scripts/team-port-config.mjs` to `dev/local-runtime/team-port-config.mjs`.
- Removed `dev/local-runtime/.gitkeep` because the folder now contains active files.
- Updated package scripts while preserving command names:
  - `npm run dev:bootstrap`
  - `npm run dev:api`
  - `npm run dev:web`
  - `npm run dev:local-api`
- Updated targeted tests and validation references to the new local-runtime paths.
- Updated Project Instructions version to `2026.06.28.010`.
- Updated Repository Architecture Simplification backlog status to 50%.

## Scope Boundaries

- API/server application files were not moved.
- Browser/www files were not moved.
- Product behavior was not changed.
- Public command names were preserved.

## Stacked Dependency

- Previous PR dependency: `PR_26180_OWNER_009-move-api-application`
- Current PR: `PR_26180_OWNER_010-move-dev-local-runtime`
- Next planned PR: `PR_26180_OWNER_011-move-tests-and-validation`
- Intended merge order: PR009, then PR010, then PR011.

## Playwright

Playwright was not run because this PR moved local developer entrypoint file locations and preserved route/runtime behavior. Targeted node tests and controlled command smoke checks covered the moved startup surface.
