# PLAN_PR: PR_26177_006-shared-time-foundation

## Purpose

Add a small shared time foundation.

## Scope

- Add `src/shared/time/` foundation.
- Include duration formatting, timestamp helpers, sleep, debounce, and throttle helpers.
- Add targeted tests.
- No scheduler/runtime behavior changes.
- No browser-owned product data.
- No runtime UI changes.
- No unrelated cleanup.

## Implementation Plan

1. Add `src/shared/time/time.js`.
2. Add `tests/shared/TimeFoundation.test.mjs`.
3. Validate duration, timestamp, sleep, debounce, and throttle helpers.
4. Produce required Codex reports and repo-structured ZIP.
