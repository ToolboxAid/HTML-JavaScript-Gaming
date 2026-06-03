# PR 11.48 — Script-Assisted JSON Cleanup (Verified Only)

## Purpose
Use audit script results to perform verified cleanup of JSON files.

## Rule
Only fix JSON files after manual confirmation.

## Process
For each JSON flagged as NO:
1. Open sample
2. Confirm:
   - indirectly used → KEEP
   - wrong sample → MOVE
   - unused → DELETE

## Scope
- 1–3 files only
- no palette
- no tile-map
- no 1902

## Acceptance
- only verified fixes applied
- no false-positive cleanup
