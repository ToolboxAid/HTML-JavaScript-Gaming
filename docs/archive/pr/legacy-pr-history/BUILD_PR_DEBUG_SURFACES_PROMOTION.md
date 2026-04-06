# BUILD_PR_DEBUG_SURFACES_PROMOTION

## Objective
Create an authoritative docs-only BUILD bundle for extraction/relocation of proven debug surfaces from `tools/dev` into shared layers, with no feature expansion.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## Build Constraints
- docs-first only
- one PR purpose only
- extraction/relocation only
- no feature expansion
- minimize engine-core changes
- preserve `MultiSystemDemoScene.js` as proving integration

## Authoritative Target Structure
```text
engine/
  core/
    debug/
      DebugSurfaceContracts.js
      DebugRegistrationHooks.js
      DebugEnvironmentGate.js
  debug/
    console/
      DevConsoleHost.js
      DevConsoleCommandBridge.js
    overlay/
      DebugOverlayHost.js
      OverlayPanelRegistry.js
      OverlayPersistenceAdapter.js
    providers/
      OverlayProviderRegistry.js
    bootstrap/
      DebugSurfacesBootstrap.js

project|sample|tool/
  debug/
    panels/        (local only)
    providers/     (local only)
    commands/      (local only)
```

## Ownership Matrix
| Capability | Engine Core | Engine Debug | Project/Sample/Tool |
|---|---|---|---|
| Debug contracts/hooks | Owns | Consumes | Consumes |
| Console host runtime | No | Owns | Integrates |
| Overlay host runtime | No | Owns | Integrates |
| Panel registry | No | Owns | Extends via public registration |
| Provider registry/plumbing | No | Owns | Extends via local providers |
| Operator command wiring | No | Owns | May register local commands |
| Persistence adapter boundary | No | Owns | May provide local storage key/config |
| Sample-specific panels/providers/commands | No | No | Owns |

## Ordered Migration Steps
1. Freeze ownership boundaries and no-go rules.
2. Extract minimal core contracts/hooks into `engine/core/debug`.
3. Relocate console host/bridge to `engine/debug/console`.
4. Relocate overlay host/registry/persistence adapter to `engine/debug/overlay`.
5. Relocate provider registry/plumbing to `engine/debug/providers`.
6. Add shared bootstrap/composition in `engine/debug/bootstrap`.
7. Rewire `MultiSystemDemoScene.js` through public bootstrap/registration APIs.
8. Validate parity and boundary compliance.

## Validation Goals
- no feature expansion introduced
- console commands still function through public command registry
- overlay still renders deterministically
- provider reads remain read-only
- panel persistence behavior remains stable
- sample-specific artifacts remain outside shared layers
- engine-core remains contract-only
- `MultiSystemDemoScene.js` continues as proving integration

## Rollback Strategy
If migration is unstable:
1. keep extracted core contracts/hooks unchanged
2. revert relocation stages in reverse order (bootstrap -> providers -> overlay -> console)
3. restore prior sample wiring
4. re-run parity checks before retry

## Rollout Notes
- BUILD bundle remains docs-only and implementation-ready
- APPLY should execute incremental relocation with validation after each stage
- stop and split scope if migration requires non-minimal core changes

## Deliverables
- `docs/pr/PLAN_PR_DEBUG_SURFACES_PROMOTION.md`
- `docs/pr/BUILD_PR_DEBUG_SURFACES_PROMOTION.md`
- `docs/pr/APPLY_PR_DEBUG_SURFACES_PROMOTION.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
- `docs/dev/reports/change_summary.txt`
- `docs/dev/reports/validation_checklist.txt`
- `docs/dev/reports/file_tree.txt`
