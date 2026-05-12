# Object Vector Studio V2 Requirements

This document defines the Object Vector Studio V2 requirements for a future implementation pass. It is design documentation only; `PR_26132_002-object-vector-studio-v2-requirements` does not implement runtime behavior.

## Purpose

Object Vector Studio V2 will author object-level vector entities such as ships, enemies, pickups, actors, hazards, projectiles, and reusable gameplay entities. It complements World Vector Studio V2, which owns terrain, world geometry, layered scenes, level/environment layout, and parallax/background structures.

## Data Loading Contract

- Session loading must be schema-only.
- Every incoming toolState payload must validate against the Object Vector Studio V2 schema before render.
- Invalid payloads must be rejected before render with visible, actionable status text.
- Runtime UI state must not be accepted as persisted payload data unless the schema explicitly owns it.
- No hidden defaults, silent fallback data, or partial rendering is allowed.

## Launched-With-Parameters File Read

- A launch with URL or workspace parameters may identify a source file to read.
- The tool must resolve and log the exact source path before reading.
- Missing or unreadable launched-with-parameters files must produce a visible actionable failure.
- Successfully loaded files must report source path, payload type, validation result, and item counts.
- Parameter-based file reads must still pass through schema validation before render.

## Required Palette

- Object Vector Studio V2 requires an active palette before object editing.
- The palette source must be explicit and logged.
- If no palette is available, the tool must show an actionable blocked state rather than creating default colors.
- Object fills, strokes, and swatches must reference the active palette where applicable.
- Palette changes must preserve selected object visibility and update palette-dependent controls without silently altering persisted object data.

## Header And Responsive Layout

- The tool must keep the copied First-Class Tool V2 header pattern.
- Hide Header and Details must switch the page into the established fullscreen-style workspace mode.
- In fullscreen-style mode, the left and right columns stay at the sides and the center work area fills the remaining horizontal space.
- The center object preview/editor must not collapse when the header/details area is hidden.
- The layout must remain usable at narrow widths by stacking or constraining columns without overlapping controls.

## Accordion Space Sharing

- Left and right column accordions must share available vertical space.
- When one accordion is collapsed, remaining open accordions must redistribute the available space.
- Collapsed accordions must collapse both content and container height in normal and fullscreen-style modes.
- Accordion toggles must affect only their intended panel.
- Header action buttons must not accidentally toggle the accordion.

## Scrollable Control Content

- Oversized control groups must scroll inside their own accordion content area.
- Page-level scroll may exist only when the total content exceeds the viewport.
- Object tiles, shape/tool controls, palette controls, JSON details, and status log panels must not push required panels offscreen.
- Status log content must fill its available panel height and scroll internally when needed.

## Selected Item Visibility

- The selected object must remain visible in the object tile list and the center preview/editor when selection changes.
- The active selection should be clearly marked in the tile list.
- Object details and JSON details must reflect the same selected object.
- If the selected object is deleted, selection must move to another existing object or clear to a valid empty selection state.
- Empty-state messaging must be visible and actionable.

## Left Column

The left column owns user intent and setup controls.

Required sections:

- Object list and object management controls.
- Shape and tool controls for creating/editing object primitives.
- Mode controls for selection, move, scale, rotate, path/edit-point work, and grouping when implemented.
- Add, duplicate, delete, reorder, and rename controls when supported by schema.

Object controls must mark dirty only when they change schema-owned payload data.

## Object Tiles

- Object tiles must show object name, type/category, and selected state.
- Tiles must support keyboard and pointer selection.
- Tiles must remain stable in height so label changes do not cause layout jumps.
- Tiles must expose enough metadata to distinguish ships, enemies, pickups, actors, and reusable gameplay entities.
- Tiles should avoid rendering raw JSON as the primary visual label.

## Right Column

The right column owns output, diagnostics, and inspection.

Required sections:

- Palette: active palette source, swatches, and selected color context.
- Object Details: selected object fields and shape-specific editable properties.
- JSON Details: schema-valid payload or selected-object JSON preview.
- Status Log: OK, WARN, FAIL, SKIP, and INFO messages with exact source/action context.

Right-column content must remain scrollable and must not hide the status log.

## Workspace Nav

- Workspace launch must use the established workspace nav pattern.
- Return to Workspace must preserve the active workspace/toolState context.
- Return navigation must not mark dirty.
- Workspace launch must log source binding, host context id, schema validation result, and payload counts.
- Save-capable behavior belongs to the Workspace Manager V2 lifecycle and must not be silently assumed inside this tool.

## Tool Nav

- Standalone launch must use the established tool nav pattern.
- Tool nav actions should include import/copy/export JSON only after the schema contract exists.
- Import must validate before render.
- Copy and export must emit only schema-owned payload data, not runtime-only UI state.
- Failed import/export actions must produce visible actionable status text.

## Out Of Scope For This PR

- Runtime editor implementation.
- Object Vector Studio V2 schema creation.
- Workspace Manager V2 payload write-back changes.
- Palette Manager V2 integration code.
- Playwright runtime behavior coverage.
- Sample JSON alignment.
