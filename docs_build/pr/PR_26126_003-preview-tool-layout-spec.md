# PR_26126_003 - Preview Generator V2 Layout Spec

## Purpose
Convert the Preview Generator V2 design into a concrete layout specification for the future `toolbox/preview/index.html` rebuild.

This PR is documentation only. It defines target regions, control placement, DOM ids/classes, local runtime state, destination action contracts, and interaction flows. It does not implement runtime code and does not modify samples.

## Scope
- Target entrypoint: `toolbox/preview/index.html`
- Target tool id: `preview`
- Design source: `docs_build/pr/PR_26126_002-preview-tool-detailed-design.md`
- Current behavior reference: `toolbox/preview/preview_svg_generator.html`
- Official display name: `Preview Generator V2`
- No Preview Generator V2 schema file: `toolbox/schemas/tools/preview-generator-v2.schema.json` must not be created or required.
- Game destination schema: `toolbox/schemas/tools/asset-browser.schema.json`
- Target mode selection contract: native HTML radio inputs only, using `name="group1"`.

## Layout Goals
- Make Preview Generator V2 a launchable first-class tool surface.
- Keep capture configuration visible while a batch is running.
- Put visual output in the center so users can inspect the capture result before export.
- Put file/output metadata and validation detail in a right panel.
- Keep export/write actions grouped in the footer.
- Use Palette Manager V2 as the base layout and interaction pattern for header shell, panel structure, control grouping, and accordion behavior.
- Preserve the Preview Generator V2 boundary: no sample JSON, no workspace manifest mutation, no dedicated Preview Generator V2 schema, and no silent fallback data.
- Launch with no assumed target purpose; target-specific validation begins only after the user selects a native Sample, Game, or Tool radio input in `name="group1"`.

## Palette Manager Base Pattern
Preview Generator V2 must use Palette Manager V2 as its layout and interaction reference, not the older standalone preview generator page.

Required base pattern:
- Use a local tool shell with the same high-level shape as Palette Manager:
  - `body.tools-platform-tool-page[data-tool-id="preview"]`
  - top collapsible header/details shell
  - `#shared-theme-header`
  - local tool header host
  - `.preview-tool.app-shell`
  - `.preview-tool__layout.tools-platform-layout-grid`
- Use a three-column panel structure:
  - fixed/resizable left panel for controls;
  - flexible center panel for preview rendering;
  - fixed/resizable right panel for properties, validation, and logs.
- Use Palette Manager-style accordionV2 sections for grouped controls and property panels.
- Use Palette Manager-style section header/action rows where an accordion header needs buttons beside it.
- Keep write/export actions separated from configuration controls, following the Palette Manager menu/action separation pattern.
- Keep left and right panels independently scrollable when content exceeds available height.
- Keep the center column as a flex column so the main preview area and the last generated preview section can size predictably.
- Do not reuse Palette Manager class names directly; use Preview Generator V2-owned classes that mirror the pattern.
- Do not add workspace/toolState/session behavior from Palette Manager.
- Do not add a Preview Generator V2 JSON schema.
- Do not use custom controls, dropdowns, toggles, segmented buttons, div/button state, or ARIA-only radio substitutes for target mode selection.

## Header Usage Requirements
The rebuilt `toolbox/preview/index.html` must use Palette Manager-style header behavior:

- The first page element is a collapsible header/details area.
- The header area includes `#shared-theme-header`.
- The local header host describes Preview Generator V2 as a tool-local shell.
- The platform shell display name/title is exactly `Preview Generator V2`.
- The platform shell `shortDescription` is the source for the local header subtitle/description.
- Target `shortDescription`: `Generate preview.svg assets for samples, games, and tools.`
- Hide Header and Details / Show Header and Details behavior should match the Palette Manager interaction pattern.
- Header status must remain display-only.
- Header status must not mutate source, capture, output, or export state.
- The app surface starts below the header as `.preview-tool.app-shell`.

## Page Regions

### Region 1: Header
Placement: top full-width collapsible shell, matching Palette Manager header usage.

Purpose:
- Identify the tool.
- Show high-level run state.
- Provide compact validation status.

Contents:
- Tool title: `Preview Generator V2`.
- Current target type summary.
- Current validation status.
- Current repo/root status.

