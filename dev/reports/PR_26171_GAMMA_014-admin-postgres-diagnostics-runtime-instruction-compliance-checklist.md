# PR_26171_GAMMA_014 Instruction Compliance Checklist

## Required Reads

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- PASS: Read `docs_build/dev/PROJECT_MULTI_PC.txt`.
- PASS: Read exact target file `admin/system-health.html`.
- PASS: Read existing runtime target `assets/theme-v2/js/admin-system-health.js`.
- PASS: Read existing API client `src/api/admin-system-health-api-client.js`.
- PASS: Read existing safe server contract in `src/dev-runtime/server/local-api-router.mjs`.
- PASS: Read existing target route test `tests/playwright/tools/AdminHealthOperationsPage.spec.mjs`.

## Ownership And Branch

- PASS: Queued PR uses historical token `GAMMA`; current canonical team is Golf.
- PASS: TEAM ownership was verified against `PROJECT_MULTI_PC.txt`.
- PASS: User explicitly directed continuation on `team/GAMMA/admin`.
- PASS: User explicitly accepted current preflight: branch `team/GAMMA/admin`, clean, local/origin sync `0 0`.
- PASS: User explicitly directed updating existing draft PR #36 and not creating a separate PR014 GitHub PR.
- PASS: Work remained within the Admin diagnostics/runtime scope.

## Scope Compliance

- PASS: Wired Admin System Health Postgres diagnostics.
- PASS: Used existing safe server/API/service contract.
- PASS: Showed provider.
- PASS: Showed host.
- PASS: Showed port.
- PASS: Showed database.
- PASS: Showed migration version/summary.
- PASS: Showed connection status.
- PASS: Masked secrets and refused unsafe secret-bearing responses.
- PASS: Did not introduce SQLite.
- PASS: Did not expose client-side secrets.
- PASS: Preserved Theme V2 only.
- PASS: Preserved Postgres-only database direction.
- PASS: Left non-PR014 diagnostics outside runtime wiring.
- PASS: Added reason text for every non-`PASS` status rendered by PR014 code.

## Validation Compliance

- PASS: Ran `git diff --check`.
- PASS: Ran targeted Admin System Health source validation.
- PASS: Ran targeted Admin System Health Playwright route/behavior validation.
- PASS: Verified no SQLite was introduced in the changed page/runtime module.
- PASS: Verified no secret values are exposed by the page behavior.
- PASS: Verified every non-`PASS` status has reason text.
- PASS: Produced Playwright V8 coverage notes for changed runtime JavaScript.
- PASS: Did not run samples.

## Reports And Packaging

- PASS: Created queued-scope PR report.
- PASS: Created manual validation notes.
- PASS: Created instruction compliance checklist.
- PASS: Generate `codex_review.diff` after scoped changes.
- PASS: Generate `codex_changed_files.txt` after scoped changes.
- PASS: Create repo-structured delta ZIP under `tmp/PR_26171_GAMMA_014-admin-postgres-diagnostics-runtime_delta.zip`.
- PASS: Verify no report remains modified after ZIP creation.

## Merge Control

- PASS: No merge performed.
- PASS: Owner-controlled EOD merge approval remains required.
