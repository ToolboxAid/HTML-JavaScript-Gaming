# BUILD_PR_LEVEL_18_2_REMOVE_SAMPLE_LOGIC_FROM_ENGINE

## Purpose
Remove any sample-specific logic from engine paths to complete Level 18.

## Scope
- Single purpose: decouple sample logic from engine
- No feature additions

## Required Changes
1. Identify sample-specific conditionals, assets, or behaviors inside engine modules.
2. Move such logic into:
   - samples/* or games/*
3. Replace with engine-agnostic interfaces (hooks/adapters) if needed.

## Validation
- node ./scripts/run-node-tests.mjs
- npm test
- Ensure no behavior regressions in samples

## Acceptance
- Engine contains no sample-specific logic
- All samples continue to function