Primary ids/classes:
- `#previewToolPage`
- `.preview-tool`
- `.preview-tool-local-shell`
- `.preview-tool__header`
- `[data-preview-tool-header]`
- `[data-preview-tool-status]`
- `#previewToolTitle`
- `#previewToolSubtitle`
- `#previewValidationStatus`
- `#previewRepoStatus`

### Region 2: Left Panel Controls
Placement: fixed-width left column.

Purpose:
- Own input source, target resolution, capture mode, and capture settings.
- Keep all load/validate inputs in one column.

Contents:
- Input source selector.
- Target type selector using native `input[type=radio][name=group1]` controls.
- Target path/list input.
- Base URL input.
- Capture mode selector.
- Timing controls.
- Rewrite options.
- Background toggle.
- Zoom control.
- Validation summary.

Primary ids/classes:
- `.preview-tool__layout`
- `.preview-tool__panel`
- `.preview-tool__panel--left`
- `.preview-tool__control-section`
- `.preview-tool__control-row`
- `.preview-tool__field`
- `.preview-tool__segmented-control`

### Region 3: Main Preview Canvas
Placement: flexible center column.

Purpose:
- Show the currently loaded target.
- Show the generated preview surface.
- Allow zoom and background inspection without changing exported data.

Contents:
- Preview viewport toolbar.
- Preview canvas/surface.
- Optional iframe capture host.
- Empty state.
- Error state overlay.
- Zoom readout.
- Last generated preview section anchored at the bottom.

Primary ids/classes:
- `.preview-tool__panel--main`
- `.preview-tool__center-section`
- `.preview-tool__viewport-toolbar`
- `#previewViewportModeLabel`
- `#previewZoomValue`
- `#previewViewport`
- `#previewSurface`
- `#previewCaptureFrame`
- `#previewEmptyState`
- `#previewErrorOverlay`
- `#previewLastGeneratedSection`
- `#previewLastGeneratedPreview`
- `#previewLastGeneratedImage`
- `#previewLastGeneratedMeta`

### Center Column Last Generated Preview
Placement: bottom of the center column, below the main preview viewport.

Purpose:
- Show the most recent successfully rendered image.
- Provide a stable visual checkpoint before export.
- Keep the current render result visible when the main viewport changes zoom or target focus.

Sizing:
- Full width of the center panel.
- Fixed flex band at the bottom of the center column.
- Target height: `clamp(160px, 24vh, 260px)`.
- Minimum height: `140px`.
- Maximum height: `280px`.
- Internal image area uses `object-fit: contain`.
- It must not force the whole page to scroll.

Behavior:
- Replaces its image on each successful render.
- Keeps only the most recent rendered image.
- Does not keep history.
- Does not show a generated fallback image.
- Does not replace the previous successful image when validation or rendering fails.
- If no successful render has occurred, show an empty-state message only.
- Does not write files and does not mutate JSON.
- Does not store `imageDataUrl` or rendered pixels in local runtime state.
- May display derived metadata such as target id, mode, dimensions, and render time.

### Region 4: Right Panel Properties
Placement: fixed-width right column.

Purpose:
- Show target properties, output path, export metadata, validation details, and run log.
- Keep details readable without crowding the center preview surface.

Contents:
- Target properties.
- Output properties.
- Validation details.
- Export preview.
- Batch log.

Primary ids/classes:
- `.preview-tool__panel--right`
- `.preview-tool__properties`
- `#previewTargetProperties`
- `#previewOutputProperties`
- `#previewValidationDetails`
- `#previewExportPreview`
- `#previewRunLog`

### Region 5: Footer Actions
Placement: bottom full-width action bar.

Purpose:
- Hold commit-style actions that change files or run a batch.
- Keep export/write operations away from passive preview controls.

Contents:
- Pick repo.
- Load.
- Validate.
- Render preview.
- Export SVG.
- Export batch.
- Stop.
- Clear log.

Primary ids/classes:
- `.preview-tool__footer`
- `.preview-tool__actions`
- `.preview-tool__actions--primary`
- `.preview-tool__actions--secondary`

## Exact Control Placement

### Header Controls

