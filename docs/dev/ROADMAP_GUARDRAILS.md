# 🛡️ Roadmap Guardrails

## Purpose
Prevent accidental corruption of BIG_PICTURE_ROADMAP.md by enforcing strict update rules.

## RULE: TRACKER FILE PROTECTION
The file `docs/dev/BIG_PICTURE_ROADMAP.md` is a status tracker only.

### Allowed Changes
- Change ONLY:
  - [ ] → [.] → [x]

### Forbidden Changes
- Adding/removing sections
- Rewriting text
- Reordering items
- Renaming tracks
- Collapsing or expanding content

## VALIDATION CHECK
Any change to BIG_PICTURE_ROADMAP.md must pass:
- Headings unchanged
- No text modified outside brackets
- Only bracket states updated

## CODEX RULE
Codex must treat this file as immutable structure and perform surgical edits only.
