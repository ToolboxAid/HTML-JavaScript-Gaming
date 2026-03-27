Toolbox Aid
David Quesenberry
03/26/2026
APPLY_PR_TOOLS_SPRITE_EDITOR_V6_0_RELEASE_CANDIDATE_HARDENING.md

# APPLY_PR — Sprite Editor v6.0

## Checklist
[ ] Edge-case operations fail safely
[ ] Active frame/layer indices remain valid after destructive actions
[ ] Range/playback bounds normalize correctly
[ ] Menus/popovers remain reliable under repeated use
[ ] Undo/redo remains stable under batch/destructive flows
[ ] Dirty state remains correct
[ ] Exports fail safely when invalid
[ ] Manual validation is easier because state self-corrects
[ ] No console errors
[ ] Only tools/docs modified
