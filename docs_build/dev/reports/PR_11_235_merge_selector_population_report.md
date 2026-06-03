# PR_11_235 — Merge Selector Population From Workspace V2 Session History

## Files Changed
- `toolbox/workspace-v2/index.js`
- `tests/runtime/V2MergeSelectorPopulation.test.mjs`

## Implementation Summary
- Merge Session A / Session B selectors are now populated from valid Workspace V2 session history entries (`v2-session-history`) via `readSessionHistory()`.
- Each selector option resolves to:
  - session/context id (`history:<hostContextId>`)
  - display label (`History | <tool> | <hostContextId> | <timestamp>`)
  - payload snapshot (`payload`)
- No fallback/default sessions were added.
- No silent auto-selection was added:
  - selectors now include explicit placeholders (`Select Session A`, `Select Session B`)
  - preview requires explicit selection
- Under-two-history gate message now uses required text:
  - `Create or reopen at least two Workspace V2 sessions before previewing a merge.`
- Existing PR_11_234 selection validation messages preserved for missing/same selections.
- Existing PR_11_233 guard/apply behavior preserved:
  - confirmed preview required
  - stale preview blocking
  - conflict blocking
  - post-apply verification
  - audit trail

## Validation Commands
- `node --check toolbox/workspace-v2/index.js`
- `node --check tests/runtime/V2MergeSelectorPopulation.test.mjs`
- `node tests/runtime/V2MergeSelectorPopulation.test.mjs`

## Validation Results
- `node --check toolbox/workspace-v2/index.js` → PASS
- `node --check tests/runtime/V2MergeSelectorPopulation.test.mjs` → PASS
- `node tests/runtime/V2MergeSelectorPopulation.test.mjs` → PASS

Runtime artifact:
- `tmp/v2-merge-selector-population-results.json`

## Required Scenario Coverage
- zero valid history sessions shows specific create/reopen message: PASS
- one valid history session shows same specific message: PASS
- two valid history sessions populate both selectors: PASS
- selected distinct sessions produce dry-run preview: PASS
- same session selection blocks preview: PASS
- valid preview enables Confirm Preview: PASS
- confirmed preview enables Apply Merge: PASS
- apply writes audit record: PASS

## Full Smoke Decision
- Full samples smoke was **not run**.
- Reason: this PR is scoped only to Workspace V2 merge selector population from history and includes targeted executable validation for all required paths.

## Scope Guard Confirmation
- No schema changes
- No sample changes
- No game changes
- No Workspace Manager v1 changes
- No legacy tool fixes
- No `platformShell` / `toolbox/shared/*` changes
