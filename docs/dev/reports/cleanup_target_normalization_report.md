# Cleanup Target Normalization Report

Generated: 2026-04-12
Scope: Consistency check across approved sources only.

Compared Sources:
- `docs/dev/reports/repo_cleanup_targets.txt`
- `docs/dev/reports/cleanup_live_reference_inventory.txt`
- `docs/dev/reports/cleanup_keep_move_future_delete_matrix.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`
- templates-policy artifacts where relevant

## Target Consistency Matrix

| Target | Name Consistency | Path Consistency | Classification Consistency | Tracking Presence | Mismatch Found? |
| --- | --- | --- | --- | --- | --- |
| `templates/` | yes | yes | no | yes | yes |
| `docs/archive/tools/SpriteEditor_old_keep/` policy target | yes (policy label vs path label both map to same target) | yes | yes | yes | no |
| `legacy class-retention policy marker` policy target | yes | yes (as policy placeholder path) | yes | yes | no |
| `docs/archive/` archived-notes policy target | yes | yes | yes | yes | no |
| Legacy import path patterns | yes | yes (pattern-based target) | yes | yes | no |
| Eventual legacy-retirement planning target | yes | yes (planning-path target) | yes | yes | no |

## Mismatch Details

### `templates/`
- Exact mismatch:
  - Matrix classification in `cleanup_keep_move_future_delete_matrix.md`: `needs-manual-review`.
  - Templates policy decision in `templates_policy_decision.md`: `keep-in-place-for-now`.
- Impact:
  - Enforcement lanes must treat templates as retained/deferred by active templates policy, while matrix classification remains broader.
- Correction recommendation:
  - In a future docs-only alignment lane, reconcile matrix classification with the active templates policy decision (without introducing structural cleanup actions).

## Alignment Summary
- All approved targets are present and traceable across cleanup targets, inventory, matrix, and roadmap tracking.
- Aside from the templates classification terminology mismatch, alignment is acceptable for this enforcement/normalization pass.
- No wording rewrites were applied in this PR to force normalization.



