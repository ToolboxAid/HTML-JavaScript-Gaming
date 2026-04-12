# BUILD_PR_TARGETED_REPO_CLEANUP_PASS_4B_SPRITEEDITOR_MOVE_TO_ARCHIVE

## PR Purpose
Move `tools/SpriteEditor_old_keep/` to `docs/archive/tools/SpriteEditor_old_keep/` as a non-executable reference artifact.

## Scope
- Move directory ONLY
- Preserve full structure and contents
- Update references (docs-only) if required

## Rules
- NO deletions
- NO modifications to contents
- NO runtime wiring
- NO templates changes
- MUST preserve path fidelity under archive

## Required Work

### 1. Move directory
FROM:
tools/SpriteEditor_old_keep/

TO:
docs/archive/tools/SpriteEditor_old_keep/

### 2. Update references (docs-only)
- Replace any path references pointing to:
  tools/SpriteEditor_old_keep/
→ docs/archive/tools/SpriteEditor_old_keep/

### 3. Validation report
Create:
docs/dev/reports/spriteeditor_archive_move_report.md

Must include:
- files moved count
- reference updates (if any)
- confirmation no runtime imports exist

## Validation Commands
- confirm old path no longer exists
- confirm new archive path exists
- search for broken references

## Acceptance Criteria
- directory fully moved
- no runtime impact
- archive location correct
- repo builds unchanged
