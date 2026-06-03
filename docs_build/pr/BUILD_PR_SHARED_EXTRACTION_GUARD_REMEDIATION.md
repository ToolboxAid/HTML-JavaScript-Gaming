# BUILD_PR — Shared Extraction Guard Remediation

## PR title
Fix unexpected shared extraction guard violations in samples/tools without changing behavior

## Problem statement
`npm test` is currently blocked in `pretest` by `checkSharedExtractionGuard.mjs`. The guard reports 93 unexpected violations across deep relative shared traversal, direct shared relative import, inline helper clone, and local helper definition. fileciteturn0file0

Meanwhile, the node test suite itself is already passing when the guard is bypassed, which means the primary remaining blocker is structural/governance cleanup rather than runtime instability. fileciteturn2file0

## Build intent
Make the smallest structural code changes necessary to:
- remove the 93 unexpected violations
- keep current behavior intact
- restore full `npm test`

## Required implementation rules
- Do not relax, bypass, or re-baseline the guard.
- Do not make unrelated refactors.
- Do not change engine core APIs unless strictly required for import normalization.
- Prefer extending existing public/shared modules over creating many new ones.
- Preserve runtime semantics; this is a structural cleanup PR.

## Transformation rules

### Rule 1 — eliminate deep relative shared traversal
Replace every forbidden deep traversal to shared internals with imports from approved public entry points.

Examples of what must disappear:
- `../../../../src/shared/...`
- similar deep upward traversal into shared internals

Preferred end state:
- samples/tools import from a stable shared utility surface
- no forbidden path-depth patterns remain

### Rule 2 — eliminate direct shared relative imports
Remove direct relative import patterns into shared code from sample/tool entry points.

This includes affected files such as:
- phase 12 / phase 13 sample entry points and scenes
- tool `main.js` entry files
- `tools/shared/vector/vectorSafeValueUtils.js` itself if it currently reaches shared code through a forbidden path pattern. fileciteturn0file0

### Rule 3 — consolidate numeric helper clones
For all duplicated finite-number helper patterns, route callers through a single canonical helper implementation.

Suggested public API shape:
- `isFiniteNumber(value)`
- `toFiniteNumber(value, fallback)`
- `asPositiveInteger(value, fallback)`

Codex should first search the repo for an existing approved numeric helper before introducing a new one.

### Rule 4 — remove local helper definition drift
Move `asPositiveInteger` out of `samples/phase13/1316/server/networkSampleADashboardServer.mjs` into the canonical shared utility surface and import it back in. fileciteturn0file0

### Rule 5 — cluster phase 13 network cleanup
Handle 1316/1317/1318 as a coordinated change set so the network samples use the same import/helper conventions.

## Suggested implementation sequence

### Step A — inspect existing shared utility surfaces
Search for existing number/shared utility modules and existing approved export barrels.

### Step B — create or extend one canonical utility surface
Either:
- extend an existing shared numeric utility module, or
- add one minimal module plus an approved export surface

### Step C — update the network sample cluster
Normalize all imports/helpers in:
- `samples/phase13/1316/**`
- `samples/phase13/1317/**`
- `samples/phase13/1318/**`

### Step D — update remaining sample/tool callers
Apply the same canonical helper/import surface to the remaining files flagged by the guard.

### Step E — validate until clean
Run the guard first, then full tests.

## Deliverables Codex should produce in code
- minimal shared utility/export changes
- normalized imports in all flagged files
- no behavioral rewrites beyond what is needed to preserve current semantics

## Validation commands
```text
node tools/dev/checkSharedExtractionGuard.mjs
npm test --ignore-scripts
npm test
```

## Expected outcome
- guard unexpected count returns to zero for this change set
- node suite still passes
- full `npm test` becomes green end-to-end

## Reviewer checklist
- Are any forbidden deep/shared relative imports still present?
- Was a single canonical numeric helper path used?
- Were 1316/1317/1318 cleaned consistently?
- Did tool entry points stop reaching shared code through forbidden paths?
- Did `npm test` run cleanly after the change?
