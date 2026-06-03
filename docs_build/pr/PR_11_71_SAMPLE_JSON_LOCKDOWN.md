# PR 11.71 — Sample JSON Lockdown

## Purpose
Lock down the sample JSON audit lane so missing references and palette drift do not return.

## Scope
- Add CI-safe sample JSON validation script.
- Keep output counts-first by default.
- Preserve optional detail mode for diagnostics.
- Fail CI on missing JSON references.
- Report palette-only samples for follow-up visibility.

## Non-goals
- No sample refactors.
- No asset reconstruction.
- No roadmap text rewrites.
- No full sample smoke test.

## Acceptance
- Script runs from repo root.
- Default output prints summary counts only.
- `-Details` prints paths and diagnostics.
- `-Ci` exits non-zero if missing references are found.
- Palette-only sample count is included in output.
