# BUILD_PR_LEVEL_18_1_OVERLAY_RUNTIME_HARDENING

## PLAN

### Purpose
Harden overlay runtime behavior after Level 17 baseline promotion to ensure stability under rapid input, resizing, and multi-sample switching.

### Goals
- Ensure cycle key stability under rapid input
- Prevent overlay flicker during sample switching
- Lock bottom-right anchoring under resize
- Validate overlay layering does not reorder unexpectedly

---

## BUILD

### Scope
- Overlay runtime stabilization (no feature expansion)
- Input debounce/throttle validation
- Resize handling validation
- Sample switching consistency

### Test Steps
1. Rapidly cycle overlays
2. Switch between samples quickly
3. Resize viewport
4. Validate overlays remain stable and anchored

### Expected
- No flicker
- No misalignment
- No cycle skips
