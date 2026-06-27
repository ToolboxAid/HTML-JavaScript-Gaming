# PR_26179_OWNER_008-update-path-governance-final

Generated: 2026-06-27T19:38:31.874Z
Branch: PR_26179_OWNER_008-update-path-governance-final
Base stack head before PR_008: f3c2e7a02
ZIP: dev/workspace/artifacts/tmp/PR_26179_OWNER_008-update-path-governance-final_delta.zip

## Purpose

Finalize path governance after the dev workspace restructure chain and document the final root, src, and dev workspace standards.

## Changes

- Updated repository directory governance with final root ownership and legacy path exceptions.
- Added the final `src/web/`, `src/api-runtime/`, and `src/runtime/` layer standard.
- Updated canonical repository structure governance to point new work at final paths.
- Updated README architecture wording to describe target src layers without moving current source directories.

## Validation Summary

| Status | Item | Notes |
| --- | --- | --- |
| PASS | Current branch is PR_26179_OWNER_008-update-path-governance-final | confirmed |
| PASS | Documentation/governance-only scope | no protected runtime/product/API/database/test/script/config diffs |
| PASS | Final root directory standard documented | repository_directory_standard.md names product root, src, dev, docs, games, toolbox, and public product roots |
| PASS | Final src layer standard documented | src/web, src/api-runtime, and src/runtime documented with legacy transition buckets |
| PASS | Final dev workspace standard documented | dev/docs_build, dev/reports, dev/tests, dev/scripts, dev/config, dev/archive, and dev/workspace/artifacts documented |
| PASS | Old report root references absent from active target search | (no matches) |
| PASS | Old <project folder>/tmp ZIP reference absent from active target search | (no matches) |
| PASS | Final src path grep | 15 matching lines |
| PASS | npm run validate:canonical-structure | passed |
| PASS | git diff --check | passed |
| PASS | Playwright impacted | not impacted; no runtime/test/browser behavior changed |
