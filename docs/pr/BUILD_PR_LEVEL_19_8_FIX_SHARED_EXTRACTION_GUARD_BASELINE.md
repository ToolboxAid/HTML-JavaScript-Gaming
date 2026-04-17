# BUILD_PR_LEVEL_19_8_FIX_SHARED_EXTRACTION_GUARD_BASELINE

## Purpose
Fix blocking validation failure:
tools/dev/checkSharedExtractionGuard.mjs baseline drift (baseline_unexpected=288)

## Scope
- Single purpose PR
- Align baseline to current repo state OR fix guard logic mismatch
- No feature work

## Required Change
1. Run:
   npm test (observe baseline failure)

2. Run guard script directly:
   node tools/dev/checkSharedExtractionGuard.mjs

3. Identify:
   - newly valid shared extractions OR
   - false positives in guard logic

4. Apply ONE of:
   A. Update baseline file to match current valid state
   OR
   B. Fix guard logic to correctly classify entries

## Validation
- npm test passes pretest
- baseline_unexpected = 0

## Acceptance
- Guard passes cleanly
- No unintended shared leaks introduced
