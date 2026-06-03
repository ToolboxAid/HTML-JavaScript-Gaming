# PR 11.44 — Targeted Sample JSON Cleanup Batch 2

## Purpose
Continue the actual cleanup follow-up from PR 11.41 and PR 11.43 without asking for confirmation and without running the full 20-minute sample suite by default.

## Source
Use the current repo state after:
- PR 11.41 sample JSON ownership audit
- PR 11.43 cleanup batch 1
- PR 11.42 explicit-input cleanup if already applied

## Required Change
Resolve the next smallest safe batch of deferred sample JSON ownership findings.

## Batch Selection Rules
Choose 2–4 deferred items where ownership is obvious and blast radius is low.

Prioritize:
- JSON files clearly owned by one executable sample
- JSON files clearly stale/duplicated with preserved coverage
- JSON files that can be wired visibly with minimal sample-local changes
- JSON files where targeted validation is straightforward

Do not choose:
- sample 1902 items
- ambiguous ownership items
- broad/shared loader changes
- items requiring full sample-suite validation

## Sample 1902 Exception
Sample 1902 remains exempt because it is a Workspace Manager aggregation sample.

Do not rehome/delete 1902 multi-tool payloads under single-tool ownership rules.

## Required Actions
For each selected item, apply one clear action:
- KEEP + WIRE
- MOVE / REHOME
- DELETE
- CREATE / UPDATE CORRECT SAMPLE
- DEFER with reason if investigation shows uncertainty

## Testing Policy
Do NOT run the full samples smoke test by default.

Run only:
- syntax checks for changed files
- targeted smoke/tests for changed samples/tools

Run full samples smoke only if shared sample launch infrastructure is changed, and document why.

## Scope
- Sample JSON ownership cleanup only.
- No broad refactors.
- No hidden/default fallback data.
- No decorative JSON.
- Do not undo SVG Asset Studio rename.
- Do not touch start_of_day folders.

## Acceptance
- 2–4 deferred JSON ownership items resolved or explicitly deferred after investigation.
- Coverage remains preserved.
- Sample 1902 remains exempt.
- Targeted tests pass.
- Full suite is skipped unless justified.
