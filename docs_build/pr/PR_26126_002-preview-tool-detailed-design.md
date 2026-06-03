# PR_26126_002 - Preview Generator V2 Detailed Design

## Purpose
Design the rebuild target for Preview Generator V2 as a clean, launchable tool surface at `tools/preview/index.html`.

Current repo state note: `tools/preview/index.html` is not present. The current inspected source for Preview Generator V2 behavior is `tools/preview/preview_svg_generator.html`. This design treats `tools/preview/index.html` as the intended rebuilt entrypoint and uses the existing generator file as the current behavior baseline.

## Source Inspected
- `tools/preview/preview_svg_generator.html`
- Current support dependency declared by that file: `tools/shared/preview/preview-pages.css`
- Current external runtime dependency declared by that file: `https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js`

No sample JSON, sample launch code, games, workspace, or runtime implementation files were modified for this design PR.

## Current Capabilities
- Captures visual previews from Samples, Games, or Tools.
- Accepts either direct paths or shorthand IDs/names.
- Loads targets through an iframe using a user-provided local base URL.
- Supports two capture modes:
  - Canvas Only
  - Full Screen, 1600x900 HTML page
- Writes generated output as `preview.svg`.
- Lets the user choose the repo root through the File System Access API.
- Writes to a configurable asset folder, defaulting to `assets/images`.
- Can skip existing previews unless rewrite rules allow replacement.
- Can rewrite only previews that contain the literal `Capture timeout`.
- Generates fallback SVG output when capture fails.
- Provides a runtime mode through URL parameters for isolated capture.
- Logs per-target progress, output path, warnings, failures, and summary counts.

## Rebuild Goal
Create a first-class Preview Generator V2 tool at `tools/preview/index.html` that preserves the useful current generator behavior while making the UI, contracts, errors, preview modes, and export actions explicit.

Preview Generator V2 should remain a file-generation utility plus a destination-aware asset registration helper. It must not own game/sample JSON, workspace state, toolState, `tools.*` published JSON, or a dedicated Preview Generator V2 schema.

No file named `tools/schemas/tools/preview-generator-v2.schema.json` is required or allowed by this design. Preview Generator V2 validates only the selected destination contract after the user chooses a target type.

## UI Regions

### Header
Purpose: Identify Preview Generator V2 and explain that it generates `preview.svg` assets.

Target placement:
- Top of `tools/preview/index.html`.
- Platform shell title/display name uses `Preview Generator V2`.
- Platform shell `shortDescription` uses: `Generate preview.svg assets for samples, games, and tools.`
- Include a concise status line for repo access and current run state.
- Avoid embedding sample or game-specific assumptions in the header.

### Target Selection Region
Purpose: Select what kind of entry is being captured.

Current inspected controls:
- `input#targetTypeSamples[type=radio][name=targetType][value=samples]`
- `input#targetTypeGames[type=radio][name=targetType][value=games]`
- `input#targetTypeTools[type=radio][name=targetType][value=tools]`

Target native radio contract:

```html
<input id="previewTargetModeSample" type="radio" name="group1" value="sample">
<input id="previewTargetModeGame" type="radio" name="group1" value="game">
<input id="previewTargetModeTool" type="radio" name="group1" value="tool">
```

Target behavior:
- Target selection must use native HTML radio inputs only.
- Every target mode must belong to the same native radio group: `name="group1"`.
- Do not implement target mode selection with custom segmented controls, dropdowns, toggle buttons, div/button state, or ARIA-only radio substitutes.
- No target type is assumed at launch; none of the `group1` radios is checked by default.
- Target-specific controls, validation, and export behavior remain idle until the user selects Sample, Game, or Tool.
- Sample mode resolves `0107` and `samples/phase-01/0107/index.html`.
- Game mode resolves `Bouncing-ball` and `games/Bouncing-ball/index.html`.
- Tool mode resolves `Vector Map Editor` and `tools/Vector Map Editor/index.html`.
- Game mode selects `tools/schemas/tools/asset-browser.schema.json` as the destination schema for preview asset registration.
- Game mode updates the asset-browser-compatible preview field/entry for the generated game preview image.
- If no `group1` radio is selected, validation, render, export, and destination JSON update actions are blocked with no fallback target mode.

### Capture Source Region
Purpose: Configure where targets are loaded from and how long capture waits.

