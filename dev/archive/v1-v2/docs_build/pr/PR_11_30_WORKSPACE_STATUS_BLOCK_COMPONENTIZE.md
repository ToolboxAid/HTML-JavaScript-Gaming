# PR 11.30 — Componentize Workspace Status Block

## Purpose
Move the Workspace Manager status/header fields into one shared render block so the UI can be rearranged safely in one place.

## Current Visible Block
Workspace
sample-0901-vector-map
shared workspace state synced
PREV
Parallax Scene Studio
NEXT
Workspace: Loaded
Shared Palette: Sample 1902 Workspace Palette
Shared Assets: No shared asset selected

## Problem
The status/header values are rendered as scattered UI pieces, making layout rearrangement risky.

Also, "Shared Assets: No shared asset selected" never changes for sample 1902 because the workspace has a shared palette and tool-specific embedded payloads, but no actual shared selected asset.

## Required Change
Create or consolidate a single Workspace Manager status/header render path/component that owns:
- Workspace title/context
- active tool/sample label
- sync status
- PREV/NEXT navigation
- Workspace loaded status
- Shared Palette status
- Shared Assets status

## Shared Assets Rule
Only display "Shared Assets" when there is meaningful shared asset data or selection state.

For sample 1902:
- If no shared asset selection exists, hide the line or show a neutral non-error state only if needed.
- Do not imply a broken/missing asset when no shared asset is required.

## Scope
- UI rendering/reorganization only.
- Do not change workspace payload schema.
- Do not change tool launch logic.
- Do not change palette handoff.
- Do not change fullscreen behavior.
- Do not add hidden defaults or fallback assets.
- Do not touch start_of_day folders.

## Acceptance
- The listed Workspace status/header content is rendered from one shared block/path.
- Future rearrangement can be done in one place.
- Shared Palette still shows when present.
- Shared Assets is hidden or neutral when no shared asset concept exists.
- No regression to Workspace Manager tool list or tool launch.
- Smoke test passes.
