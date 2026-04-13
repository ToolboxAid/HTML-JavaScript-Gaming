# PR_01_02_REPO_STRUCTURE_APPLY

## Purpose
Apply the validated repo structure move map exactly as captured in `docs/dev/reports/move_map.txt`.

## Scope
- file/folder moves only from validated move map
- import/path updates only where required by those moves
- no engine logic changes
- no gameplay/tool behavior changes
- no deletes unless explicitly listed in move_map.txt

## Inputs
- docs/dev/reports/move_map.txt
- docs/dev/reports/validation_checklist.txt

## Required Work
1. Apply every move in `move_map.txt` exactly.
2. Update imports/paths only as required by moved targets.
3. Preserve runtime behavior.
4. Re-run validation checklist after moves.

## Validation
- moved targets match move_map exactly
- imports resolve after moves
- runtime/sample navigation not regressed
- no extra structural churn beyond mapped changes

## Output
<project folder>/tmp/PR_01_02_REPO_STRUCTURE_APPLY.zip