Current controls:
- `input#baseUrl[type=text]`, default `http://127.0.0.1:5500`
- `input#waitMs[type=number]`, default `3500`, min `3000`, step `500`

Target behavior:
- Base URL is required before Execute.
- Wait must be clamped to at least `3000ms`.
- Games may apply an additional start delay after sending Enter.
- Invalid or empty base URL blocks Execute with a visible error.

### Repo And Output Region
Purpose: Select the repo root and configure output folder.

Current controls and displays:
- `button#pickRepoBtn` - Pick Repo Folder
- `div#repoSelectedValue` - selected repo display
- `input#assetFolder[type=text]`, default `assets/images`
- `div#writeFolderSampleValue` - example write folder
- `div#writeFolderActualValue` - resolved output folder for first entry

Target behavior:
- Pick Repo Folder must request read/write access.
- Execute remains disabled until repo root is selected.
- Asset folder is normalized to slash-separated relative path.
- Empty asset folder resolves to `assets`.
- Preview path displays update when target type, asset folder, or input list changes.

### Entry List Region
Purpose: Let the user paste one or more targets.

Current control:
- `textarea#sampleList`

Target behavior:
- Accept multiline input.
- Trim blank lines.
- De-duplicate case-insensitively.
- Preserve entered order for execution.
- Show parsing errors per line rather than aborting the full batch.

### Rewrite Options Region
Purpose: Control when an existing `preview.svg` is replaced.

Current controls:
- `input#forceRewrite[type=checkbox]`
- `input#onlyCaptureTimeout[type=checkbox]`, checked by default

Target behavior:
- Force rewrite replaces existing `preview.svg`.
- If force rewrite is off and no output exists, write.
- If `Only rewrite if preview.svg contains literal "Capture timeout"` is on:
  - rewrite only when the existing preview includes `Capture timeout`;
  - otherwise skip.
- If both force rewrite and timeout-only are off, rewrite is allowed by explicit user intent.

### Capture Mode Region
Purpose: Choose visual capture strategy.

Current controls:
- `input#captureModeFullScreen[type=radio][name=captureMode][value=fullscreen1600]`
- `input#captureModeCanvasOnly[type=radio][name=captureMode][value=canvasOnly]`, checked by default

Target behavior:
- Canvas Only captures the first canvas from the loaded target document.
- Full Screen captures the target body at 1600x900 using `html2canvas` when available.
- Full Screen falls back to best available element/canvas capture when `html2canvas` fails.
- Capture mode changes do not mutate any sample, game, tool, or destination JSON payload.

### Action Region
Purpose: Run and control capture.

Current controls:
- `button#executeBtn` - Execute, disabled until repo folder is selected
- `button#stopBtn` - Stop, disabled until execution starts

Target behavior:
- Execute starts batch processing.
- Execute disables while running.
- Stop requests cancellation after the current target completes.
- Stop must not interrupt a file write midway.
- Buttons should show disabled states that match the current run state.

### Status And Log Region
Purpose: Report current state, per-item progress, and summary.

Current displays:
- `div#status`
- `div#log`

Target behavior:
- Status shows repo selection and current run state.
- Log is append-only during a run.
- Log auto-scrolls to latest entry.
- Summary groups Written, Warnings, Failed, and Skipped entries.
- Errors must include the target label and concrete failure reason.

### Capture Frame Region
Purpose: Isolated loader for the target page.

Current element:
- `iframe#frame`

Target behavior:
- The iframe loads target pages from `baseUrl`.
- Runtime capture mode may hide the normal UI and render a capture canvas.
- The iframe should be sandboxed only where compatible with target execution.
- Capture failures must produce a visible error and fallback SVG when writing is possible.

## Control Placement Table

