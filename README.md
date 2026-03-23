Toolbox Aid
David Quesenberry
03/23/2026
README.md

# PLAN_PR — Relocate Shared Layout CSS to engine/ui

## Purpose
Create a small, low-risk plan to move the shared sample/game page layout CSS into a clearer engine-owned location.

## Goal
- relocate `/samples/_shared/sampleLayout.css`
- update all references from samples and games
- keep layout ownership clear and enforceable
- avoid mixing runtime engine code with sample/game duplication

## Naming Recommendation
Preferred file name: `sampleLayout.css`

Reason:
- it describes exactly what the file is used for today
- it avoids over-generalizing a dev/demo page scaffold into a universal “base” layout
- `baseLayout.css` sounds broader and more foundational than the current use justifies

## Expected Outcome
A small BUILD_PR that moves the CSS to `engine/ui/sampleLayout.css`, updates references, and preserves behavior.
