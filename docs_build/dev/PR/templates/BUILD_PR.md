# BUILD_PR: <PR_NAME>

## Purpose

Describe the one PR purpose.

## Source Of Truth

Use the current user request, this BUILD_PR, and active Project Instructions under `docs_build/dev/ProjectInstructions/`.

## Exact Scope

- List exact implementation tasks.
- Keep each item testable.

## Exact Targets

- `path/to/file`

## Out Of Scope

- No unrelated cleanup.
- No runtime/product/API/database changes unless explicitly scoped.

## Validation

Run targeted validation only:

```powershell
git diff --check
```

## Reports

Create or update:

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- PR-specific report under `docs_build/dev/reports/`
- branch validation PASS/FAIL
- requirement checklist PASS/FAIL
- validation lane report
- manual validation notes
- repo-structured ZIP under `tmp/`
