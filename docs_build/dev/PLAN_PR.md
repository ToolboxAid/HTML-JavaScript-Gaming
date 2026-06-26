# PLAN_PR: PR_26177_001-shared-hash-foundation

## Purpose

Add a small shared non-cryptographic hash foundation.

## Scope

- Add `src/shared/hash/` foundation.
- Include deterministic non-crypto hash helpers.
- Add targeted unit tests.
- No browser-owned product data.
- No runtime UI changes.
- No unrelated cleanup.

## Implementation Plan

1. Add `src/shared/hash/hash.js` with deterministic stable string and FNV-1a based helpers.
2. Add `tests/shared/HashFoundation.test.mjs`.
3. Validate determinism, object key ordering, seed variation, combination, and normalized hash output.
4. Produce required Codex reports and repo-structured ZIP.

## Acceptance Criteria

- Hash helpers are deterministic for identical values.
- Object hashing is stable regardless of property insertion order.
- Helpers are documented as non-cryptographic.
- No browser storage, UI, API, database, or sample smoke changes are introduced.
