# PR 11.32 — Workspace Tile Grid Responsive Wrap

## Purpose
Fix Workspace Manager tool tiles overflowing horizontally when the browser/container width shrinks.

## Problem
The tool category tiles run past the right edge of the Workspace Manager panel instead of wrapping within the available container width.

## Required Change
Update the Workspace Manager tile grid layout so tiles wrap responsively down to one column.

## Scope
- Layout/CSS/rendering only for Workspace Manager tile grids.
- Do not change tool data, payload logic, palette handoff, fullscreen behavior, or navigation behavior.
- Do not touch start_of_day folders.

## Acceptance
- Tool tiles stay inside the Workspace Manager container at narrow widths.
- Grid wraps from multiple columns down to one column.
- No horizontal overflow from tile cards.
- Existing tool labels/status pills remain readable.
- Runtime smoke test passes.
