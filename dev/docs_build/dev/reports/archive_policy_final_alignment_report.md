# PR_26154_049 Archive Policy Final Alignment

## Summary
- Classified `SpriteEditor_old_keep` as archived tool reference material.
- Moved it from docs-build archive ownership to tool archive ownership.
- Preserved reference material; no archive content was deleted.

## Moves
- From: `archive/v1-v2/docs_build/archive/tools/SpriteEditor_old_keep/`
- To: `archive/v1-v2/tools/SpriteEditor_old_keep/`

## Path Adjustments
- `docs_build/reference/features/docs-system/move-history-preserved.md`
  - Updated policy path from `archive/v1-v2/docs_build/archive/tools/SpriteEditor_old_keep/` to `archive/v1-v2/tools/SpriteEditor_old_keep/`.
  - Removed wording that claimed `SpriteEditor_old_keep` remains hidden runtime registry metadata.
- `docs_build/tools/README.md`
  - Updated the archived Tools Index And Registry UAT link to `archive/v1-v2/docs_build/tools/tools-index-registry/uat.md`.

## Reference Preservation
- New archive location exists: `archive/v1-v2/tools/SpriteEditor_old_keep/index.html`.
- Old docs-build archive location no longer exists.
- Content count at new location: 44 files.

## Remaining Historical References
- Historical report and PR docs under `docs_build/reports/` and `docs_build/pr/` may still mention the previous archive path.
- Those are retained as historical evidence and are not active app/runtime references.

## Validation
- PASS: `archive/v1-v2/tools/SpriteEditor_old_keep/index.html` exists.
- PASS: `archive/v1-v2/docs_build/archive/tools/SpriteEditor_old_keep/` is absent.
- PASS: no active registry metadata references `SpriteEditor_old_keep`.
