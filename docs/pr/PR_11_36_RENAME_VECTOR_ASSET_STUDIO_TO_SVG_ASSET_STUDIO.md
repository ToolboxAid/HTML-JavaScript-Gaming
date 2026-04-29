# PR 11.36 — Rename Vector Asset Studio to SVG Asset Studio (Non-Breaking)

## Purpose
Rename the tool to better reflect its purpose and data format.

## Change
Vector Asset Studio → SVG Asset Studio

## Requirements
- Update display name in:
  - Workspace Manager tiles
  - Tool header
  - Fullscreen title
- Keep internal tool id unchanged (non-breaking)
- Do NOT rename folders/files unless required
- Do NOT break existing references

## Scope
- UI + manifest display name only

## Acceptance
- Tool shows as "SVG Asset Studio"
- No regressions
