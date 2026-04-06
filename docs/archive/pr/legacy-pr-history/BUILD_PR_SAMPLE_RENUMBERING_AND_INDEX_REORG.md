# BUILD_PR_SAMPLE_RENUMBERING_AND_INDEX_REORG

## Goal
Reorganize and renumber the sample structure so the sample list remains manageable and future growth is cleaner.

## Requested Numbering Scheme
Rename samples to use a four-digit code:
- first two digits = level
- second two digits = sample number within that level

Example:
- `0101`
- `0102`
- `0124`

## Folder Rule
Samples should be grouped into level folders instead of one long flat list.

Example:
- `Phase 01 - Core Engine (0101-0124)/`

## Required Changes
1. Rename and regroup existing samples
2. Update `samples/index.html`
3. Add `Sample games` section between 11 and 12

## Sample games
Empty for now, reserved for:
- tile
- parallax
- other future sample games

## Scope
- sample renumbering
- sample folder reorganization
- samples/index.html update
- add empty Sample games section between phases 11 and 12

## Out of Scope
- engine core API changes
- unrelated gameplay refactors
