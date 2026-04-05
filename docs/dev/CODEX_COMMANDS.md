Toolbox Aid
David Quesenberry
04/05/2026
codex_commands.md

MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_DOCS_CLEANUP_AND_STRUCTURE_REORG implementation.

Requirements:
- Clean only documentation and documentation-adjacent artifacts
- Do not modify engine, tools, samples, games, tests, or runtime code
- Keep `docs/pr/` intact as history
- Make `docs/dev/` active-only:
  - README.md
  - WORKFLOW_RULES.md
  - active CODEX_COMMANDS.md
  - active COMMIT_COMMENT.txt
  - active NEXT_COMMAND.txt
  - only currently valuable reports
- Move durable architecture material out of `docs/dev/ARCHITECTURE.txt` into:
  `docs/architecture/repo-operating-model.md`
- Consolidate duplicate workflow/rules/start-of-day notes
- Move older or lower-value generated artifacts to:
  - `docs/archive/dev-ops/`
  - `docs/archive/generated-reports/`
- Delete obvious no-value doc artifacts when safe
- Update key docs:
  - README.md
  - docs/README.md
  - docs/getting-started.md
  - docs/architecture/README.md
  - docs/architecture/engine-api-boundary.md
  - docs/dev/README.md
  - docs/repo-directory-structure.md if present
  - docs/review-checklist.md if present
- Do not introduce broken links
- Keep `docs/dev/commit_comment.txt` header-free
- Package implementation output to:
  <project folder>/tmp/BUILD_PR_DOCS_CLEANUP_AND_STRUCTURE_REORG_delta.zip

Report back:
- exact docs/files removed
- exact docs/files moved
- exact docs/files updated
- final active docs/dev structure
- final archive structure