| Control | ID | Type | Placement | State Effect |
| --- | --- | --- | --- | --- |
| Tool title | `previewToolTitle` | text | Header left | Displays `Preview Generator V2`; no state mutation. |
| Tool subtitle | `previewToolSubtitle` | text | Header left under title | Displays platform shell `shortDescription`; no state mutation. |
| Validation status | `previewValidationStatus` | status text | Header right | Mirrors `validation.status`. |
| Repo status | `previewRepoStatus` | status text | Header right | Mirrors `repo.status`. |

### Left Panel Controls

| Control | ID | Type | Placement | State Effect |
| --- | --- | --- | --- | --- |
| Input source | `previewInputSource` | radio/segmented | Left panel, first section | Sets `source.inputSource`. |
| Target type | `previewTargetModeGroup` | native radio fieldset | Left panel, first section | Owns native `input[type=radio][name=group1]`; sets `source.targetType`; no default is selected at launch. |
| Sample target radio | `previewTargetModeSample` | native radio input | Inside `previewTargetModeGroup` | Uses `type="radio" name="group1" value="sample"`; selects Sample mode. |
| Game target radio | `previewTargetModeGame` | native radio input | Inside `previewTargetModeGroup` | Uses `type="radio" name="group1" value="game"`; selects Game mode and asset-browser destination schema behavior. |
| Tool target radio | `previewTargetModeTool` | native radio input | Inside `previewTargetModeGroup` | Uses `type="radio" name="group1" value="tool"`; selects Tool mode. |
| Target entries | `previewTargetEntries` | textarea | Left panel, source section | Sets `source.entriesText`. |
| Base URL | `previewBaseUrl` | text input | Left panel, source section | Sets `source.baseUrl`. |
| Sample/runtime URL | `previewRuntimeUrl` | text input | Left panel, source section | Sets `source.runtimeUrl` when input source is URL. |
| Destination asset JSON | `previewDestinationAssetJson` | file/path picker or text input | Left panel, output section, visible for Game | Points to existing asset-browser-compatible JSON; no Preview Generator V2 schema is used. |
| Capture mode selector | `previewModeSelector` | radio/segmented | Left panel, preview section | Sets `preview.mode`. |
| Wait before capture | `previewWaitMs` | number input | Left panel, preview section | Sets `capture.waitMs`. |
| Capture timeout | `previewTimeoutMs` | number input | Left panel, preview section | Sets `capture.timeoutMs`. |
| Zoom | `previewZoomControl` | range/segmented | Left panel, preview section | Sets `view.zoom`. |
| Background toggle | `previewBackgroundToggle` | toggle | Left panel, preview section | Sets `view.background`. |
| Force rewrite | `previewForceRewrite` | checkbox/toggle | Left panel, output section | Sets `output.forceRewrite`. |
| Rewrite timeout only | `previewRewriteTimeoutOnly` | checkbox/toggle | Left panel, output section | Sets `output.rewriteTimeoutOnly`. |
| Asset folder | `previewAssetFolder` | text input | Left panel, output section | Sets `output.assetFolder`. |
| Output filename | `previewOutputFilename` | text input | Left panel, output section | Sets `output.filename`; default `preview.svg`. |

### Main Preview Controls

| Control | ID | Type | Placement | State Effect |
| --- | --- | --- | --- | --- |
| View mode label | `previewViewportModeLabel` | text | Main toolbar left | Mirrors selected preview mode. |
| Zoom readout | `previewZoomValue` | text | Main toolbar right | Mirrors `view.zoom`. |
| Preview viewport | `previewViewport` | container | Main panel body | Owns visual layout only. |
| Preview surface | `previewSurface` | canvas/container | Inside viewport | Render target for capture result. |
| Capture frame | `previewCaptureFrame` | iframe | Hidden/technical inside main panel | Loads source target for capture. |
| Empty state | `previewEmptyState` | panel | Inside viewport | Visible before load/render. |
| Error overlay | `previewErrorOverlay` | panel | Inside viewport | Visible on validation/capture errors. |
| Last generated preview section | `previewLastGeneratedSection` | section | Center panel bottom | Holds the latest successful render only. |
| Last generated preview | `previewLastGeneratedPreview` | container | Inside last generated section | Displays latest successful render image area. |
| Last generated image | `previewLastGeneratedImage` | image/canvas placeholder | Inside last generated preview | Replaced after each successful render; not persisted in JSON. |
| Last generated metadata | `previewLastGeneratedMeta` | text | Last generated section footer/header | Shows latest target/mode/dimensions/render time. |

