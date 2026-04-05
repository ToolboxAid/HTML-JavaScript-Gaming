Toolbox Aid
David Quesenberry
04/05/2026
BUILD_PR_OVERLAY_BOUNDARY.md

# BUILD_PR_OVERLAY_BOUNDARY

## Objective
Build a docs-only PR bundle that operationalizes the approved Dev Console vs Debug Overlay boundary with explicit rules and acceptance targets.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## Deliverables In This Bundle
- `docs/pr/PLAN_PR_OVERLAY_BOUNDARY.md`
- `docs/pr/BUILD_PR_OVERLAY_BOUNDARY.md`
- `docs/pr/APPLY_PR_OVERLAY_BOUNDARY.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
- `docs/dev/next_command.txt`
- `docs/dev/reports/change_summary.txt`
- `docs/dev/reports/validation_checklist.txt`
- `docs/dev/reports/file_tree.txt`

## Integration Boundary (Sample-Level)
Reference sample only:
- `samples/Phase 12 - Demo Games/Demo 1205 - Multi-System Demo/MultiSystemDemoScene.js`

No engine core changes are part of this BUILD bundle.

## Required Boundary Contract
1. Dev Console is the only command/input surface.
2. Debug Overlay is the only passive telemetry/HUD surface.
3. Any shared data must flow through public selectors/events/adapters.
4. Private internal state from either surface is not a contract.

## Allowed Interaction Contract
- Console command execution may update runtime state.
- Overlay telemetry may read runtime/debug snapshots.
- Overlay may show command outcomes only if present in shared public snapshot/state.

## Prohibited Coupling Contract
- Overlay parsing/executing commands.
- Console controlling overlay layout internals.
- Hidden two-way dependency on private implementation details.
- Engine-level coupling added only for console-overlay wiring.

## Ownership Matrix
| Area | Owner | Notes |
|---|---|---|
| Command input, caret, history, autocomplete | Dev Console | Overlay cannot depend on this |
| Command registry execution | Dev Console | Through public command gateway |
| Visual diagnostics panels | Debug Overlay | Console cannot own panel layout |
| HUD drawing and ordering | Debug Overlay | Overlay rendered as passive telemetry |
| Shared snapshot access | Shared public adapter | Read-only, stable contract |

## Validation Goals
- Distinction is explicit in docs and actionable.
- Console-only behavior remains in console path.
- Overlay-only behavior remains in overlay path.
- Sample-level reference is documented and sufficient.
- Bundle contains docs only.

## Acceptance Criteria
- Required sections are present: allowed interactions, prohibited coupling, public contracts, ownership matrix, validation goals, rollout notes.
- Docs define one PR purpose only.
- No implementation files are included.

## Rollout Notes
- This BUILD bundle is docs-first and non-destructive.
- APPLY phase should only enforce boundary usage at sample-level integration points.
- If an engine-level need appears, stop and open a separate PR purpose.
