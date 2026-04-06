# APPLY_PR_DEBUG_SURFACES_PROMOTION

## Objective
Apply the approved extraction/relocation plan for debug surfaces with no feature expansion and minimal engine-core changes.

## Apply Scope
- relocate proven reusable debug systems into `engine/debug`
- keep engine-core changes limited to debug contracts/hooks
- preserve local ownership for sample-specific panels/providers/commands
- preserve `MultiSystemDemoScene.js` as proving integration

## Guardrails
- no feature expansion
- no engine-core UI behavior ownership
- no private console-overlay coupling
- no promotion of sample-specific artifacts into shared layers

## Apply Sequence
1. core contracts/hooks extraction
2. console relocation
3. overlay/registry/persistence relocation
4. provider plumbing relocation
5. bootstrap integration
6. sample proving rewire
7. parity + boundary validation

## Apply Validation
- command/control and telemetry boundaries remain intact
- overlay operator commands use public APIs only
- registry remains runtime source of truth
- provider and persistence behaviors remain stable
- no unrelated files or systems changed

## Expected Outcome
Debug surfaces are promoted out of `tools/dev` into shared `engine/debug` structure while engine-core remains minimal and local sample integrations stay local.