### Right Panel Controls

| Control | ID | Type | Placement | State Effect |
| --- | --- | --- | --- | --- |
| Target properties | `previewTargetProperties` | readonly key/value list | Right panel top | Mirrors resolved target. |
| Output properties | `previewOutputProperties` | readonly key/value list | Right panel below target | Mirrors output path and export readiness. |
| Validation details | `previewValidationDetails` | list | Right panel middle | Mirrors validation messages. |
| Export preview | `previewExportPreview` | readonly text/code | Right panel middle | Shows generated SVG metadata, not full binary payload by default. |
| Run log | `previewRunLog` | log panel | Right panel bottom | Append-only run messages until cleared. |

### Footer Actions

| Action | ID | Type | Placement | State Effect |
| --- | --- | --- | --- | --- |
| Pick repo | `previewPickRepoButton` | button | Footer primary left | Sets `repo.handle`, `repo.name`, `repo.status`. |
| Load | `previewLoadButton` | button | Footer primary | Runs source resolution/load. |
| Validate | `previewValidateButton` | button | Footer primary | Runs validation only. |
| Render preview | `previewRenderButton` | button | Footer primary | Runs capture render without writing file. |
| Export SVG | `previewExportSvgButton` | button | Footer primary | Writes current preview SVG. |
| Export batch | `previewExportBatchButton` | button | Footer primary | Processes resolved target list. |
| Stop | `previewStopButton` | button | Footer secondary | Requests stop after current item. |
| Clear log | `previewClearLogButton` | button | Footer secondary | Clears displayed log only. |

## DOM Structure Outline

Ids and classes only; this is not implementation markup.

The target mode fieldset must bind to native radio inputs with these attributes:

```html
<input id="previewTargetModeSample" type="radio" name="group1" value="sample">
<input id="previewTargetModeGame" type="radio" name="group1" value="game">
<input id="previewTargetModeTool" type="radio" name="group1" value="tool">
```

These three inputs are the only allowed target mode selector. No dropdown, toggle, segmented custom control, button group, div state, or ARIA-only replacement may select Sample, Game, or Tool mode.

