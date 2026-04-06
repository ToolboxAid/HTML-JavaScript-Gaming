# BUILD_PR_DEBUG_SURFACES_NETWORK_PROMOTION

## Purpose
Translate the approved promotion plan into an executable build package describing the exact target structure, ownership map, migration order, validation checklist, and rollback rules for promoting network debug surfaces.

## Authoritative Target Structure
```text
src/engine/debug/network/
  providers/
  panels/
  commands/
  dashboard/
  diagnostics/
  bootstrap/
```

## Minimal Core Contract Area
```text
src/engine/core/debug/
  NetworkDebugContracts.js
  NetworkDebugRegistrationHooks.js
  NetworkDebugGate.js
```

## Ownership Matrix
| Component | Destination |
|---|---|
| Shared network providers | engine/debug/network |
| Shared network panels | engine/debug/network |
| Shared network commands | engine/debug/network |
| Server dashboard host/registry/renderer | engine/debug/network/dashboard |
| Divergence/trace presentation helpers | engine/debug/network/diagnostics |
| Synthetic sample feeds | project/sample-owned |
| Scenario wiring | project/sample-owned |
| Reproduction docs | docs/pr + docs/roadmaps |
| Minimal registration/gating hooks | engine/core/debug |

## Migration Order
1. Define minimal core contracts only.
2. Extract shared providers.
3. Extract shared panels/renderers.
4. Extract shared commands.
5. Extract dashboard foundation/enhancements.
6. Add bootstrap/composition layer.
7. Reconnect sample integrations through public registration.
8. Run full validation across samples/dashboard.

## Guardrails
- No redesign during extraction.
- No runtime feature expansion.
- No server product UI work.
- No console-overlay-dashboard coupling.
- No sample-specific scenario logic in shared layers.

## Validation Checklist
- Sample A passes.
- Sample B passes.
- Sample C passes.
- Dashboard renders and refreshes.
- Latency/trace/divergence outputs remain correct.
- Public command paths remain intact.
- Debug-only gating remains intact.

## Rollback Rule
If parity is broken, revert to sample-owned wiring and keep docs/history intact.
