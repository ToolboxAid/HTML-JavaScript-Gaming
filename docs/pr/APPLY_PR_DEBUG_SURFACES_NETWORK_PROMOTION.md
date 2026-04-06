# APPLY_PR_DEBUG_SURFACES_NETWORK_PROMOTION

## Purpose
Apply the approved extraction and promotion of shared network debug capabilities into a reusable engine-debug network layer while preserving current behavior.

## Execution Rules
- Behavior parity first.
- Extraction/relocation only unless explicitly required for wiring.
- No unrelated refactors.
- No engine core UI logic.
- Keep sample-owned scenarios local.

## Apply Steps
1. Create minimal engine-core contract files.
2. Create `engine/debug/network` structure.
3. Move shared providers into `engine/debug/network/providers`.
4. Move shared panels/renderers into `engine/debug/network/panels`.
5. Move shared commands into `engine/debug/network/commands`.
6. Move dashboard foundation/enhancement pieces into `engine/debug/network/dashboard`.
7. Add bootstrap/composition wiring.
8. Reconnect sample integrations through public registration.
9. Validate end-to-end.

## Required Validation
- Existing network smoke checks still pass.
- Server dashboard sections still render/update.
- Unknown group/macro/network identifiers still fail safely.
- No runtime mutations introduced.
- No console/overlay regressions.

## Roadmap Notes
Update roadmap trackers with bracket-only edits only after validation confirms promotion readiness milestones.
