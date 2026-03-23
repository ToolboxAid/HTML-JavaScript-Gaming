Toolbox Aid
David Quesenberry
03/23/2026
README.md

# BUILD_PR — Engine Boundary Cleanup Step 2C (CanvasSurface Ownership)

## Purpose
Resolve ownership and placement of CanvasSurface identified in Step 2 audit.

## Goal
Determine whether CanvasSurface is:
- dead code (remove), OR
- a browser adapter (relocate/split)

## Scope
- engine/core/CanvasSurface.js
- potential callers (engine/, samples/, games/)
- minimal adapter extraction if required
- tests/engine for verification

## Constraints
- No gameplay changes
- No rendering behavior changes
- No refactor beyond CanvasSurface scope
- Do NOT introduce new rendering abstractions

## Expected Outcome
- CanvasSurface is either:
  - safely removed, OR
  - relocated/split into proper adapter layer
