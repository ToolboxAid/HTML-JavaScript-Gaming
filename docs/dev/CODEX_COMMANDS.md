MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_DOCS_ARCHIVE_CLEANUP

Requirements:
- Execute file moves only for docs archive cleanup
- Use docs/dev/reports/docs_archive_pr_move_manifest.txt as the exact source of truth for move operations
- Move each listed file from docs/pr/ to docs/archive/pr/legacy-pr-history/
- Keep every file listed in docs/dev/reports/docs_archive_pr_keep_manifest.txt in docs/pr/
- Preserve docs/pr/.keep
- Do not modify file contents during move
- Do not touch docs/dev/start_of_day/
- Do not touch docs/roadmaps/
- Do not broaden scope beyond the manifest
- Package repo-structured delta zip to <project folder>/tmp/BUILD_PR_DOCS_ARCHIVE_CLEANUP_delta.zip
