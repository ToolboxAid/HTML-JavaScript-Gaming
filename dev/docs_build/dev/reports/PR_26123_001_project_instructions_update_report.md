# PR_26123_001-project-instructions-update Report

## Scope
- Targeted documentation-only update.
- Updated ChatGPT contract wording and PR naming guidance in `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- No runtime, schema, or tool behavior changes.

## Files Changed
- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/PR_26123_001_project_instructions_update_report.md`

## Requested Contract Updates Applied
- Added `PR NAMING STANDARD` section with format:
  - `PR_<YYJJJ>_<###>-<short-description>`
- Replaced `Responsibilities` section with ChatGPT output responsibilities and non-responsibilities.
- Replaced `Output rules` section with strict 4-item ChatGPT output contract.
- Added `PLAYWRIGHT VALIDATION REQUIREMENT` section.
- Added `MANUAL TEST REQUIREMENT` section.
- Replaced `ZIP IS ALWAYS REQUIRED` section language with:
  - Codex-only ZIP creation ownership
  - ChatGPT must not create or reference ZIP delivery

## Validation
- Manual content validation completed via direct file inspection and targeted string checks.
- Verified roadmap guard sections remained present and unchanged in intent.
- Full samples smoke test not run (docs-only change; no runtime impact).
