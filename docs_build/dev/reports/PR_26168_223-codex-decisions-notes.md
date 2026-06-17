# PR_26168_223-codex-decisions-notes

## Branch Validation

PASS

- Current branch: `main`
- Expected branch: `main`

## Summary

Added Codex decision notes for Game Foundry Studio Project packages under `docs_build/codex/decisions/`.

## Requirement Checklist

- PASS - Added `docs_build/codex/decisions/project-packages.md`.
- PASS - Documented `.gfsp` as Game Foundry Studio Project.
- PASS - Documented the internal ZIP-based package format.
- PASS - Documented filename format `<ProjectNameWithoutSpaces>-<YYJJJ>-<sequence>.gfsp`.
- PASS - Included example `KingOfTheIceberg-26168-001.gfsp`.
- PASS - Documented promotion terms as Export Project Package, Import Project Package, and Validate Project Package.
- PASS - Kept Codex notes out of root, `src`, `assets`, `toolbox`, `games`, and runtime-promoted paths.

## Validation Lane Report

- Lane: docs/contract.
- PASS - Static decision-note validation confirmed required package terminology, filename format, example, and promotion operation names.
- PASS - Placement validation confirmed the note lives only under `docs_build/codex/decisions/`.

Commands:

- `Get-Content -Path docs_build/codex/decisions/project-packages.md`
- Static Node validation for decision-note contents and allowed path.
- `git diff --check`

## Manual Validation Notes

- The decision note is docs-only and does not change runtime behavior.
- No secrets or runtime configuration values were added.
- Full samples smoke: SKIP because no sample JSON or sample runtime behavior was touched.

