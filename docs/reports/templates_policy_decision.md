# templates/ Policy Decision

Generated: 2026-04-12
Scope: Policy classification for `templates/` only.

## Current Classification Options
- `keep-in-place-for-now`
- `migrate-later`
- `needs-manual-review`

## Chosen Classification (This PR)
- `keep-in-place-for-now`

## Rationale (Evidence-Grounded)
From `templates_live_usage_inventory.md`:
- `templates/` has live code + test + docs references.
- Runtime helpers (`tools/shared/vectorNativeTemplate.js`, `tools/shared/vectorTemplateSampleGame.js`) rely on exact path strings.
- Tests (`tests/tools/VectorNativeTemplate.test.mjs`) assert exact template path values.
- Active planning/docs currently enforce deferment and non-destructive cleanup sequencing.

Given this coupling, move/delete/repath actions are unsafe without coordinated multi-surface updates.

## Allowed Now
- Document inventory and policy.
- Add validation guards for future cleanup lanes.
- Keep roadmap/docs tracking in sync without rewriting runtime/template consumers.

## Forbidden Now
- Move, rename, or delete `templates/` or any file under it.
- Rewrite runtime imports/paths to remove `templates/` references.
- Mix template migration with unrelated cleanup targets or feature work.

## Exact Prerequisites For Future Migration/Removal Lane
1. Full reference inventory refreshed and confirmed (code/tests/docs).
2. Runtime helper path abstraction plan approved (remove hard-coded template-root coupling).
3. Test suite updates prepared to align with new canonical template location.
4. Docs/contracts synchronized in same PR (roadmap + cleanup targets + template guidance docs).
5. Pre/post validation checklist executed (search + tests + smoke surfaces).
6. Explicit rollback plan and path map included in the migration PR.

## Reclassification Signals (When Policy Can Change)
Policy may move from `keep-in-place-for-now` to `migrate-later` only when:
- hard-coded runtime path assumptions are abstracted or isolated,
- template path assertions in tests are intentionally updated with equivalent coverage,
- docs/contracts are prepared for synchronized path changes,
- migration can be executed as one exact-scope, test-backed lane.

Policy may move to `future-delete-candidate` only when:
- no live runtime/test/docs dependencies remain,
- replacement source-of-truth exists and is validated,
- delete decision is proven by zero-reference scans and acceptance checks.

## Decision Summary
- `templates/` remains intentionally retained in place for now.
- This BUILD records policy and guards only; no structural repo change is executed.