```html
body#previewToolPage.preview-tool-page.tools-platform-tool-page
  details.preview-tool__shell-details
    summary.preview-tool__shell-summary
    div.preview-tool__shell-content
      div#shared-theme-header
      div.preview-tool__local-header[data-preview-tool-header]

  div.preview-tool.app-shell
    header.preview-tool__header
      div.preview-tool__header-copy
        h1#previewToolTitle.preview-tool__title
        p#previewToolSubtitle.preview-tool__subtitle
      div.preview-tool__header-status
        div#previewValidationStatus.preview-tool__status.preview-tool__status--validation
        div#previewRepoStatus.preview-tool__status.preview-tool__status--repo

    div.preview-tool__layout
      aside.preview-tool__panel.preview-tool__panel--left
        section.preview-tool__control-section.preview-tool__control-section--source
          div.preview-tool__section-header
          div#previewInputSource.preview-tool__segmented-control
          fieldset#previewTargetModeGroup.preview-tool__target-radio-group
            input#previewTargetModeSample.preview-tool__radio
            input#previewTargetModeGame.preview-tool__radio
            input#previewTargetModeTool.preview-tool__radio
          label.preview-tool__field.preview-tool__field--target-entries
            textarea#previewTargetEntries.preview-tool__textarea
          label.preview-tool__field.preview-tool__field--base-url
            input#previewBaseUrl.preview-tool__input
          label.preview-tool__field.preview-tool__field--runtime-url
            input#previewRuntimeUrl.preview-tool__input

        section.preview-tool__control-section.preview-tool__control-section--preview
          div.preview-tool__section-header
          div#previewModeSelector.preview-tool__segmented-control
          label.preview-tool__field.preview-tool__field--wait
            input#previewWaitMs.preview-tool__input
          label.preview-tool__field.preview-tool__field--timeout
            input#previewTimeoutMs.preview-tool__input
          label.preview-tool__field.preview-tool__field--zoom
            input#previewZoomControl.preview-tool__range
          label.preview-tool__field.preview-tool__field--background
            input#previewBackgroundToggle.preview-tool__toggle

        section.preview-tool__control-section.preview-tool__control-section--output
          div.preview-tool__section-header
          label.preview-tool__field.preview-tool__field--destination-asset-json
            input#previewDestinationAssetJson.preview-tool__input
          label.preview-tool__field.preview-tool__field--asset-folder
            input#previewAssetFolder.preview-tool__input
          label.preview-tool__field.preview-tool__field--output-filename
            input#previewOutputFilename.preview-tool__input
          label.preview-tool__field.preview-tool__field--force-rewrite
            input#previewForceRewrite.preview-tool__toggle
          label.preview-tool__field.preview-tool__field--rewrite-timeout
            input#previewRewriteTimeoutOnly.preview-tool__toggle

      main.preview-tool__panel.preview-tool__panel--main
        section.preview-tool__center-section.preview-tool__center-section--viewport.accordion-v2
          div.preview-tool__viewport-toolbar
            div#previewViewportModeLabel.preview-tool__viewport-mode
            div#previewZoomValue.preview-tool__zoom-value
          div#previewViewport.preview-tool__viewport
            canvas#previewSurface.preview-tool__surface
            iframe#previewCaptureFrame.preview-tool__capture-frame
            div#previewEmptyState.preview-tool__empty-state
            div#previewErrorOverlay.preview-tool__error-overlay

        section#previewLastGeneratedSection.preview-tool__center-section.preview-tool__center-section--last-generated.accordion-v2
          div.preview-tool__section-header
          div#previewLastGeneratedPreview.preview-tool__last-generated-preview
            div#previewLastGeneratedImage.preview-tool__last-generated-image
          div#previewLastGeneratedMeta.preview-tool__last-generated-meta

      aside.preview-tool__panel.preview-tool__panel--right
        section.preview-tool__properties.preview-tool__properties--target
          div#previewTargetProperties.preview-tool__property-list
        section.preview-tool__properties.preview-tool__properties--output
          div#previewOutputProperties.preview-tool__property-list
        section.preview-tool__properties.preview-tool__properties--validation
          ul#previewValidationDetails.preview-tool__validation-list
        section.preview-tool__properties.preview-tool__properties--export
          pre#previewExportPreview.preview-tool__export-preview
        section.preview-tool__properties.preview-tool__properties--log
          div#previewRunLog.preview-tool__log

    footer.preview-tool__footer
      div.preview-tool__actions.preview-tool__actions--primary
        button#previewPickRepoButton.preview-tool__button
        button#previewLoadButton.preview-tool__button
        button#previewValidateButton.preview-tool__button
        button#previewRenderButton.preview-tool__button
        button#previewExportSvgButton.preview-tool__button
        button#previewExportBatchButton.preview-tool__button
      div.preview-tool__actions.preview-tool__actions--secondary
        button#previewStopButton.preview-tool__button
        button#previewClearLogButton.preview-tool__button

  div.preview-tool__local-statusbar[data-preview-tool-status]
```

## Local Runtime State Model

Preview Generator V2 owns local in-memory state for UI and run configuration. This state is not a persisted tool JSON contract, is not sample JSON, is not workspace manifest JSON, and must not require `toolbox/schemas/tools/preview-generator-v2.schema.json`.

Launch state has no selected target purpose. `source.targetType` starts as `null` and becomes `sample`, `game`, or `tool` only after the user selects one native target radio input from `name="group1"`.

Target local state shape:

```json
{
  "source": {
    "inputSource": "target-list",
    "targetType": null,
    "entriesText": "",
    "baseUrl": "http://127.0.0.1:5500",
    "runtimeUrl": ""
  },
  "capture": {
    "mode": "canvas-only",
    "waitMs": 3500,
    "timeoutMs": 12000
  },
  "view": {
    "zoom": 1,
    "background": "checkerboard"
  },
  "output": {
    "assetFolder": "assets/images",
    "filename": "preview.svg",
    "forceRewrite": false,
    "rewriteTimeoutOnly": true,
    "destinationAssetJsonPath": ""
  },
  "destination": {
    "schemaId": "",
    "assetKey": "",
    "status": "not-selected"
  },
  "repo": {
    "name": "",
    "status": "not-selected"
  },
  "validation": {
    "status": "idle",
    "messages": []
  },
  "run": {
    "status": "idle",
    "activeTargetId": "",
    "lastGenerated": {
      "targetId": "",
      "mode": "",
      "width": 0,
      "height": 0,
      "renderedAt": ""
    },
    "stopRequested": false,
    "summary": {
      "written": 0,
      "warnings": 0,
      "failed": 0,
      "skipped": 0
    }
  }
}
```

