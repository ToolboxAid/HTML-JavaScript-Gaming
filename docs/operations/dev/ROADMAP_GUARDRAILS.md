# Roadmap Guardrails

## Purpose
Prevent accidental corruption or path drift of the active master roadmap.

## TRACKER FILE PROTECTION
The active master roadmap file is:

`docs/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

### Allowed Changes
- Change ONLY bracket states:
  - `[ ]` → `[.]` → `[x]`

### Forbidden Changes
- Adding/removing sections
- Rewriting text
- Reordering items
- Renaming tracks
- Collapsing or expanding content
- Moving the active master roadmap out of `docs/dev/roadmaps/`
- Creating duplicate active roadmap copies elsewhere

## PATH RULE
All active roadmap files MUST live in:
- `docs/dev/roadmaps/`

Never use:
- `docs/roadmaps/`
- `docs/operations/dev/BIG_PICTURE_ROADMAP.md` as the active master roadmap

## Validation Check
Any change to the active master roadmap must pass:
- headings unchanged
- no text modified outside brackets
- only bracket states updated
- file path remains under `docs/dev/roadmaps/`

## Codex Rule
Codex must treat the active roadmap as immutable structure and perform surgical edits only.
