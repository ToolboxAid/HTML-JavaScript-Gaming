# PLAN_PR: PR_26177_005-shared-text-foundation

## Purpose

Add a small shared text foundation.

## Scope

- Add `src/shared/text/` foundation.
- Include safe string helpers for whitespace normalization, slug/casing, truncation, and HTML escaping.
- Add targeted tests.
- No copy rewrites outside tests/docs.
- No browser-owned product data.
- No runtime UI changes.
- No unrelated cleanup.

## Implementation Plan

1. Add `src/shared/text/text.js`.
2. Add `tests/shared/TextFoundation.test.mjs`.
3. Validate safe string helpers.
4. Produce required Codex reports and repo-structured ZIP.
