# PR_26180_OWNER_018-move-src-browser-to-www Report

## Executive Summary

Moved PR017-audited browser/www-owned legacy `src/` files into `www/src/` so public browser imports such as `/src/...` continue to resolve under the `www` web root. This PR does not move API/server-owned or dev-owned `src` files and does not change product behavior.

## Scope Confirmation

- Branch: `PR_26180_OWNER_018-move-src-browser-to-www`
- Base workstream: `PR_26180_OWNER_017-src-dissection-and-demo-cleanup`
- Current HEAD before commit: `f4be737bbfcccd0f04f5298963ac7573362df7ca`
- Browser/www-owned files moved: 501
- Modified reference/test/governance files: 231
- Runtime behavior changes: None intended; public route/import URLs are preserved.
- API/server-owned files moved: None.
- Dev-owned files moved: None.

## Implementation Notes

- Moved browser-owned `src/advanced`, `src/api` browser clients, `src/dev-runtime/admin` browser viewer files, `src/engine`, browser/shared helpers, toolbox browser modules, and browser tool helpers into `www/src/` according to the PR017 destination audit.
- Updated active API/dev/test imports that load these browser-owned modules to point at `www/src/` filesystem paths.
- Preserved public browser URLs such as `/src/engine/core/Engine.js`, `/src/api/admin-owner-navigation.js`, and `/src/dev-runtime/admin/notes.html` through the existing static web root compatibility layer.
- Updated Project Instructions, repository structure docs, migration map, Project State, and Backlog to record the PR018 migration state.
- Updated targeted tests to reflect the current encoded Admin Notes source path and current toolbox registry release-channel counts.

## Files/Folders Moved

- `src/advanced/**` -> `www/src/advanced/**`
- `src/api/**` browser API clients -> `www/src/api/**`
- `src/dev-runtime/admin/**` browser viewer files -> `www/src/dev-runtime/admin/**`
- `src/engine/**` browser/runtime engine modules -> `www/src/engine/**`
- Browser-owned `src/shared/**` helper/toolbox modules -> `www/src/shared/**`
- `src/tools/**` browser tool helpers -> `www/src/tools/**`

## Remaining Source Buckets

- `src/shared/contracts/**`, `src/shared/schemas/**`, and `src/shared/projectDataStore/**` remain for PR019 API/server migration.
- `src/dev-runtime/admin/.gitkeep` and any remaining dev/reference ownership remain for later scoped PRs.
- `src/` is not retired in this PR.
