# PR_11_249 — Session Library Row Action Label Clarification

## Summary
Renamed the saved Session Library row action from `Use in Library` to `Use in Diff/Merge` while keeping Recent Sessions row action unchanged as `Use in Library`.

## Files Changed
- `toolbox/workspace-v2/index.js`
- `tests/runtime/V2SessionLibraryActionLabel.test.mjs`

## Changes Implemented
- Saved Session Library rows now render:
  - `Use in Diff/Merge`
- Recent Sessions rows continue to render:
  - `Use in Library`
- Saved-row behavior remains PR_11_248 behavior:
  - populate Session ID textbox
  - fill Session A if empty
  - else fill Session B if empty
  - do not overwrite when both selected
  - do not duplicate same session across A/B
  - immediately re-run selection/button enable-state logic
- Updated saved-row status wording for clarity:
  - `Saved session ID ready for Diff/Merge and Library actions: ...`

## Validation Commands Run
```powershell
node --check toolbox/workspace-v2/index.js
node --check tests/runtime/V2SessionLibraryActionLabel.test.mjs
node tests/runtime/V2SessionLibraryActionLabel.test.mjs
```

## Validation Results
- `node --check toolbox/workspace-v2/index.js` -> PASS
- `node --check tests/runtime/V2SessionLibraryActionLabel.test.mjs` -> PASS
- `node tests/runtime/V2SessionLibraryActionLabel.test.mjs` -> PASS
  - output: `tmp/v2-session-library-action-label-results.json`
  - failures: `[]`

## Verified Outcomes
- Session Library rows show `Use in Diff/Merge` -> PASS
- Recent Sessions rows still show `Use in Library` -> PASS
- Saved-row action fills A/B slots correctly -> PASS
- Recent-row action remains textbox-oriented behavior -> PASS
- Diff/Merge button state updates after saved-row action -> PASS

