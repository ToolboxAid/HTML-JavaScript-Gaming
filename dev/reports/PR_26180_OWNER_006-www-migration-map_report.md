# PR_26180_OWNER_006-www-migration-map Report

## Executive Summary

PASS - Created a no-runtime-change migration map for moving browser-served files into `www/` safely. The map documents the current browser-served root, current route/import/test assumptions, local server root behavior, compatibility needs, and validation lanes required before the actual move.

This PR does not move browser files, alter `package.json`, change local server behavior, or modify runtime/API/UI/database implementation files.

## Stack Metadata

- Workstream: Repository Architecture Simplification
- PR model: Stacked PR
- Stack step: PR006 mapping step after PR005 scaffold
- Previous dependency: `PR_26180_OWNER_005-repository-layout-scaffold`
- Current PR: `PR_26180_OWNER_006-www-migration-map`
- Next dependency: `PR_26180_OWNER_007-move-www-application`
- Base branch for GitHub PR: `PR_26180_OWNER_005-repository-layout-scaffold`
- Source branch: `PR_26180_OWNER_006-www-migration-map`

## Deliverables

- Added `dev/build/ProjectInstructions/repository/www_migration_map.md`.
- Updated Project Instructions version to `2026.06.28.006`.
- Updated Project Instructions pointers to include the migration map.
- Updated project state/latest structure PR metadata.
- Updated repository layout architecture plan so PR006 is explicitly a mapping step and the actual web move becomes the next dependency.
- Updated BACKLOG_MASTER.md to mark Repository Architecture Simplification at 15% with PR006 active.

## Evidence Summary

- Current browser-served roots include `index.html`, `account/`, `admin/`, `assets/`, `community/`, `company/`, `docs/`, `games/`, `learn/`, `legal/`, `marketplace/`, `memberships/`, `owner/`, and `toolbox/`.
- Current reference search found broad use of `assets/`, `toolbox/`, `account/`, `legal/`, `learn/`, `play/`, and `src/` paths across active browser roots, tests, scripts, and source.
- Current static serving resolves browser paths from repository root in `dev/scripts/start-dev.mjs`, `src/dev-runtime/server/local-api-server.mjs`, and `dev/tests/helpers/playwrightRepoServer.mjs`.
- Playwright/runtime tests assume stable public URLs such as `/index.html`, `/toolbox/index.html`, `/account/sign-in.html`, `/admin/system-health.html`, and `/games/index.html`.

## Runtime Impact

None. This is a documentation/governance map only.
