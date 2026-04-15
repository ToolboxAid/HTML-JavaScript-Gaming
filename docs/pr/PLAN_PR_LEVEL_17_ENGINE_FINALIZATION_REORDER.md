# PLAN_PR_LEVEL_17_ENGINE_FINALIZATION_REORDER

## Purpose
Reorder and clarify Section 17 "Finalize engine" without changing scope, intent, or removing any items.

## Rules
- Do NOT remove any items
- Do NOT change core meaning
- Only reorder and clarify wording
- Keep status markers intact

## Updated Section 17 (Reordered)

## 17. Finalize engine

### Engine Integrity
[ ] Verify all samples/ and games/ must use engine and not coded locally, if local, update to use engine
[ ] single class per file

### Network Alignment
[ ] simulated code (like some of the network samples) should be converted to use real networks (tests may require mocks)

### Samples & Games Normalization
[ ] organize/rebuild samples/games so they are as if new construction with proper classes/data/etc in proper folder
[ ] some games are actually samples/demo, identify and recommend a phase-xx to move to

### Documentation Cleanup
[ ] docs/organization, classify all ./docs/ into buckets
[ ] arrange docs into a classification bucket
[ ] any doc that is a move/rename/etc. should be deleted (verify content is in the correct doc before deleting)
[ ] consolidate PR docs into single review surfaces per capability

### UI/CSS Normalization
[ ] flatten css layer, minimize layers, prefer shared top-level styles (button = single class where possible)

## Acceptance Criteria
- Section 17 reordered only
- No meaning changed
- No items removed
- Readability improved
