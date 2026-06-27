# PR_26140_031 Dupe Scanner Node Modules Exclusion Report

## Scope

- Added the requested duplicate scanner entry point at `toolbox/shared/powerShell/find_dupes_called.ps1`.
- Kept duplicate detection patterns and output formatting unchanged.
- Added the requested recursive scan filter:
  - `$_.FullName -notmatch '\\node_modules\\'`

## Validation

- PASS `.\tools\shared\powerShell\find_dupes_called.ps1 | Set-Content -Path tmp\dupes_called.txt -Encoding utf8`
- PASS `Select-String -Path tmp\dupes_called.txt -Pattern "node_modules" -SimpleMatch`
  - No matches returned.
- PASS repo-owned duplicate results still appear in `tmp/dupes_called.txt`, including `src`, `games`, and `toolbox/shared` paths.

## Notes

- The existing tracked scanner under `scripts/PS/find-duplicate-methods/dupes_called.ps1` already had the same node_modules exclusion in the latest committed delta.
- The pre-existing root `dupes_called.txt` working tree change was not modified for this PR and is intentionally excluded from the PR delta/review artifacts.
- Playwright impacted: No. This PR only adds a PowerShell scanner entry point and validates its text output.
- Full samples smoke test skipped; this PR does not affect runtime samples.
