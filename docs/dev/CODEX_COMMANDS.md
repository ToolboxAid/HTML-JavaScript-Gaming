Toolbox Aid
David Quesenberry
04/05/2026
codex_commands.md

# CODEX COMMANDS

## APPLY_PR_RUNTIME_SCENE_LOADER_AND_HOT_RELOAD

MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Apply APPLY_PR_RUNTIME_SCENE_LOADER_AND_HOT_RELOAD as a focused implementation PR.

Requirements:
- Implement the approved runtime scene loader and hot reload flow only
- Keep orchestration above engine core; do not pollute engine systems with tool-specific quirks
- Consume existing approved render pipeline/composition contracts rather than inventing new ones
- Preserve deterministic render order
- Add structured validation-aware reload behavior
- Preserve last-known-good scene on reload failure
- Add focused automated tests for load, reload, validation failure, disposal, and repeated reload stability
- Keep changes surgical and architecture-aligned
- Do not introduce destructive runtime-breaking changes unless absolutely required and documented
- Produce repo-structured implementation delta ZIP at:
  <project folder>/tmp/APPLY_PR_RUNTIME_SCENE_LOADER_AND_HOT_RELOAD_delta.zip

Expected documentation updates:
- docs/dev/change_summary.txt
- docs/dev/file_tree.txt
- docs/dev/validation_checklist.txt

Commit comment source:
- docs/dev/commit_comment.txt