### State Ownership Rules
- `source` stores user-entered load inputs.
- `source.targetType` has no default target purpose.
- `capture` stores preview capture configuration.
- `view` stores visual inspection settings only.
- `output` stores export/write configuration.
- `destination` stores the selected destination schema and asset key metadata after target radio selection.
- `repo` stores display-safe repo state only; browser directory handles are runtime-only and must not be serialized.
- `validation` stores current validation display state.
- `run` stores current run display state.
- Generated SVG content is not stored in local state; it is an export artifact.
- Last generated preview pixels are not stored in local state.
- `run.lastGenerated` may store metadata only; it must not store `imageDataUrl`, Blob URLs, SVG text, PNG data, or canvas pixels.
- Iframe document state is runtime-only and must not be serialized.

### Valid State Requirements
- `source.inputSource` must be one of `target-list`, `runtime-url`.
- `source.targetType` must be `null` before selection or one of `sample`, `game`, `tool` after selection.
- Render, validate, and export actions are blocked while `source.targetType` is `null`.
- `source.targetType` must be derived only from the checked `input[type=radio][name=group1]`.
- Custom UI state, dropdown values, toggle state, URL defaults, and fallback defaults must not set target mode.
- `capture.mode` must be one of `canvas-only`, `fullscreen-1600`.
- `capture.waitMs` must be at least `3000`.
- `capture.timeoutMs` must be at least `1000`.
- `view.zoom` must be a positive number.
- `view.background` must be one of `checkerboard`, `solid`, `transparent`.
- `output.filename` must be `preview.svg` for the initial rebuild.
- If `source.targetType` is `game`, `destination.schemaId` must be `toolbox/schemas/tools/asset-browser.schema.json` before JSON update/export.
- If `source.targetType` is `sample` or `tool`, `destination.schemaId` remains empty unless a future PR defines a destination schema.
- `validation.messages` must be an array of strings.
- `run.lastGenerated.targetId`, `mode`, and `renderedAt` must be strings.
- `run.lastGenerated.width` and `height` must be finite non-negative numbers.

### Invalid State Behavior
- Reject invalid local runtime state before rendering.
- Show validation errors in `#previewValidationDetails`.
- Set `#previewValidationStatus` to invalid/error state.
- Do not partially render invalid input into the preview surface.
- Do not update `#previewLastGeneratedImage` from invalid input.
- Do not silently substitute default target entries, sample paths, or output folders.
- Do not silently substitute fallback images, placeholder captures, or generated fallback SVGs into the last generated preview.

## Destination JSON Validation Rules
- Preview Generator V2 has no dedicated JSON schema and must not require `toolbox/schemas/tools/preview-generator-v2.schema.json`.
- Preview Generator V2 launches without knowing the destination purpose until the user selects a native target radio option in `name="group1"`.
- The checked `group1` radio option is the only source of target mode and destination contract selection.
- Game selects `toolbox/schemas/tools/asset-browser.schema.json` as the destination schema.
- Sample and Tool have no destination JSON update contract in this design PR.
- No selected `group1` radio means no destination schema, no render/export, and no fallback mode.
- Destination JSON must be validated before mutation and again after mutation.
- Invalid destination JSON is rejected before save.
- Unknown destination schemas are rejected.
- Serialized browser handles, Blob URLs, image data URLs, rendered SVG text, canvas pixels, or iframe document content must not be written into destination JSON.
- Preview Generator V2 must not read sample JSON, game JSON, workspace manifest JSON, Palette Manager JSON, or any Preview Generator V2 schema as Preview configuration.
- Preview Generator V2 must not persist generated image data in JSON.

### Game Destination Contract
When `source.targetType` is `game`, Preview Generator V2 updates only an existing `toolbox/schemas/tools/asset-browser.schema.json`-compatible JSON payload.

Update shape:

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

