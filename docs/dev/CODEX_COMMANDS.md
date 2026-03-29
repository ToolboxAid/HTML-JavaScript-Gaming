Toolbox Aid
David Quesenberry
03/29/2026
CODEX_COMMANDS.md

MODEL: GPT-5.4
REASONING: medium
COMMAND: Create BUILD_PR_REPO_CLEANUP_PHASE_1D_SPRITE_EDITOR_EXTRACTION_GATE_CLASSIFICATION_AND_PILOT as a docs-first, Sprite Editor-only delta. Use docs/pr/PLAN_PR_REPO_CLEANUP_PHASE_1D_SPRITE_EDITOR_POST_NORMALIZATION_EXTRACTION_GATE.md as source of truth. Keep scope to tools/SpriteEditor/modules analysis plus docs/pr and docs/dev artifacts. Do not modify engine/, games/, or samples/. Include helper inventory, bucket classification (keep-local/monitor/future-candidate), extraction gate pass/fail checklist, repo-relative paths, COMMIT_COMMENT.txt, and NEXT_COMMAND.txt.

VALIDATIONS:
- verify no files changed under engine/, games/, samples/
- verify classification includes keep-local/monitor/future-candidate buckets
- verify extraction gate criteria are explicitly evaluated per touched helper family
