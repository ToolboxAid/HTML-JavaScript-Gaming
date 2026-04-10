# Codex command for BUILD_PR_SAMPLES_PRESENTATION_PREVIEW_AND_METADATA_NORMALIZATION

MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Execute BUILD_PR_SAMPLES_PRESENTATION_PREVIEW_AND_METADATA_NORMALIZATION exactly as written.

EXECUTION ENVIRONMENT (MANDATORY):
- Target platform: Windows
- Prefer Node.js or vanilla JS for any scripting or generation support
- DO NOT run `npm install`
- DO NOT create `package.json`
- DO NOT create `package-lock.json`
- DO NOT create or populate `node_modules/`
- DO NOT use PowerShell for path construction, rename-heavy work, or ZIP path generation

PR PURPOSE:
Normalize sample presentation, runtime-derived preview assets, metadata tags, and engine-class reporting consistently across the samples system.

EXPECTED TARGETS:
- `samples/index.html`
- sample metadata source(s) directly used for titles, tags, related items, and engine-classes-used presentation
- minimal sample detail rendering files/templates/helpers directly controlling page layout
- preview SVG generation path or preview mapping files directly needed for producing previews from the running sample canvas appearance
- reporting docs under `docs/`

DO NOT:
- modify gameplay code
- modify engine core
- change canonical paths
- broaden scope beyond presentation / runtime-preview / metadata display normalization
- modify `docs/dev/start_of_day/chatGPT/`
- modify `docs/dev/start_of_day/codex/`

REQUIRED IMPLEMENTATION SHAPE:
1. Create preview SVG assets for all samples based on the sample canvas appearance when running
2. Do not use generic placeholder cards as the final preview source
3. Remove preview image from sample detail pages
4. Ensure sample page layout is:
   - H1
   - description
   - tags
   - canvas
   - related samples
   - engine classes used
   - navigation retained
5. Normalize tags to classes used while excluding:
   - engine
   - theme
   - phase labels
   - sample numbers
   - sample names
6. Normalize Engine Classes Used references consistently to the engine folder/class format
7. Update `samples/index.html` labels for 1316 / 1317 / 1318 to exactly match the sample page titles
8. Keep changed-file count minimal for the approved scope

VALIDATION (REQUIRED):
- open representative sample pages and validate top-of-page structure
- confirm preview image block is removed from sample pages
- confirm tags remain at the top
- confirm Related Samples is below the canvas and before Engine Classes Used
- confirm Back to Samples and Prev / Next remain present and functional
- confirm Engine Classes Used formatting is normalized
- confirm tags exclude sample-number / phase / sample-name noise
- confirm preview SVG assets exist and visually match the running canvas appearance for representative samples
- confirm `samples/index.html` names for 1316 / 1317 / 1318 match sample page titles exactly
- confirm Phase 13 samples 1316, 1317, 1318 still load
- confirm console is clean for tested pages
- report exact files changed
- report exact validation performed

ZIP OUTPUT REQUIREMENT (HARD RULE):
- MUST produce ZIP:
  <project folder>/tmp/BUILD_PR_SAMPLES_PRESENTATION_PREVIEW_AND_METADATA_NORMALIZATION.zip
- ZIP must contain only repo-relevant delta output for this PR
- Do not stage ZIP files from `<project folder>/tmp/`
- Task is NOT complete until the ZIP exists at the exact requested path

FAIL FAST:
- runtime preview SVG generation requires broad asset pipeline redesign
- engine-class normalization requires engine-core changes
- layout normalization requires unrelated page architecture rewrites
- missing ZIP output at exact path
