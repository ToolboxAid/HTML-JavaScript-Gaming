# BUILD_PR_SAMPLES_PRESENTATION_PREVIEW_AND_METADATA_NORMALIZATION

## Objective
Implement a final, testable normalization wave for sample presentation, runtime-derived preview assets, tag semantics, and engine-class reporting across the samples system.

This BUILD must apply the following user-approved adjustments:

1. create preview SVG for all samples based on what the sample canvas looks like when the sample is running
2. remove tags that are the sample number, phase, or sample name
3. correct all "Engine Classes Used" entries so they reference `engine/<class>` consistently
4. set tags to classes used, excluding `engine` and `theme`
5. remove preview image from the sample page
6. keep tags at the top
7. keep Back to Samples and Prev / Next navigation
8. move Related Samples under the canvas and before Engine Classes Used
9. ensure H1 and description are at the top of the page
10. correct the names on `samples/index.html` for 1316, 1317, 1318 so they exactly match the sample page names

Canonical path contract remains:
- `samples/phaseXX/XXYY/index.html`

## PR Purpose
One purpose only:
- normalize sample presentation and sample metadata display consistency using runtime-representative previews

## In Scope
- create or generate preview SVG assets for all samples using the actual running canvas output as the visual source
- ensure preview assets visually represent the rendered sample scene rather than generic placeholders
- ensure sample detail pages no longer show a preview image block in the page body
- normalize sample page structure so:
  - H1 is at the top
  - description is directly below the H1
  - tags remain near the top
  - Back to Samples and Prev / Next remain present
  - Related Samples appears below the canvas and before Engine Classes Used
- normalize tags so tags represent classes used only, excluding:
  - engine
  - theme
  - phase number
  - sample number
  - sample name
- normalize Engine Classes Used so entries consistently reference the engine folder/class relationship
- update `samples/index.html` names for 1316 / 1317 / 1318 to match the corresponding sample pages exactly

## Out of Scope
- no gameplay changes
- no engine-core changes
- no canonical path changes
- no new dependency installation
- no broad metadata schema redesign beyond what is directly needed to normalize tags and presentation
- no unrelated performance work
- no favorites/pinning changes unless directly required to preserve current behavior

## Required Preview Behavior
1. Every sample has a preview SVG asset or a clearly generated preview SVG based on the sample's actual running canvas appearance.
2. The preview generation path must use the live or representative rendered scene as the source of truth.
3. The preview SVG should capture the look of the sample canvas, not a generic text-only or placeholder card.
4. If exact runtime capture cannot be fully automated for a subset of samples, fail fast and report which samples block automation rather than silently substituting generic placeholders.

## Required Page Behavior
1. Sample detail pages do not show the preview image block in the final page layout.
2. H1 and description are the first visible content at the top of the sample page.
3. Tags remain at the top section of the sample page.
4. Back to Samples and Prev / Next navigation remain intact.
5. Related Samples appears below the canvas and before Engine Classes Used.
6. Engine Classes Used entries are normalized to the `engine/<ClassName>` style or the exact repo-appropriate engine folder/class reference format used consistently across all samples.
7. Tags reflect classes used and exclude engine/theme/system-noise labels.
8. `samples/index.html` labels for 1316 / 1317 / 1318 exactly match their sample page titles.

## Expected Targets
Codex should keep reads narrow and stop if the actual required target list expands materially.

Expected implementation targets:
- `samples/index.html`
- sample metadata source(s) directly used for titles, tags, related items, and engine-classes-used presentation
- minimal sample detail rendering files/templates/helpers directly controlling sample page layout
- preview SVG generation path or preview asset mapping files directly needed to produce runtime-representative previews
- report files under `docs/` only for output packaging

## Windows / Execution Constraints
- target platform: Windows
- prefer Node.js or vanilla JS where scripting support is needed
- DO NOT run `npm install`
- DO NOT create `package.json`
- DO NOT create `package-lock.json`
- DO NOT create or populate `node_modules/`
- no PowerShell path interpolation
- ZIP output under `<project folder>/tmp/` is mandatory

## Validation Requirements
Minimum required validation:
- open representative sample pages and verify:
  - H1 is at the top
  - description is directly below H1
  - tags are near the top
  - preview image block is removed
  - canvas renders in normal position
  - Related Samples appears below the canvas and before Engine Classes Used
  - Back to Samples and Prev / Next remain present and functional
- verify Engine Classes Used formatting is normalized on representative samples
- verify tags exclude sample-number / phase / sample-name noise
- verify tags reflect classes used while excluding `engine` and `theme`
- verify preview SVG assets exist for representative samples and visually match the running canvas appearance
- verify `samples/index.html` names for 1316 / 1317 / 1318 match their sample pages exactly
- verify Phase 13 samples 1316, 1317, 1318 still load correctly
- verify console stays clean for tested pages

## Acceptance Criteria
- all 10 approved adjustments are implemented
- preview SVGs are derived from what the sample canvas looks like when running
- no gameplay changes
- no engine-core changes
- canonical sample paths remain unchanged
- changed-file count stays minimal for the scope
- repo-structured delta ZIP is produced under `<project folder>/tmp/`

## Fail Fast
Stop and report if:
- runtime-representative preview SVG generation would require a broad asset pipeline redesign
- engine-class normalization would require engine-core changes
- layout normalization requires unrelated page architecture rewrites
- implementation expands beyond sample presentation and metadata display normalization
- the ZIP cannot be produced at the exact requested path
