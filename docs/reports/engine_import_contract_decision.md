# Engine Import Contract Decision

Generated: 2026-04-12
Lane: BUILD_PR_ENGINE_IMPORT_BASELINE_AND_CONTRACT

## Decision
Current import style is an acceptable and stable baseline contract.

## Contract Summary
1. JS/module imports should use rooted engine specifiers where used today:
   - `/src/engine/...`
2. HTML asset links may use either:
   - rooted `/src/engine/...` for root-served pages, or
   - relative `../..` paths for nested pages.
3. Non-runtime string references to `src/engine/...` (docs/config/baselines) do not, by themselves, indicate contract drift.

## Justification
- Baseline evidence shows strong consistency:
  - non-HTML rooted usage is dominant (`1464` rooted vs `1` relative-up-path)
  - HTML usage follows location-aware linking (`214` relative-up-path, `22` rooted)
- Existing roadmap already records import normalization completion.
- This lane is baseline+contract confirmation only; no rewrite needed.

## Decision Outcome
- Preserve current contract as baseline.
- Defer any import-style unification to a dedicated future rewrite lane (if requested).