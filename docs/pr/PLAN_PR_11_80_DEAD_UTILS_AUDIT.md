# PLAN_PR_11_80_DEAD_UTILS_AUDIT

## Purpose
Create a focused dead-utils audit after the engine/shared utils consolidation work.

## Scope
- Add a report-only PowerShell audit script.
- Scan `src/shared/utils/**` and any remaining `src/engine/utils/**` utility files.
- Detect utility files that appear unreferenced by source, samples, tools, games, tests, HTML, and manifests.
- Detect stale references to `src/engine/utils/` and `/src/engine/utils/`.
- Emit counts-first console output and a CSV report.

## Non-goals
- Do not delete utility files.
- Do not move files.
- Do not add alias, wrapper, or compatibility shim files.
- Do not change runtime code unless needed to add the audit script to repo docs/scripts.

## Acceptance
- Script runs from repo root.
- Report is written to `docs/dev/reports/dead_utils_audit.csv`.
- Console prints summary counts.
- `-Details` dumps candidate paths.
- `-Ci` exits non-zero only when stale `src/engine/utils/` references remain, not merely because dead candidates exist.
