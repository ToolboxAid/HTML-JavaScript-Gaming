# BUILD_PR — LEVEL 10_03 — VALIDATION INTEGRATION

## Objective
Integrate validation runner into standard workflows (pre-commit and CI-ready), and standardize exit codes so failures block bad structure.

## What to Execute
PowerShell:
scripts/PS/validate/Validate-All.ps1

## Expected Behavior
- Returns exit code 0 on PASS
- Returns non-zero on FAIL
- Emits clear PASS/FAIL summary

## Optional Local Hook (example)
PowerShell:
git config core.hooksPath .githooks

Create .githooks/pre-commit that runs:
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/PS/validate/Validate-All.ps1
if ($LASTEXITCODE -ne 0) { exit 1 }

## CI Note
This same script can be called from CI to gate merges.
