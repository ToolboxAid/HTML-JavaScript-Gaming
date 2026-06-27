# BUILD_PR_SHARED_EXTRACTION_38_CODE_TO_LETTER_HIGHSCORE_BATCH

## Purpose
Centralize duplicated `codeToLetter(code)` implementations across the exact initials-entry batch identified in the duplicate report.

## Single PR Purpose
Normalize ONLY this helper:

- `codeToLetter(code)`

## Exact Files Allowed

### New shared file
1. `src/shared/utils/initialsEntryUtils.js`

### Consumer files
2. `games/Asteroids/systems/AsteroidsInitialsEntry.js`
3. `games/SpaceDuel/game/SpaceDuelInitialsEntry.js`
4. `games/SpaceInvaders/game/SpaceInvadersInitialsEntry.js`

Do not edit any other file.

## Source of Truth
This exact scope comes from the provided duplicate report entry for:

`function codeToLetter(code)`

Only the 3 listed consumer files are in scope. fileciteturn8file0

## Exact Shared Helper Creation
Create:

`src/shared/utils/initialsEntryUtils.js`

Export exactly:

```js
export function codeToLetter(code) {
  // copy one existing implementation exactly
}
```

Implementation rules:
- use ONE existing local implementation as source-of-truth
- do NOT merge logic
- do NOT generalize behavior
- preserve the function signature exactly:
  - `codeToLetter(code)`

## Exact Consumer Changes
For each of the 3 listed consumer files:

If the file contains a local function definition matching:
```js
function codeToLetter(code)
```
then:
- remove the local `codeToLetter(code)` function definition
- import `codeToLetter` from the correct relative path to:
  - `src/shared/utils/initialsEntryUtils.js`
- if the file already imports from that module, add `codeToLetter` with the minimum safe edit
- do not duplicate imports
- do not touch unrelated helpers
- do not change logic

If a listed file already imports and uses shared `codeToLetter`, leave it unchanged.

## Relative Import Rule
Use the correct relative path from each consumer file to:

`src/shared/utils/initialsEntryUtils.js`

Do not use aliases.
Do not change `.js` extension usage.

## Hard Constraints
- no engine changes
- no game files outside the 3 listed consumers
- no sample files
- no repo-wide initials helper cleanup
- no behavior changes
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 4 listed files changed
2. Confirm `src/shared/utils/initialsEntryUtils.js` exists and exports `codeToLetter`
3. Confirm local `function codeToLetter(code)` definitions no longer exist in changed listed consumer files
4. Confirm changed consumer files import `codeToLetter` from the correct relative path to `src/shared/utils/initialsEntryUtils.js`
5. Confirm no unrelated engine, game, or sample files changed
6. Confirm no behavior changes were made

## Non-Goals
- no cleanup of high score service helpers in this PR
- no cleanup outside the 3 listed consumer files
- no refactor beyond this exact duplicate-removal batch
