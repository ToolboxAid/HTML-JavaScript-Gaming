# PR 11.33 — Fix Workspace Grid Actual Overflow Source

## Purpose
Fix Workspace Manager tile overflow after PR 11.32 had no visible effect.

## Observed Problem
The tile grid still runs off the right edge of the purple Workspace Manager container when browser width shrinks.

## Important Finding
The CSS already contains responsive grid rules for:
- `.tools-platform-frame__nav`
- `.tools-platform-frame__nav-grid`

So the overflow is likely not caused by the grid declaration alone. It is likely caused by one or more of:
- parent/header width constraints
- grid item min-content sizing
- card/badge nowrap forcing min width
- a generated wrapper not using `.tools-platform-frame__nav-grid`
- fixed-width content inside nav buckets
- external container clipping/overflow rules

## Required Change
Fix the actual overflow source so the Workspace Manager tile cards remain inside the container and collapse down to one column.

## Scope
- CSS/layout only.
- Workspace Manager tile/status layout only.
- Do not change tool data, payload logic, palette handoff, fullscreen behavior, or navigation behavior.
- Do not touch start_of_day folders.

## Acceptance
- At narrow browser widths, tiles do not run off the purple container.
- Cards wrap down to one column.
- Tile text/badges do not force horizontal overflow.
- Parent Workspace Manager panel does not force a wider-than-screen layout.
- Runtime smoke test passes.
