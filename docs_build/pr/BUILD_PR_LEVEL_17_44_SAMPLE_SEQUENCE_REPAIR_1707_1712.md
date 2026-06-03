# BUILD_PR_LEVEL_17_44_SAMPLE_SEQUENCE_REPAIR_1707_1712

## Instructions for Codex

1. Unpack 1707-1712.zip
2. Inspect each folder
3. Map each folder to correct sample:
   - 1707
   - 1708
   - 1709
   - 1710
   - 1711
   - 1712

4. For each sample:
   - move to samples/phase-17/<sample-folder>
   - ensure standalone execution
   - remove cross-sample coupling

5. Shared logic:
   - move reusable logic to samples/shared ONLY if reused
   - do not promote to engine

6. Update:
   - samples/index.html
   - correct ordering (1707–1712)

## Constraints
- DO NOT delete user work
- DO NOT create new engine systems
- DO NOT renumber incorrectly

## Validation
- all samples load
- sequence is continuous
- no console errors
