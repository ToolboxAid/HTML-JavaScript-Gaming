
# BUILD_PR — LEVEL 09_14 — RUNTIME ASSET VALIDATION

## Objective
Introduce a runtime-safe validation layer that verifies resolved assets (post-lookup) meet expected contracts and are safe for consumption.

## Scope
- validate manifest-resolved assets before runtime use
- ensure no `/data/` assets leak into runtime
- validate required fields per domain (sprites, tilemaps, parallax, vectors)
- integrate with existing lookup layer

## Out of Scope
- no engine redesign
- no tool UI work
- no asset format expansion

## Roadmap Instruction
Update roadmap status only. No text edits.

## Deliverables
Standard docs/dev bundle.
