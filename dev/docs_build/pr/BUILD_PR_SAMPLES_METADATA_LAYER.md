# BUILD_PR_SAMPLES_METADATA_LAYER

## Objective
Implement metadata layer for samples and integrate with index generation.

## Scope
- Add metadata source (JSON or JS)
- Wire into samples index generation
- Validate against canonical paths (phasexx/xxyy)

## Out of Scope
- gameplay
- engine changes

## Acceptance
- metadata drives titles/descriptions
- links resolve correctly
- fail-fast on mismatches
