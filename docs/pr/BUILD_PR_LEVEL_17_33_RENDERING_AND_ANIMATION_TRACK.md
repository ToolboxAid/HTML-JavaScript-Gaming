# BUILD_PR_LEVEL_17_33_RENDERING_AND_ANIMATION_TRACK

## Source of Truth
- docs/pr/PLAN_PR_LEVEL_17_33_RENDERING_AND_ANIMATION_TRACK.md

## Required Outcome
Implement a compact Level 17 rendering-and-animation demonstrator bundle with four bounded samples:
- 2 filled samples
- 2 image-skinned samples

## Required Samples
### Filled
1. Raycast Demo
   - filled corridor/wall rendering
   - simple navigation
   - unmistakable classic raycast look

2. Voxel World Demo
   - filled block world
   - simple chunk or grid structure
   - unmistakable voxel look

### Image-Skinned
3. Material / Texture Scene Demo
   - image-backed texture use
   - simple material/lighting proof
   - clear visual distinction from flat primitive sample output

4. Image-Skinned Character / Animated Surface Demo
   - image-backed skin or layered image body/parts presentation
   - simple animation or pose transition
   - educational and lightweight

## Integration Requirements
- add each sample to samples/index.html
- keep sample naming and numbering aligned to Level 17 continuation
- each sample must run independently
- preserve existing Level 17 samples

## Constraints
- one PR purpose only: rendering + animation demonstrator bundle
- bundle only because it reduces timeline and churn while staying testable
- no engine-wide rewrite
- no start_of_day edits
- no unrelated cleanup
- no roadmap prose rewrite in this PR

## Suggested Numbering
Use the next Level 17 advanced-sample continuation range in a clean grouped block, for example:
- 1622 raycast demo
- 1623 voxel world demo
- 1624 texture/material demo
- 1625 image-skinned character demo

If repo reality requires a nearby numbering variation, keep the block contiguous and clearly documented.

## Validation Standard
- all four samples load from samples/index
- filled samples visibly render filled output
- image-skinned samples visibly use image-backed presentation
- no new console errors
- samples are recognizably different in technique and teaching purpose
