# BUILD PR_26171_001-branch-first-pr-governance

## Purpose

Update repository workflow governance from main-only execution to branch-first GitHub Pull Request integration.

## Scope

- Amend `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Replace the former main-only execution guard with branch-first PR governance.
- Update rule precedence so branch-first PR governance supersedes older main-only execution requirements.
- Add rationale for parallel Codex sessions, multi-PC development, merge-risk reduction, audit history, and rollback.
- Create required validation and review reports.

## Out Of Scope

- Runtime behavior changes.
- Application code changes.
- Test behavior changes.
- Local merge, commit, push, or GitHub PR creation.

## Validation

- Verify no remaining instructions require implementation work on `main`.
- Verify governance text is internally consistent.
- Run `git diff --check`.

## Required Reports

- `docs_build/dev/reports/pr-governance-validation.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `tmp/PR_26171_001-branch-first-pr-governance_delta.zip`
