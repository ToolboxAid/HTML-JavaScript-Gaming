# BUILD PR — STATE + SAMPLE `toFiniteNumber` MIGRATION

## PR Purpose
Migrate the remaining state/sample-local `toFiniteNumber(value, fallback = 0)` implementations to the canonical shared math helper in `src/shared/math/numberNormalization.js`.

This PR has one purpose only:
- replace exact local duplicate implementations in the two known remaining consumer files
- preserve behavior with fallback default `0`
- do not widen scope beyond these files

## Exact Target Files
### Code files to modify
- `src/advanced/state/transitions.js`
- `samples/shared/worldGameStateSystem.js`

### Existing shared dependency to use
- `src/shared/math/numberNormalization.js`

### Delivery docs to include/update in this bundle
- `docs/pr/BUILD_PR_SHARED_EXTRACTION_51_STATE_SAMPLE_TOFINITENUMBER_MIGRATION.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
- `docs/dev/next_command.txt`
- `docs/dev/reports/file_tree.txt`
- `docs/dev/reports/change_summary.txt`
- `docs/dev/reports/validation_checklist.txt`

## Preconditions
Assume BUILD 50 has already landed and the canonical helper exists in:
- `src/shared/math/numberNormalization.js`

Assume that file exports:
- `toFiniteNumber(value, fallback = 0)`
- `roundNumber(value)` may also exist there, but it is out of scope for this PR

If the canonical `toFiniteNumber` export does not exist in `src/shared/math/numberNormalization.js`, fail fast and stop.

## Required Code Changes
### 1) `src/advanced/state/transitions.js`
- remove the local `function toFiniteNumber(value, fallback = 0)` implementation
- import `toFiniteNumber` from `src/shared/math/numberNormalization.js` using the correct relative path
- preserve all existing call-site behavior
- do not change other helpers in this file

### 2) `samples/shared/worldGameStateSystem.js`
- remove the local `function toFiniteNumber(value, fallback = 0)` implementation
- import `toFiniteNumber` from `src/shared/math/numberNormalization.js` using the correct relative path
- preserve all existing call-site behavior
- do not change unrelated helpers in this file

## Explicit Non-Goals
Do NOT:
- modify `src/shared/math/numberNormalization.js`
- touch any vector files
- touch any other number helpers (`asFiniteNumber`, `asPositiveNumber`, `normalizeNumber`, `sanitizeFiniteNumber`, etc.)
- touch any files other than the two exact code files listed above
- rename exports
- perform repo-wide cleanup
- change logic beyond replacing the duplicate local helper with the shared import

## Acceptance Criteria
- both target files import `toFiniteNumber` from `src/shared/math/numberNormalization.js`
- both target files no longer define a local `toFiniteNumber`
- behavior remains fallback-compatible with default `0`
- no unused imports remain
- no call sites are changed beyond the import-based migration
- bundle output is written to `<project folder>/tmp/BUILD_PR_SHARED_EXTRACTION_51_STATE_SAMPLE_TOFINITENUMBER_MIGRATION_delta.zip`

## Validation Steps
1. Confirm `src/shared/math/numberNormalization.js` exports `toFiniteNumber`
2. Open `src/advanced/state/transitions.js`
   - verify local `toFiniteNumber` removed
   - verify shared import added
3. Open `samples/shared/worldGameStateSystem.js`
   - verify local `toFiniteNumber` removed
   - verify shared import added
4. Search only within the two target files for `function toFiniteNumber`
   - expect zero matches
5. Ensure there are no unused imports in the two target files
6. Package only the changed files plus required docs into:
   - `<project folder>/tmp/BUILD_PR_SHARED_EXTRACTION_51_STATE_SAMPLE_TOFINITENUMBER_MIGRATION_delta.zip`

## Fail-Fast Conditions
Stop immediately if any of the following occurs:
- `src/shared/math/numberNormalization.js` does not export `toFiniteNumber`
- migration would require touching files beyond the two exact code files
- behavior-preserving replacement cannot be completed directly
- any ambiguity appears about which helper version should be used

## Output Expectation
Return one repo-structured delta zip at:
- `<project folder>/tmp/BUILD_PR_SHARED_EXTRACTION_51_STATE_SAMPLE_TOFINITENUMBER_MIGRATION_delta.zip`

Include only:
- changed code files
- docs for this PR
- report files for this PR

Do not include unrelated files, full-repo copies, dependencies, or build artifacts.
