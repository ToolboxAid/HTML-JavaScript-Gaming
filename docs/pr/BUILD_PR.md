# BUILD_PR_LEVEL_19_2_GAMEPLAY_OVERLAY_INTEGRATION

## PLAN

### Purpose
Integrate overlay system into gameplay layer so overlays can be used during active gameplay, not just debug/testing.

### Goals
- Enable overlays in gameplay runtime
- Maintain separation from debug overlays
- Ensure no gameplay interference

---

## BUILD

### Scope
- Hook overlay system into gameplay runtime
- Allow gameplay-safe overlays
- Ensure overlays do not block input or rendering
- No change to debug overlays

### Test Steps
1. Run gameplay sample
2. Enable overlays
3. Verify gameplay unaffected
4. Cycle overlays

### Expected
- Overlays work during gameplay
- No input or render conflicts
