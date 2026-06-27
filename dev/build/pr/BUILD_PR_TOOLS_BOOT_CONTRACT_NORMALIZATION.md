# BUILD_PR_TOOLS_BOOT_CONTRACT_NORMALIZATION

## Purpose
Standardize how tools boot, initialize, and expose capabilities so they can be hosted consistently.

## Goals
- consistent init signature
- predictable lifecycle hooks
- no UI/theme changes

## Scope
- tool entry points
- init/bootstrap logic
- lightweight adapters

## Out of Scope
- rendering logic
- editor state
- styling

## Validation
- npm run test:launch-smoke -- --tools
- all tools still launch
