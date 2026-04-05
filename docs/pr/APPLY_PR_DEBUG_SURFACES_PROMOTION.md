# APPLY_PR_DEBUG_SURFACES_PROMOTION

## Purpose

Apply the approved promotion plan by moving the proven debug-surface stack into a reusable `engine-debug` layer, while moving only minimal contracts/hooks into engine core.

## Apply Scope

### Promote to `engine-debug`
- console host
- overlay host
- panel registry
- provider registry/plumbing
- operator command wiring
- persistence
- debug bootstrap/composition

### Promote to `engine-core`
- debug interfaces
- registration contracts
- lifecycle hooks
- environment/debug gating hooks

### Keep Project-Owned
- sample-specific commands
- sample-specific panels
- sample-specific providers
- scene wiring
- tool-specific adapters

## Apply Rules

- no UI policy in engine core
- no sample panel migration into shared layers
- no direct console-to-panel coupling
- preserve public API boundaries
- keep provider flow read-only
- validate against existing demo integration

## Exit Criteria

- shared debug implementation no longer lives in `tools/dev`
- engine-debug contains the reusable platform
- engine-core contains only minimal contracts/hooks
- sample integration still works with minimal wiring change
