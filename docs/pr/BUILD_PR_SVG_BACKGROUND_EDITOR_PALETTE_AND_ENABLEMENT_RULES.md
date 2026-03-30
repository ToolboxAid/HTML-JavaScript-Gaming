# BUILD_PR_SVG_BACKGROUND_EDITOR_PALETTE_AND_ENABLEMENT_RULES

## Goal
Tighten SVG Background Editor behavior so color selection, enablement, and drawing flow match the existing palette-driven workflow.

## Scope
- Paint + Stroke must use the existing palette select and draw flow
- Selected colors must be stored and remain locked until intentionally changed
- Most editing actions remain disabled until a valid selection exists
- Used colors must appear as quick-access swatches above the palette
- No engine core API changes

## In Scope
- palette selection rules
- paint/stroke persistence rules
- editor enablement gating
- used-color swatch strip
- SVG editor UX/state rules

## Out of Scope
- new rendering engine work
- gameplay/tool integration changes outside the SVG Background Editor
- replacing the existing palette system
