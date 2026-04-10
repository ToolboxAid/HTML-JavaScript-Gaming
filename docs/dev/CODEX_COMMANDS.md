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

POWERSHELL PROHIBITION (CRITICAL):
The following patterns are NOT allowed:
- "$var/path"
- "${var}/path"
- "$base\$child"
- "$($var)/path"

If any of these appear:
- STOP
- report the violation
- do not silently retry

PR PURPOSE:
Normalize sample presentation, preview assets, metadata tags, and engine-class reporting consistently across the samples system.

EXPECTED TARGETS:
- `samples/index.html`
- sample metadata source(s) directly used for titles, tags, related items, and engine-classes-used presentation
- minimal sample detail rendering files/templates/helpers directly controlling page layout
- preview SVG asset generation path or preview mapping files directly needed for normalization
- reporting docs under `docs/`

DO NOT:
- modify gameplay code
- modify engine core
- change canonical sample paths
- broaden scope beyond presentation / preview / metadata display normalization
- modify `docs/dev/start_of_day/chatGPT/`
- modify `docs/dev/start_of_day/codex/`

REQUIRED IMPLEMENTATION SHAPE:
1. Create preview SVG assets for all samples using a consistent convention
2. Remove preview image from sample detail pages
3. Ensure sample page layout is:
   - H1
   - description
   - tags
   - canvas
   - related samples
   - engine classes used
   - navigation retained
4. Normalize tags to classes used while excluding:
   - engine
   - theme
   - phase labels
   - sample numbers
   - sample names
5. Normalize Engine Classes Used references consistently to the engine folder/class format
6. Update `samples/index.html` labels for 1316 / 1317 / 1318 to exactly match the sample page titles
7. Keep changed-file count minimal for the approved scope

VALIDATION (REQUIRED):
- open representative sample pages and validate top-of-page structure
- confirm preview image block is removed from sample pages
- confirm tags remain at the top
- confirm Related Samples is below the canvas and before Engine Classes Used
- confirm Back to Samples and Prev / Next remain present and functional
- confirm Engine Classes Used formatting is normalized
- confirm tags exclude sample-number / phase / sample-name noise
- confirm preview SVG assets exist and are wired consistently
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
- preview SVG generation requires broad asset pipeline redesign
- engine-class normalization requires engine-core changes
- layout normalization requires unrelated page architecture rewrites
- PowerShell parse issue before execution
- missing ZIP output at exact path