Rules:
- Preserve all existing unrelated `assets` entries.
- Add the game preview field/entry when it is missing.
- Replace only the game preview field/entry when it already exists.
- The asset key must match the asset-browser schema image key pattern.
- The asset entry must use `kind: "image"`.
- The asset entry must use `source: "asset-browser"` because that is schema-valid.
- The output path must point to the generated preview image for the selected game.
- The updated JSON must validate against `toolbox/schemas/tools/asset-browser.schema.json` before save.

## Interaction Flow: Load To Validate To Render To Export

### Flow 1: Load
Trigger:
- User clicks `#previewLoadButton`.

Steps:
1. Read local `source` state.
2. If `inputSource` is `target-list`, parse `#previewTargetEntries`.
3. If `inputSource` is `runtime-url`, parse `#previewRuntimeUrl`.
4. Resolve entries to normalized target records.
5. Update `#previewTargetProperties`.
6. Set `run.status` to `loaded`.

Failure states:
- No native `group1` target radio option selected.
- Empty target entries.
- Unsupported target type.
- Invalid sample ID/path.
- Invalid URL.

### Flow 2: Validate
Trigger:
- User clicks `#previewValidateButton`.
- Validation also runs automatically before Render or Export.

Steps:
1. Validate local runtime state.
2. Validate source target records.
3. Validate repo selection if export/write action is requested.
4. Validate output folder and filename.
5. Validate capture mode.
6. If Game is selected and JSON registration is requested, validate the destination JSON against `toolbox/schemas/tools/asset-browser.schema.json`.
7. Write messages to `#previewValidationDetails`.
8. Mirror validation result in `#previewValidationStatus`.

Failure states:
- Missing repo for export.
- Invalid output path.
- Missing target.
- No native `group1` target radio option selected.
- Game selected but no existing asset-browser-compatible destination JSON selected.
- Destination JSON fails `toolbox/schemas/tools/asset-browser.schema.json` validation.
- Capture mode unavailable.
- Browser lacks File System Access API.

### Flow 3: Render
Trigger:
- User clicks `#previewRenderButton`.
- Export actions may run render first if no current preview surface exists.

Steps:
1. Run Validate.
2. Load target into `#previewCaptureFrame`.
3. Wait for frame load and settle delay.
4. Capture based on `capture.mode`.
5. Draw result into `#previewSurface`.
6. Replace `#previewLastGeneratedImage` with the latest successful render.
7. Update `#previewLastGeneratedMeta` with target id, mode, dimensions, and render time.
8. Update `run.lastGenerated` metadata only.
9. Update `#previewExportPreview` with output metadata.
10. Update `run.status` to `rendered`.

Canvas-only behavior:
- Capture first canvas from target document.
- If missing, create an explicit error state.

Fullscreen behavior:
- Capture the target document at 1600x900.
- If full capture fails, render an explicit failure overlay rather than silently pretending success.
- Failed validation or rendering must not replace the last generated preview.
- No fallback image is inserted into the last generated preview.

### Flow 4: Export SVG
Trigger:
- User clicks `#previewExportSvgButton`.

Steps:
1. Run Validate with export rules.
2. Ensure one current target and one rendered preview exist.
3. Build `preview.svg`.
4. Write to `<target-folder>/<assetFolder>/<filename>`.
5. If the selected target type is Game, validate and update the selected asset-browser-compatible destination JSON with the game preview image field/entry.
6. Validate the updated destination JSON against `toolbox/schemas/tools/asset-browser.schema.json`.
7. Save the destination JSON only after it validates.
8. Update `#previewOutputProperties`.
9. Append result to `#previewRunLog`.

Failure states:
- No repo handle.
- No rendered preview.
- Write denied.
- Target output folder missing and cannot be created.
- Game selected but no destination asset JSON is selected.
- Destination asset JSON fails validation before or after update.

### Flow 5: Export Batch
Trigger:
- User clicks `#previewExportBatchButton`.

Steps:
1. Run Validate with batch export rules.
2. Disable primary action buttons except Stop.
3. Process resolved targets sequentially.
4. For each target:
   - apply rewrite decision;
   - load;
   - render;
   - export or skip;
   - when target type is Game, validate and update the asset-browser-compatible destination JSON for the generated preview image;
   - append log entry.
5. Honor Stop only between targets.
6. Update run summary.
7. Re-enable actions.

