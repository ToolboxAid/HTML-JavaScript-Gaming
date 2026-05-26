# Filesystem Scan Reduction Report

Generated: 2026-05-26T22:20:10.285Z
Status: PASS

## Scan Enforcement

| Path | Status | Reason |
| --- | --- | --- |
| tests/playwright | BROAD | Standalone structural audit intentionally enumerated all Playwright ownership buckets. |
| tests/helpers | BROAD | Standalone structural audit intentionally checked all shared helper ownership. |

## Runtime Savings Observations

- Standalone ownership validation used broad mode by design; targeted lane runner supplies scoped discovery inputs.
- Helper and fixture inputs are explicit, allowing the runner to cache the discovery map within one execution cycle.
- Deterministic discovery-scope failures block Playwright launch instead of expanding into fallback lanes.
- Full samples smoke remains outside targeted discovery unless samples scope is explicitly active.

## Blockers

No scan-scope blockers.
