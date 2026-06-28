# PR_26171_GAMMA_013 Instruction Compliance Checklist

## Required Reads

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- PASS: Read `docs_build/dev/PROJECT_MULTI_PC.txt`.
- PASS: Read exact target file `admin/system-health.html`.
- PASS: Read existing target route test `tests/playwright/tools/AdminHealthOperationsPage.spec.mjs`.

## Pre-Step Artifact Gate

- PASS: Refreshed review artifacts before implementation.
- PASS: Committed and pushed the artifact-only refresh before implementation because `codex_changed_files.txt` changed.
- PASS: Verified `git status --short` was clean after artifact refresh commit.
- PASS: Verified local/origin sync was `0 0` after artifact refresh commit.

## Ownership And Branch

- PASS: Queued PR uses historical token `GAMMA`; current canonical team is Golf.
- PASS: TEAM ownership was verified against `PROJECT_MULTI_PC.txt`.
- PASS: User explicitly directed continuation on `team/GAMMA/admin`.
- PASS: User explicitly directed updating existing draft PR #36 and not creating a separate PR013 GitHub PR.
- PASS: Work remained within the Admin diagnostics/foundation scope.

## Scope Compliance

- PASS: Added clear diagnostics plan/foundation section to Admin System Health.
- PASS: Defined future diagnostic check for Postgres connection.
- PASS: Defined future diagnostic check for Postgres migration reader.
- PASS: Defined future diagnostic check for R2 bucket configured.
- PASS: Defined future diagnostic checks for R2 list/read/write/delete.
- PASS: Defined future diagnostic check for runtime environment masking.
- PASS: Defined future diagnostic check for limits/capacity metrics.
- PASS: Kept all unwired checks as `PENDING`.
- PASS: Added hover/accessibility reason text for every non-`PASS` status.
- PASS: Did not add API wiring.
- PASS: Did not add persistence.
- PASS: Did not add SQLite.
- PASS: Did not expose client-side secret values.
- PASS: Preserved Theme V2-only implementation.

## Validation Compliance

- PASS: Ran `git diff --check`.
- PASS: Ran targeted Admin System Health static validation.
- PASS: Verified every non-`PASS` status has reason text.
- PASS: Verified no `WARN` or `FAIL` placeholder health statuses exist.
- PASS: Ran targeted Admin System Health Playwright route spec.
- PASS: Did not run samples.

## Reports And Packaging

- PASS: Created queued-scope PR report.
- PASS: Created manual validation notes.
- PASS: Created instruction compliance checklist.
- PASS: Generate `codex_review.diff` after staging scoped files.
- PASS: Generate `codex_changed_files.txt` after staging scoped files.
- PASS: Create repo-structured delta ZIP under `tmp/PR_26171_GAMMA_013-admin-system-health-diagnostics-plan_delta.zip`.
- PASS: Verify no report remains modified after ZIP creation.

## Merge Control

- PASS: No merge performed.
- PASS: Owner-controlled EOD merge approval remains required.
