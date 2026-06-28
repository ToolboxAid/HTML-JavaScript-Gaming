# PR_26180_OWNER_011-move-tests-and-validation Report

Generated: 2026-06-28T22:57:50.322Z

## Purpose

Finalize tests and validation paths for the www/api/dev layout without moving www or api files and without changing product behavior.

## Summary

- Updated moved dev test path assumptions from old root tests layout to dev/tests depth.
- Updated test-generated output/local-db paths from root tmp/ to dev/workspace/tmp/.
- Updated browser-served test fixture paths from root toolbox/assets/games to www/toolbox, www/assets, and www/games.
- Updated canonical structure validation to reject tracked legacy root tests/scripts/tmp/docs_build paths and old dev/local-runtime entrypoints.
- Bumped Project Instructions/status metadata to 2026.06.28.011 for PR011.

## Scope Confirmation

- Runtime/product behavior changed: No.
- www or api files moved: No.
- Product UI files changed: No.
- API/server behavior changed: No.
- Test and validation path assumptions updated: Yes.

## Stack Dependency

- Previous PR dependency: PR_26180_OWNER_010-move-dev-local-runtime.
- Current PR: PR_26180_OWNER_011-move-tests-and-validation.
- Next PR dependency: PR_26180_OWNER_012-update-ci-and-scripts.
- Merge order: PR010, then PR011, then PR012.

## Notes

The formal validation lane is the moved-path dev-runtime Node test set plus the static web-root Playwright route smoke. Direct legacy V2 runtime scripts still reference retired workspace-v2/asset-manager-v2 fixtures; this PR corrected their repository-root and artifact paths only and does not recreate retired tool fixtures.