| Region | Control | Current ID | Target Placement | Primary Action |
| --- | --- | --- | --- | --- |
| Target Selection | Sample radio | `previewTargetModeSample` | Top-left controls | Native `input[type=radio][name=group1][value=sample]`; resolves entries as sample IDs/paths. |
| Target Selection | Game radio | `previewTargetModeGame` | Top-left controls | Native `input[type=radio][name=group1][value=game]`; resolves entries as game names/paths and selects asset-browser destination schema behavior. |
| Target Selection | Tool radio | `previewTargetModeTool` | Top-left controls | Native `input[type=radio][name=group1][value=tool]`; resolves entries as tool names/paths. |
| Capture Source | Base URL input | `baseUrl` | Main configuration panel | Builds iframe URL prefix. |
| Capture Source | Wait input | `waitMs` | Main configuration panel | Sets settle delay before capture. |
| Repo And Output | Pick Repo button | `pickRepoBtn` | Output configuration panel | Opens File System Access repo picker. |
| Repo And Output | Asset folder input | `assetFolder` | Output configuration panel | Sets relative output folder. |
| Entry List | Paths or IDs textarea | `sampleList` | Full-width batch input | Defines capture targets. |
| Rewrite Options | Force rewrite checkbox | `forceRewrite` | Options row | Always rewrite target preview. |
| Rewrite Options | Capture-timeout-only checkbox | `onlyCaptureTimeout` | Options row | Rewrite only stale timeout previews. |
| Capture Mode | Full Screen radio | `captureModeFullScreen` | Capture mode row | Capture 1600x900 page view. |
| Capture Mode | Canvas Only radio | `captureModeCanvasOnly` | Capture mode row | Capture first canvas only. |
| Actions | Execute button | `executeBtn` | Primary action row | Runs batch capture. |
| Actions | Stop button | `stopBtn` | Primary action row | Requests stop after current target. |
| Status | Status text | `status` | Below actions | Shows repo/run state. |
| Status | Log text area/div | `log` | Bottom panel | Shows detailed run log. |
| Capture | Hidden iframe | `frame` | Hidden/technical region | Loads target pages for capture. |

## Input Contracts

### Interactive UI Input
The interactive mode uses browser form controls. It does not read workspace/toolState/sample JSON.

Required inputs:
- repo root selected through File System Access API;
- base URL;
- at least one target entry;
- one selected native target radio from `name="group1"`.

Optional inputs:
- wait milliseconds;
- asset folder;
- rewrite options;
- capture mode.

### Target Entry Contract
Each entry resolves to:

```json
{
  "targetType": "sample | game | tool",
  "samplePath": "relative/path/to/index.html"
}
```

Sample entries also include:

```json
{
  "id": "0107",
  "phase": "01"
}
```

Game and tool entries also include:

```json
{
  "name": "Folder Name"
}
```

### Runtime URL Input
Runtime mode is entered with:

```text
mode=runtime
```

Runtime parameters:
- `sample`: required target path loaded into the iframe.
- `w`: output canvas width, default `640`.
- `h`: output canvas height, default `360`.
- `settle`: settle delay before capture, default `3000`.
- `timeout`: capture timeout, default `12000`.
- `capture`: `canvasOnly` or `fullscreen1600`.

Runtime mode sets `document.body[data-capture-status]` to:
- `loading`
- `ready`
- `error`

### File System Input
The tool requires a directory handle for the repo root.

Expected repo folders:
- `samples/phase-XX/XXXX`
- `games/<name>`
- `tools/<name>`

Missing folders are errors for that target.

## Output Contracts

### File Output
The only primary output is:

```text
<target-folder>/<asset-folder>/preview.svg
```

Default asset folder:

```text
assets/images
```

Default output filename:

```text
preview.svg
```

### SVG Output Shapes
Canvas captures produce:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="..." height="...">
  <image href="data:image/png;base64,..." width="100%" height="100%" />
</svg>
```

Element fallback captures produce:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="..." height="...">
  <foreignObject width="100%" height="100%">...</foreignObject>
</svg>
```

Failure fallback output produces:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="80">
  <text x="10" y="24">Capture timeout: reason</text>
