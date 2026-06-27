# PR_11_250 — Enable Confirm Preview After Valid Merge Preview

## Summary
Updated Workspace V2 Session Merge preview/confirm/apply UI state progression so a fresh, conflict-free preview enables `Confirm Preview`, and a confirmed fresh preview enables `Apply Merge`.

## Files Changed
- `toolbox/workspace-v2/index.js`
- `tests/runtime/V2ConfirmPreviewEnableState.test.mjs`

## Implementation Details
1. Preview state enrichment
- Merge preview state now includes:
  - `conflictCount`
  - `previewFingerprint`
  - existing source/target ids, hashes, and preview result payload.

2. Immediate state recompute
- Button state recompute still runs immediately after:
  - preview completion (`computeSelectedSessionMerge`)
  - confirmation (`confirmSelectedSessionMergePreview`)

3. Confirm/Apply gating
- Confirm enabled only when:
  - preview exists
  - preview is fresh
  - `conflictCount === 0`
  - preview not yet confirmed
- Apply enabled only when:
  - preview exists
  - preview is fresh
  - preview is confirmed
  - `conflictCount === 0`

4. Conflict and stale handling
- Conflict preview keeps Confirm/Apply disabled and shows:
  - `Preview has conflicts. Resolve conflicts before applying.`
- Stale preview keeps Confirm/Apply disabled and shows:
  - `Preview is stale. Run Preview Merge again.`
- Confirm action now guards stale/conflict preview and returns actionable status.

5. Preview output containment
- Existing contained merge preview output remains in-panel (`#workspaceV2MergeOutput` bounded and scrollable), with no page-wide overlay behavior.

## Validation Commands Run
```powershell
node --check toolbox/workspace-v2/index.js
node --check tests/runtime/V2ConfirmPreviewEnableState.test.mjs
node --check tests/runtime/V2MergePreviewOverlayFix.test.mjs
node tests/runtime/V2ConfirmPreviewEnableState.test.mjs
node tests/runtime/V2MergePreviewOverlayFix.test.mjs
```

## Validation Results
- `node --check toolbox/workspace-v2/index.js` -> PASS
- `node --check tests/runtime/V2ConfirmPreviewEnableState.test.mjs` -> PASS
- `node --check tests/runtime/V2MergePreviewOverlayFix.test.mjs` -> PASS
- `node tests/runtime/V2ConfirmPreviewEnableState.test.mjs` -> PASS
  - output: `tmp/v2-confirm-preview-enable-state-results.json`
  - failures: `[]`
- `node tests/runtime/V2MergePreviewOverlayFix.test.mjs` -> PASS
  - output: `tmp/v2-merge-preview-overlay-fix-results.json`
  - failures: `[]`

## Verified
- valid selections enable Preview Merge
- conflict-free fresh preview enables Confirm Preview
- Apply stays disabled before confirm
- Confirm enables Apply when preview remains fresh/conflict-free
- conflict preview disables Confirm/Apply
- stale preview disables Confirm/Apply
- status text updates across preview -> confirm flow
- preview output remains contained and non-overlay

