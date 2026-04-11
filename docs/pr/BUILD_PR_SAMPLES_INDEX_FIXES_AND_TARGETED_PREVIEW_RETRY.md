# BUILD_PR_SAMPLES_INDEX_FIXES_AND_TARGETED_PREVIEW_RETRY

## PR Purpose
Apply one narrow samples-system fix bundle with three scoped actions only:
1. update `samples/index.html` header/dropdown labeling
2. fix the gameplay velocity explosion in Sample 1303 without engine changes
3. retry runtime preview SVG generation only for the explicitly listed failed samples, and only when the generated SVG still contains the text `Capture timeout`

This BUILD is docs-only. Codex owns all runtime/code edits.

## Truth Boundary
- ChatGPT created this BUILD bundle only.
- Codex must write any code, runtime scripts, and regenerated SVG files.
- Do not claim code completion unless Codex actually reports it.

## Locked / Protected Areas
Do **not** create, modify, replace, rename, or delete anything in:
- `docs/dev/start_of_day/chatGPT/`
- `docs/dev/start_of_day/codex/`

## Hard Constraints
- Single-purpose PR only
- No engine-core changes
- No layout changes outside `samples/index.html`
- No metadata/tag system changes
- Do not modify Samples `1316`, `1317`, or `1318`
- Do not broaden scope to other samples
- Do not re-run prior repo-wide failed-detection logic
- Retry only the listed sample preview SVGs
- Only regenerate a sample SVG when the current generated SVG contains the literal text `Capture timeout`
- Let the runtime settle before capture with adaptive wait and a **minimum of ~3 seconds**

## Scope Details

### 1) `samples/index.html`
Apply only these changes:
- Remove the header reference text:
  - `(xxyy - xxzz)`
- Update phase dropdown labels from the old format to exactly:
  - `Phase xx - <phase name>`

Notes:
- Keep the rest of `samples/index.html` behavior/layout intact.
- Do not modify per-sample metadata/tag rendering.

### 2) Gameplay Bug Fix — Sample 1303
Target:
- `samples/phase13/1303/*` only, plus any sample-local files required by that sample

Problem:
- In **Sample 1303 - Asteroids World Systems**, asteroid velocity can explode to extreme values (example observed: `4336107765`), making asteroids unusably fast.

Required fix:
- Add a **sample-local** cap/clamp on asteroid velocity so asteroid speed remains visible/playable.
- Choose a reasonable maximum speed consistent with Asteroids-style gameplay.
- Preserve normal movement feel.
- Do not change engine code.
- Do not alter other phase 13 samples.
- Do not change 1316/1317/1318.

Acceptance for this bug:
- Sample 1303 runs without runaway asteroid velocities.
- Asteroids remain visible on screen and playable.
- No engine files changed.

### 3) Targeted Runtime Preview SVG Retry
Retry preview generation **only** for the following samples:

- `0102`,`0107`,`0110`,`0116`,`0117`,`0119`
- `0206`,`0212`,`0218`,`0220`,`0221`,`0223`
- `0305`,`0306`,`0307`,`0308`,`0311`,`0318`,`0320`,`0322`,`0324`
- `0407`,`0409`,`0412`
- `0508`
- `0601`,`0603`,`0605`,`0607`,`0608`,`0612`
- `0707`,`0709`,`0712`
- `0801`,`0808`
- `0904`
- `1101`,`1102`,`1103`
- `1201`,`1202`,`1203`,`1206`,`1207`
- `1301`,`1302`,`1303`,`1305`,`1306`,`1307`,`1308`,`1309`,`1311`,`1313`,`1314`,`1315`
- `1401`,`1404`,`1410`,`1418`
- `1503`,`1506`

Preview retry rule:
- For each listed sample only, inspect the existing generated preview SVG.
- If and only if the SVG contains the text `Capture timeout`, regenerate that sample’s runtime preview SVG.
- If the SVG does **not** contain `Capture timeout`, leave it untouched.
- Do not retry any samples not listed above.
- Do not modify `1316`, `1317`, or `1318` even if adjacent logic would normally include them.

Capture execution guidance:
- Launch the sample runtime normally.
- Wait adaptively before capture, with a hard minimum delay of ~3 seconds.
- If a specific sample appears to need slightly longer stabilization, allow a slightly longer wait.
- Capture the runtime canvas result.
- Save back only the regenerated SVG for those samples that met the retry condition.

## Suggested Codex Execution Order
1. Update `samples/index.html`
2. Fix Sample 1303 velocity cap using sample-local code only
3. Process the targeted preview SVG retry list
4. Validate changed files and package output ZIP

## Validation Requirements
Codex must report these validations explicitly:

### A. Index validation
- Confirm the `(xxyy - xxzz)` text is removed from `samples/index.html`
- Confirm phase dropdown labels use `Phase xx - <phase name>`
- Confirm no other samples layout files were changed

### B. Sample 1303 validation
- Identify the exact file(s) changed in Sample 1303
- Confirm no engine files changed
- Confirm asteroid velocity is clamped/capped locally
- Confirm sample remains playable and asteroids no longer accelerate to runaway values

### C. Preview retry validation
For the listed sample set only, report:
- which samples had SVGs containing `Capture timeout`
- which of those were retried/regenerated
- which listed samples were skipped because their SVG did not contain `Capture timeout`
- confirm no samples outside the list were retried
- confirm `1316`, `1317`, `1318` were not touched

### D. Packaging validation
Produce a repo-structured delta ZIP containing only files relevant to this PR, plus the docs in this BUILD bundle.
Expected output location:
- `<project folder>/tmp/BUILD_PR_SAMPLES_INDEX_FIXES_AND_TARGETED_PREVIEW_RETRY_delta.zip`

## Non-Goals
- No engine cleanup/refactor
- No repo-wide preview regeneration
- No metadata/tag cleanup
- No changes to sample page layouts beyond the requested `samples/index.html` text updates
- No edits to 1316/1317/1318
- No APPLY docs in this step

## Expected Codex Deliverable
A repo-structured delta ZIP at:
- `<project folder>/tmp/BUILD_PR_SAMPLES_INDEX_FIXES_AND_TARGETED_PREVIEW_RETRY_delta.zip`

with only the files changed for:
- `samples/index.html`
- Sample 1303 local gameplay fix files
- regenerated preview SVG files for the listed retry set that actually contained `Capture timeout`
- supporting BUILD/PR docs if Codex includes them in its packaging flow