</svg>
```

### JSON Output
Preview Generator V2 does not own an independent JSON output contract and must not create or require `tools/schemas/tools/preview-generator-v2.schema.json`.

Preview Generator V2 must not publish:
- `tools.preview`
- `tools.palette-browser`
- workspace manifest JSON
- toolState JSON
- sample JSON

Destination JSON is selected by target radio after launch. Until the user selects a target type, there is no destination purpose and no destination JSON validation.

Game radio behavior:
- Selecting the native `input[type=radio][name=group1][value=game]` sets the destination contract to `tools/schemas/tools/asset-browser.schema.json`.
- The user must provide or select an existing asset-browser-compatible JSON payload before JSON update/export.
- Preview Generator V2 validates the existing destination JSON against `tools/schemas/tools/asset-browser.schema.json` before any mutation.
- After a game preview image is generated, the tool adds or updates exactly one asset-browser-compatible preview field/entry for that game's preview image.
- The destination JSON must validate against `tools/schemas/tools/asset-browser.schema.json` again after the update and before save.
- If either validation pass fails, the JSON update is rejected and the generated SVG file state is reported separately.

Game preview asset entry shape:

```json
{
  "assets": {
    "image.<normalized-game-id>.preview": {
      "path": "games/<GameFolder>/assets/images/preview.svg",
      "kind": "image",
      "source": "asset-browser"
    }
  }
}
```

The actual asset key must satisfy the asset-browser schema asset key pattern. `<normalized-game-id>` is the lower-kebab normalized game folder/name segment used only for the asset key. Existing unrelated asset entries must be preserved.

Sample and Tool radio behavior:
- Sample and Tool modes may generate `preview.svg` files.
- They do not have a JSON destination update contract in this design PR.
- JSON mutation for Sample or Tool is blocked until a future PR defines an explicit destination schema.

The generated SVG may contain a data URL image because it is the preview asset file content, not a persisted runtime/workspace JSON contract.

## Error States

### Repo Selection Errors
- User cancels repo picker.
- File System Access API is unavailable.
- Browser denies read/write access.

Expected UI:
- Keep Execute disabled if no repo handle exists.
- Log a clear repo selection failure.

### Input Errors
- Empty target list.
- No native `group1` target radio option selected.
- Unrecognized sample ID/path.
- Unsupported target type.
- Invalid or missing base URL.
- Missing expected target directory.
- Missing Game destination asset JSON when Game export requests JSON registration.
- Destination asset JSON does not validate against `tools/schemas/tools/asset-browser.schema.json`.

Expected UI:
- Keep batch alive where possible.
- Log failed input line and reason.
- Include failed input in summary.

### Capture Errors
- Iframe load timeout.
- Frame document unavailable.
- Canvas not found.
- Canvas has invalid size.
- Canvas is tainted and cannot be serialized.
- `html2canvas` is unavailable or fails.
- Capture timeout.

Expected UI:
- Write fallback SVG if the output folder can be opened.
- Mark target as warning or failed.
- Include reason in log and summary.

### Write Errors
- Asset folder cannot be created.
- `preview.svg` cannot be opened for write.
- Writable stream fails.
- Stop requested during current target.

Expected UI:
- Do not claim success.
- Leave Stop as request-after-current, not hard abort.
- Re-enable Execute when run finishes or fails.

## Preview Modes

### Canvas Only
Purpose: Capture game/sample canvas output directly.

Rules:
- Query first `canvas` in the target document.
- Preserve canvas aspect ratio by scaling and centering into output.
- If no canvas exists, produce `Canvas not found` fallback.

### Full Screen 1600x900
Purpose: Capture a full page view for tools or pages where the visible composition is not only a canvas.

Rules:
- Use `html2canvas` with 1600x900 viewport settings.
- Remove gradient backgrounds from cloned inline styles where needed.
- Replace canvases in cloned document with image snapshots when possible.
- Fall back to preferred element/canvas capture when full-page capture fails.

### Runtime Capture
Purpose: Support isolated capture through URL parameters.

Rules:
- Hide normal UI.
- Render a fixed output canvas.
- Load the target path into the iframe.
- Set `data-capture-status` for automation.
- Never write files directly in runtime mode.

## Export Actions

### Pick Repo Folder
Action: Requests a repo directory handle.

Output effect:
- Enables Execute.
- Updates repo label.
- Enables write-path preview.

### Execute
Action: Processes the parsed target list sequentially.

Output effect:
- May write `preview.svg` files.
- Updates log and summary.
- Does not mutate sample source files.
- In Game mode only, may update the selected asset-browser-compatible destination JSON after a successful preview image generation and strict destination schema validation.

### Stop
Action: Sets a stop-request flag.

Output effect:
- Current target finishes.
- Later targets are skipped because the run ends.
- Summary is still printed for completed targets.

### Rewrite Decision
Action: Decides whether to write or skip a target.

Output effect:
- Writes only when rules allow.
- Logs `SKIP`, `RUN`, `OUT`, `URL`, `OK`, `WARN`, or `FAIL`.

### Game Asset JSON Registration
Action: Adds or updates the generated game preview asset in the selected destination JSON.

Output effect:
- Reads the existing asset-browser-compatible JSON.
- Validates it against `tools/schemas/tools/asset-browser.schema.json`.
- Adds or replaces `assets["image.<normalized-game-id>.preview"]`, the schema-compatible preview field/entry for that game.
- Uses `kind: "image"` and `source: "asset-browser"` to remain schema-compatible.
- Validates the updated JSON against `tools/schemas/tools/asset-browser.schema.json`.
- Saves only if the updated destination JSON is valid.

## Security And Browser Constraints
- Requires a secure context for File System Access API.
- Requires same-origin or CORS-compatible rendering for canvas serialization.
- Cross-origin assets can taint canvas output.
- External `html2canvas` dependency should be reviewed during implementation; a tool-local or repo-managed dependency is preferred for deterministic builds.
- Iframe sandbox settings must be compatible with target scripts and same-origin capture.

## Target Layout Recommendation
Use a three-band utility layout:

1. Top controls: target type, base URL, wait, repo picker.
2. Main controls: entry list, output folder, options, capture mode.
3. Bottom output: action buttons, status, log, hidden technical iframe.

The log should receive the most vertical space. Configuration controls should remain visible above it during runs.

## Rebuild Acceptance Criteria
- `tools/preview/index.html` exists as the launchable entrypoint.
- Existing behavior from `preview_svg_generator.html` is represented or deliberately retired.
- Launch does not assume Sample, Game, or Tool until the user selects a native `group1` target radio option.
- Target mode selection uses only native `input[type=radio][name=group1]` controls.
- No Preview Generator V2 schema file exists or is required.
- Controls are grouped by purpose and remain visible at common desktop widths.
- Execute is blocked until repo root and target list are valid.
- Generated output path is visible before execution.
- Canvas Only and Full Screen modes are both testable.
- Stop preserves current-target integrity.
- Errors are visible and included in the final summary.
- No sample JSON or workspace/toolState JSON is touched.
- Game mode validates existing and updated destination JSON against `tools/schemas/tools/asset-browser.schema.json` before saving preview asset registration.
- No silent fallback data is used for runtime contracts.

## Playwright Expectations
No Playwright implementation is included in this PR.

Future Playwright should validate:
- Preview Generator V2 page loads.
- Target type controls are native `input[type=radio][name=group1]` controls.
- Sample, Game, and Tool radios switch modes.
- Base URL, wait, asset folder, options, and capture mode controls are visible.
- Execute remains disabled until repo selection is simulated or abstracted.
- Input parsing can be unit-tested separately from File System Access writes.
- Runtime mode sets `data-capture-status=ready` for a known canvas page.
- Runtime mode sets `data-capture-status=error` for a missing target.

## Manual Test Expectations
Manual implementation validation should include:
- Open `tools/preview/index.html`.
- Confirm no target purpose is selected before the user chooses Sample, Game, or Tool.
- Confirm target mode controls are native radio inputs with `name="group1"`.
- Pick repo root.
- Enter a known sample ID.
- Confirm output path preview points to `samples/phase-XX/XXXX/assets/images`.
- Run Canvas Only capture.
- Confirm `preview.svg` is written.
- Run Full Screen capture for a tool page.
- Confirm `preview.svg` is written or a clear fallback SVG is produced.
- Select Game, generate a known game preview, and confirm the selected destination asset JSON receives or updates one schema-valid `image.<normalized-game-id>.preview` entry.
- Confirm invalid asset-browser destination JSON is rejected before save.
- Confirm Stop ends the batch after the active target.
- Confirm no sample JSON changes appear in `git status`.

## Known Gaps To Resolve During Implementation
- Current `tools/preview/index.html` entrypoint is missing.
- Current implementation is a single large HTML file with inline script.
- Current implementation depends on `tools/shared/preview/preview-pages.css`.
- Current implementation loads `html2canvas` from CDN.
- File System Access behavior needs a clean test seam.
- Runtime mode and interactive mode are coupled in one script.
- Capture output uses SVG-wrapped PNG data; this is acceptable for preview assets but must stay out of JSON contracts.
