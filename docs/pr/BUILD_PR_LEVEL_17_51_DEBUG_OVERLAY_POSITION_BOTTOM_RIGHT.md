# BUILD

## Instructions for Codex

### Positioning
- Anchor debug overlay container to:
  bottom: 10px
  right: 10px

### Layout
- Stack panels vertically upward
- Add spacing between panels

### Styling
- Slight transparency (optional if already exists)
- Ensure z-index remains above game but non-intrusive

### Scope
- All debug panels (shared system)
- Applies to samples 1701+

### Constraints
- Do not change panel content
- Do not break cycling logic
- Use shared styling (no per-sample hacks)

### Validation
- Panels render bottom-right
- No overlap with core HUD text
- Works across all samples
