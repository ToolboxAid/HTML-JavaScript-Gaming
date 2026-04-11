# BUILD_PR_SAMPLES_RUNTIME_PREVIEW_SVG_CAPTURE

## PR Purpose
Generate runtime-derived preview SVG assets for samples by loading each runnable sample, allowing runtime/gameplay to proceed for 3 seconds, then capturing the live canvas appearance and producing the preview SVG from that runtime state.

## Scope
In scope only:
- sample preview generation script(s) or helper(s) directly responsible for preview creation
- preview SVG output location used by the samples system
- minimal automation hooks strictly required for capture orchestration
- minimal docs/reporting for this PR

Out of scope:
- gameplay changes
- engine-core refactors
- sample detail page layout changes
- tag/title/related/engine-classes-used normalization
- changes to `samples/index.html` except if strictly required to consume the existing preview asset path already used by the system
- any additional work on Phase 13 samples `1316`, `1317`, or `1318`
- any modification inside:
  - `docs/dev/start_of_day/chatGPT/`
  - `docs/dev/start_of_day/codex/`

## Frozen Samples
Do not perform more work on:
- `1316`
- `1317`
- `1318`

These samples are explicitly accepted visually as they are now and must not be restyled, relabeled, relaid out, or otherwise normalized in this PR.

## Required Implementation Shape
1. Load each target sample's actual runnable sample page.
2. Let the sample run for exactly 3000 ms before capture.
3. Capture the live canvas appearance after that runtime window.
4. Generate or update the preview SVG asset from that runtime-derived canvas state.
5. Ensure the final preview asset is based on real runtime output, not a placeholder or manually drawn card.
6. Keep changed-file count minimal and tightly scoped to runtime preview generation.

## Capture Rules
- Use the sample's real canvas output.
- Wait 3000 ms after runtime start before capture.
- Prefer deterministic capture where feasible.
- If a sample does not animate meaningfully, still capture its real canvas state at 3 seconds.
- Do not hand-draw preview art.
- Do not replace runtime-derived previews with generic cards.
- Preserve existing approved appearance for `1316`, `1317`, and `1318`.

## Target Files
Expected likely targets only if directly needed:
- preview generation scripts/helpers
- preview asset output folders/files used by the samples system
- minimal automation support files directly required for runtime capture
- docs under `docs/` for changed-file/validation reporting

## Validation Required
- confirm preview SVG assets exist for all samples targeted by the generation path
- confirm representative previews were captured from live runtime after 3 seconds
- confirm no placeholder preview cards remain as final generated assets for targeted samples
- confirm representative samples still load normally after any automation hooks
- confirm console is clean for tested representative samples
- report exact files changed
- report exact validation performed
- report any samples that could not be captured and the exact reason
- confirm `1316`, `1317`, and `1318` were not modified in this PR

## Acceptance Criteria
- Runtime preview generation works from actual sample canvas output.
- Capture timing is 3 seconds from runtime start.
- Preview assets are SVG outputs derived from runtime state.
- Scope remains limited to preview generation.
- `1316`, `1317`, and `1318` remain untouched.
- ZIP output exists at the requested path.

## ZIP Output Requirement
Must produce:
- `<project folder>/tmp/BUILD_PR_SAMPLES_RUNTIME_PREVIEW_SVG_CAPTURE.zip`

ZIP must:
- contain only repo-relevant delta output for this PR
- exclude staged ZIPs from `<project folder>/tmp/`

## Fail Fast
Stop and report failure immediately if:
- preview generation requires unrelated metadata/layout normalization
- runtime capture requires broad engine-core redesign
- capture cannot be performed from the actual sample canvas
- implementation would require changing `1316`, `1317`, or `1318`
- ZIP output is missing at the exact requested path
