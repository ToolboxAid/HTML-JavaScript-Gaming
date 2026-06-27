# PR 11.35 — Vector Tool Role Clarity and Description Update

## Purpose
Make Vector Asset Studio and Vector Map Editor roles clear to users by updating tool descriptions and visible UI text.

## Problem
Users cannot distinguish between:
- Vector Asset Studio
- Vector Map Editor

Both appear to overlap, causing confusion.

## Required Change

Update tool descriptions (manifest + UI) to explicitly state:

### Vector Asset Studio
- Create and edit reusable vector (SVG) assets
- Build shapes, icons, and asset components
- Output: standalone vector assets

### Vector Map Editor
- Place and arrange vector assets in space
- Build layouts, scenes, and maps
- Output: structured map using assets

## Additional Requirement
Descriptions must appear in:
- Workspace Manager tiles
- Tool header/title description
- Fullscreen title description

## Naming Review (non-breaking)
- Evaluate clearer names (no rename in this PR)
- Add recommendation notes in report

## Scope
- Description text only (manifest/UI binding)
- No logic changes
- No tool behavior changes
- No schema changes

## Acceptance
- Each tool clearly states its role
- No ambiguity between creation vs placement
- Descriptions visible in Workspace Manager + tool header
- No regressions