Failure states:
- Per-target failures are logged without stopping the full batch unless the repo/file system becomes unavailable.
- Stop requested marks remaining targets as not run, not failed.

## Preview Modes

### Canvas Only
State value: `canvas-only`

UI:
- `#previewModeSelector` active option: Canvas Only.
- `#previewViewportModeLabel`: Canvas Only.

Rendering:
- Capture the first canvas in the loaded target.
- Preserve aspect ratio inside `#previewSurface`.
- Background toggle affects inspection background only.
- Zoom affects viewport scale only.

### Fullscreen 1600
State value: `fullscreen-1600`

UI:
- `#previewModeSelector` active option: Fullscreen 1600.
- `#previewViewportModeLabel`: Fullscreen 1600.

Rendering:
- Render target document as a 1600x900 page capture.
- Center and scale into `#previewSurface`.
- Use explicit validation/error messaging when full-page capture is unavailable.

## Background Toggle

Control:
- `#previewBackgroundToggle`

State:
- `view.background`

Allowed values:
- `checkerboard`
- `solid`
- `transparent`

Behavior:
- Changes only the preview viewport inspection background.
- Does not mutate SVG output unless a future export setting explicitly says background should be baked into output.

## Zoom Control

Control:
- `#previewZoomControl`

State:
- `view.zoom`

Target options:
- `0.25`
- `0.5`
- `1`
- `2`
- `fit`

Behavior:
- Changes viewport scale.
- Does not change capture dimensions.
- Does not change SVG output dimensions.

## Export Buttons

### `#previewExportSvgButton`
Exports the currently rendered target only.

Rules:
- Requires a rendered preview.
- Requires repo handle.
- Requires valid output path.
- Writes exactly one `preview.svg`.

### `#previewExportBatchButton`
Exports all resolved targets.

Rules:
- Requires repo handle.
- Requires validated target list.
- Applies rewrite rules per target.
- Shows final summary in `#previewRunLog`.

## Validation Status Placement

Header:
- `#previewValidationStatus` displays compact status:
  - `Idle`
  - `Valid`
  - `Invalid`
  - `Rendering`
  - `Exporting`
  - `Done`

Right panel:
- `#previewValidationDetails` displays exact validation/error messages.

Main preview:
- `#previewErrorOverlay` displays blocking render/export errors that prevent preview output.

## Output Property Placement

Right panel `#previewOutputProperties` must show:
- resolved target folder;
- asset folder;
- output filename;
- full relative output path;
- rewrite decision;
- export readiness;
- last exported timestamp for display only.

## Non-Goals
- No runtime implementation.
- No CSS implementation.
- No JavaScript implementation.
- No schema file changes.
- No `toolbox/schemas/tools/preview-generator-v2.schema.json`.
- No sample JSON changes.
- No generic game JSON changes outside the selected asset-browser-compatible destination JSON.
- No workspace/toolState persistence implementation.
- No dependency changes.

## Acceptance Checklist For Future Implementation
- `toolbox/preview/index.html` contains the five exact regions.
- The page shell, header behavior, three-column grid, accordionV2 grouping, and action separation follow the Palette Manager V2 base pattern.
- All controls use the ids named in this spec.
- The page launches with no assumed target radio selection.
- Target mode selection uses only native `input[type=radio][name=group1]` controls.
- Sample, Game, and Tool target modes are not exposed through dropdowns, toggles, segmented custom controls, button groups, div state, or ARIA-only replacements.
- Footer write/export actions are separated from left-panel configuration controls.
- Main preview surface remains centered and inspectable.
- Center column includes `#previewLastGeneratedSection` at the bottom.
- Last generated preview replaces only on successful render, keeps no history, and shows no fallback image.
- Right panel shows validation and output properties.
- No Preview Generator V2 schema exists or is required.
- Local runtime state validates before render.
- Local runtime state never stores generated image data, SVG text, Blob URLs, or `imageDataUrl`.
- Invalid local runtime state is rejected before partial render.
- Game mode updates only `toolbox/schemas/tools/asset-browser.schema.json`-compatible destination JSON.
- Game mode validates destination JSON before and after adding/updating the preview image asset entry.
- Load -> Validate -> Render -> Export flow is explicit.
- Export writes `preview.svg` only after validation.
- Samples remain unmodified except for intentional generated `preview.svg` assets during manual use.
