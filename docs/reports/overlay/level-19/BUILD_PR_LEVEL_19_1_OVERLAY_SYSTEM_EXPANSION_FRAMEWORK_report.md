# BUILD_PR_LEVEL_19_1_OVERLAY_SYSTEM_EXPANSION_FRAMEWORK Report

## Purpose
Establish a reusable overlay expansion framework with explicit contracts while keeping current runtime behavior unchanged.

## Extension Contracts
- `samples/phase-17/shared/overlayExpansionContracts.js`
  - `defineOverlayExtensionContract(...)`
  - `createOverlayExtensionContractMap(...)`
  - `getOverlayControllerConfigFromContract(...)`

Contract fields:
- `id`
- `channel`
- `overlays` (`{ id, label }[]`)
- `initialOverlayId`
- `cycleKey`
- `persistenceKey`
- `metadata`

## Integration Pattern (Config-Driven Compatibility)
1. Define overlay contracts with `defineOverlayExtensionContract(...)`.
2. Group contracts in a map with `createOverlayExtensionContractMap(...)`.
3. Derive controller-ready configs through `getOverlayControllerConfigFromContract(...)`.
4. Keep scene wiring unchanged by continuing to consume the existing stack-config shape:
   - `overlays`
   - `initialOverlayId`
   - `cycleKey`
   - `persistenceKey`

## Level 17 Adoption
- `samples/phase-17/shared/overlayStackBySampleConfig.js`
  - now sources sample stack configs from the new contract definitions
  - exports extension accessors:
    - `getLevel17OverlayExtensionContract(sampleId)`
    - `listLevel17OverlayExtensionContracts()`

## Behavior Impact
- No runtime behavior changes intended.
- Overlay ordering, cycle key behavior, persistence, and panel rendering remain unchanged.
