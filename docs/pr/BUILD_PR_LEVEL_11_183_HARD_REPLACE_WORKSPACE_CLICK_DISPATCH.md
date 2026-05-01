# BUILD_PR_LEVEL_11_183_HARD_REPLACE_WORKSPACE_CLICK_DISPATCH

## Purpose
Finish the Workspace Manager SVG launch bug by hard-replacing the click dispatch path so clicking the SVG Asset Studio tile launches `svg-asset-studio`, not `vector-map-editor`.

## Proven Good Path
Manual URL works:

`/tools/Workspace%20Manager/index.html?tool=svg-asset-studio&sampleId=1902&sampleTitle=Workspace+All+Tools+Integration&samplePresetPath=%2Fsamples%2Fphase-19%2F1902%2Fsample.1902.workspace-all-tools.json`

Confirmed UI:

```text
SVG Asset Studio
Loaded
Asset: sample-0901-ship.svg
```

This proves:
- SVG contract payload works.
- workspaceShell path works.
- asset label works.
- direct `tool=svg-asset-studio` route works.

## Remaining Bug
Workspace Manager click dispatch still launches:

```text
requestedToolId: vector-map-editor
```

even though SVG tile renders correctly with:

```text
dataToolId: svg-asset-studio
```

## Scope
One PR purpose only:
- Replace Workspace Manager tool click dispatch so it always launches from the clicked tile/button `data-tool-id`.

Do not modify schemas.
Do not modify sample 1902 JSON.
Do not modify shell files.
Do not modify SVG payload parsing.
Do not restore shared handoff.
Do not add fallback data.

## Implementation Requirements

### 1. Remove stale/default click path
In `tools/Workspace Manager/main.js`, find all click paths that launch tools from:
- `currentToolId`
- active/default tool
- first accepted tool
- `vector-map-editor`
- stale closure variable
- parent container state not derived from clicked tile

Remove or bypass those paths for rendered tool tiles/buttons.

### 2. Bind direct click handler to each rendered tile/button
When rendering tool tiles/buttons, attach a direct click handler to the exact element with `data-tool-id`.

Required behavior:
```js
tileElement.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();

  const toolId = tileElement.dataset.toolId;

  console.log("[WORKSPACE_TOOL_CLICK]", {
    clickedToolId: toolId,
    dataToolId: tileElement.dataset.toolId,
    text: tileElement.textContent
  });

  launchTool(toolId);
});
```

Use the repo's real launch function name if different from `launchTool`.

### 3. No global fallback
The handler must not fallback to:
- `vector-map-editor`
- current selected tool
- first manifest tool
- previous mounted tool

If `data-tool-id` is missing, log an actionable error and do not launch.

### 4. Preserve explicit query route
Do not break direct query launch:

```text
?tool=svg-asset-studio
```

### 5. Required logs
When clicking SVG tile/button, console must show:

```text
[WORKSPACE_TOOL_CLICK] clickedToolId: svg-asset-studio
[WORKSPACE_TOOL_LAUNCH] requestedToolId: svg-asset-studio
[SVG_LAUNCH_REQUEST]
[SVG_ENTRY_TOP]
[SVG_HOSTED_WORKSPACE_ENTRY]
[WORKSPACE_SHELL_STATE]
[SVG_POSTMESSAGE_SEND]
[SVG_POSTMESSAGE_RECEIVE]
[SVG_TILE_WRITE]
```

## Acceptance
Manual UAT:

1. Open sample 1902 Workspace Manager normally.
2. Click SVG Asset Studio tile/button.
3. Confirm click log uses `svg-asset-studio`.
4. Confirm launch log uses `svg-asset-studio`.
5. Confirm UI shows:

```text
SVG Asset Studio
Loaded
Asset: sample-0901-ship.svg
```

6. Confirm clicking Vector Map Editor still launches Vector Map Editor.
7. Confirm no `Asset: none` legacy badge row appears.

## Validation
Run:
- `node --check "tools/Workspace Manager/main.js"`
- `node --check "tools/SVG Asset Studio/main.js"`
- `node --check tools/shared/workspaceShell.js`

Full samples smoke:
- Skip.
- Reason: targeted Workspace Manager click dispatch fix; full samples smoke takes about 20 minutes and is not required.

## Report
Create:

`docs/dev/reports/pr_11_183_validation.md`

Include:
- old bad path found
- exact click handler replaced
- console proof for SVG click
- console proof for Vector Map click
- targeted validation results
- full smoke skipped reason
