# PR 11.50 Validation Plan

## Required Checks
- Run `scripts/PS/audit-sample-json-js-references.ps1` before and after cleanup.
- Confirm selected files are reported as NO before removal.
- Confirm selected files have no JS references.
- Confirm selected files are not indirectly used.
- Confirm audit total count decreases by exactly two.

## Full Samples Test
Skipped by default.

Reason: this PR only removes two confirmed dead tool-specific JSON payloads and does not modify shared loader/framework code.

## Targeted Validation
- Audit before/after.
- Git diff review.
- Any affected tool/sample page smoke check if the removed payload belongs to a visible tool route.
