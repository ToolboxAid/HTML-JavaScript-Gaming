# Archived Notes Policy Decision

Generated: 2026-04-12
Scope: Policy classification for archived notes target `docs/archive/`.

## Classification Options Considered
- `keep-in-place-for-now`
- `migrate-later`
- `needs-manual-review`

## Chosen Classification (This PR)
- `keep-in-place-for-now`

## Rationale (Evidence-Grounded)
From cleanup source-of-truth artifacts:
- `cleanup_live_reference_inventory.txt` classifies archived notes target as live-reference and documented.
- `cleanup_keep_move_future_delete_matrix.md` classifies archived-notes policy target as `keep` with policy-definition follow-up.

From current inventory scan:
- `docs/archive/` exists with active docs references across structure/navigation/policy surfaces.
- Explicit path destinations under `docs/archive/` are encoded in active docs contracts.
- No test/config references were found, but documentation coupling is broad and active.

Given this coupling, move/delete/repath actions are unsafe without synchronized multi-doc updates and explicit migration sequencing.

## Allowed Now
- Document archived-notes inventory, policy, and validation guard artifacts.
- Keep policy tracking synchronized in cleanup reports/roadmap state (bracket-only if used).
- Retain `docs/archive/` in place.

## Forbidden Now
- Move, rename, delete, or rewrite any file/path under `docs/archive/` in this lane.
- Structural cleanup mixed with unrelated targets (`templates`, `SpriteEditor_old_keep`, `classes_old_keep`, legacy import guard work).
- Runtime or repo-structure edits under this policy-only BUILD.

## Exact Prerequisites For Future Migration/Removal Lane
1. Refresh reference inventory and confirm all consumers of `docs/archive/`.
2. Produce explicit source->destination path map for any archive movement.
3. Prepare synchronized docs updates for all structure/navigation/policy references in the same PR.
4. Define rollback plan with reversible path map.
5. Execute pre/post validation guard checks (reference scan, structural diff checks, protected path checks, and docs consistency checks).
6. If any tooling/tests become path-coupled in the future, include those validations in the same migration lane.

## Reclassification Signals (Future)
Policy may move from `keep-in-place-for-now` to `migrate-later` only when:
- reference surface is fully enumerated and destination mapping is approved,
- synchronized docs update set is prepared,
- migration can run as one exact-scope validated lane.

Policy may move to deletion-oriented consideration only when:
- no active references remain,
- retained historical value is addressed by an approved replacement retention strategy,
- validation evidence confirms zero-reference state and no policy/navigation regressions.

## Decision Summary
- Archived notes remain retained in place for now.
- This BUILD is policy/guard documentation only and performs no structural repo change.
