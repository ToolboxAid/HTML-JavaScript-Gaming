# BUILD_PR_LEVEL_18_6_OVERLAY_DIAGNOSTICS_DEBUG_TOOLING

## PLAN

### Purpose
Introduce lightweight diagnostics and debug tooling for overlay system to aid validation and future debugging.

### Goals
- Provide visibility into overlay state
- Expose current stack + index
- Enable debug logging toggle

---

## BUILD

### Scope
- Add diagnostic hooks (non-invasive)
- Add debug output for:
  - Current overlay index
  - Active stack
  - Cycle key events
- Optional debug toggle (no UI change required)
- No behavior change

### Test Steps
1. Enable diagnostics
2. Cycle overlays
3. Verify logs show correct state transitions
4. Disable diagnostics

### Expected
- Clear debug visibility
- No runtime impact when disabled
