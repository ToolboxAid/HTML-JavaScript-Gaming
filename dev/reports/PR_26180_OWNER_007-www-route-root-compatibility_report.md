# PR_26180_OWNER_007-www-route-root-compatibility Report

## Executive Summary

PASS. This PR prepares local static route-root compatibility for the future `www/` migration without moving browser-served files or changing public URLs.

The implementation adds a shared local static route resolver that can prefer a configurable web root while preserving the current repository-root serving default. The documented future toggle is:

```text
GAMEFOUNDRY_LOCAL_WEB_ROOT=www
```

Default behavior remains current root serving when the variable is unset, empty, `.`, `root`, or `repo-root`.

## Source Plan

Used `dev/build/ProjectInstructions/repository/www_migration_map.md` as the source plan. The map now documents the route-root compatibility toggle and the default/future behavior split.

## Changed Files

- `dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md`
- `dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS_VERSION.md`
- `dev/build/ProjectInstructions/PROJECT_STATE.md`
- `dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md`
- `dev/build/ProjectInstructions/repository/www_migration_map.md`
- `dev/scripts/start-dev.mjs`
- `dev/tests/dev-runtime/StaticWebRootCompatibility.test.mjs`
- `dev/tests/helpers/playwrightRepoServer.mjs`
- `dev/tests/playwright/tools/StaticWebRootCompatibility.spec.mjs`
- `src/dev-runtime/server/local-api-server.mjs`
- `src/dev-runtime/server/static-web-root.mjs`

## Implementation Notes

- Added `src/dev-runtime/server/static-web-root.mjs` for shared local static route resolution.
- Updated the local dev web server, Local API static fallback, and Playwright repo server helper to use the shared resolver.
- Added configurable `webRoot` support for test helpers and local server internals.
- Preserved public route URLs including `/index.html`, `/toolbox/index.html`, `/assets/...`, `/account/...`, `/admin/...`, and `/games/...`.
- Preserved compatibility alias behavior such as `/tools/...` resolving to `/toolbox/...`.
- Kept repository-root serving as the default until the actual `www/` move PR.
- No browser-served files were moved.
- No public URL changes were introduced.
- No API/server architecture changes were introduced.

## Owner Recommendation

Ready for review as the route-root compatibility preparation step before moving browser-served files into `www/`.
