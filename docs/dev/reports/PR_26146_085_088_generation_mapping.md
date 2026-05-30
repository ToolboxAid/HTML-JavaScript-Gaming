# PR_26146_085-088 Generation Mapping

## Authoritative Inputs
- Populated Song Sheet sections.
- Song Sequence order.
- Apply Song Sheet To selections.

## Target Mapping
- Chords/Pad enabled:
  - Writes canonical `chords`.
  - Generates `pad` from the chord lane.
- Bass enabled:
  - Generates `bass` from the chord lane.
- Drums enabled:
  - Generates `drums` from the current section map.
- Lead enabled:
  - Generates `lead` from the chord lane.

## Summary Output
Song Sheet Summary now includes:
- Generation targets.
- Lane mapping.
- Manual lanes preserved.
- Target lanes affected.
- Sections used, bars generated, and notes generated.

## Regenerate Arrangement
- Added `Regenerate Arrangement`.
- Regenerate reparses the current guided Song Sheet, uses the current sequence, and applies the current target selections.
- Status reports the targets, generated bar count, generated note count, and preservation behavior.

## Manual Preservation
- Targeted lanes are regenerated.
- Untargeted lanes are preserved when their bar count matches the regenerated arrangement.
- Untargeted lanes that no longer match the regenerated bar count are aligned with rest bars to keep the canonical instrument grid parseable.

## Validation
- Playwright verified Chords/Pad and Bass generation while Drums and Lead were skipped.
- Playwright verified an untargeted Lead lane edit survived Regenerate Arrangement.
- Playwright verified enabling Lead caused Lead to regenerate from the Song Sheet.
