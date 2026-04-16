# BUILD_PR_LEVEL_18_3_OVERLAY_STATE_PERSISTENCE

## PLAN

### Purpose
Introduce overlay state persistence so selected overlay and cycle position are maintained across sample reloads and navigation.

### Goals
- Persist current overlay index
- Restore state on reload
- Maintain consistency across samples

---

## BUILD

### Scope
- Store overlay state (in-memory or lightweight persistence)
- Restore on sample load
- No UI changes
- No behavior change to cycle logic

### Test Steps
1. Select overlay
2. Reload sample
3. Confirm overlay restored
4. Switch samples and return

### Expected
- Overlay state preserved
- No regression in cycling
