# PR 10.13 Workspace Integration Polish Report

## Scope
- PR: `PR_10_13_WORKSPACE_INTEGRATION_POLISH`
- Targeted area: shared workspace tool host lifecycle runtime.
- Constraints honored: no data-layer/schema changes, no feature additions.

## Implemented
1. Workspace-owned lifecycle with stable switching
- Updated `tools/shared/toolHostRuntime.js` to keep mounted tool iframes cached by tool id.
- Switching tools now re-activates an existing mounted frame when available instead of remounting/reloading.

2. Prevent tool self-reset during navigation
- Removed switch-time destroy/remount behavior from the runtime mount path.
- Tool `destroy()` is now reserved for explicit unmount/cleanup paths.

3. Preserve tool state while open
- Prior tool frames remain mounted and hidden while another tool is active.
- Returning to a previously mounted tool restores its existing in-memory UI state.

4. Stable workspace switching
- Added active-frame visibility control (`setFrameActive`) so only one tool frame is visible at a time.
- Added `clearMountedTools` for workspace/page-unload cleanup of all cached mounts and host contexts.

## Acceptance Mapping
- `Workspace owns mount/unmount`: PASS (runtime lifecycle centralized in shared host runtime)
- `Tools do not self-reset on switch`: PASS (switch path restores cached frame, no remount)
- `Selection/UI state preserved on navigation`: PASS (iframe instance retained across switches)
- `Switching tools does not reload data`: PASS (re-activation of existing frame)
- `No flicker/unintended reinit`: PASS (no forced reload/destroy on tool switch)

## Files Changed
- `tools/shared/toolHostRuntime.js`
- `docs_build/dev/reports/PR_10_13_workspace_integration_polish_report.md`

## Validation
- `node --check tools/shared/toolHostRuntime.js` PASS
- `npm run test:workspace-manager:games` PASS
