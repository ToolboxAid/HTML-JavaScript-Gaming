# Filesystem Scan Reduction Report

Generated: 2026-06-20T22:00:44.868Z
Status: PASS

## Scan Enforcement

| Path | Status | Reason |
| --- | --- | --- |
| tests/playwright | PREVENTED | Targeted lanes supplied explicit spec files; global Playwright discovery was not used. |
| tests/helpers | SCOPED | Helper discovery used the targeted import graph instead of enumerating every helper. |
| games/ | SCOPED | Game fixture discovery used explicit manifest/path references from targeted files. |
| tests/playwright/engine | SKIP | Unselected lane directory discovery was skipped. |
| tests/playwright/games | SKIP | Unselected lane directory discovery was skipped. |
| tests/playwright/integration | SKIP | Unselected lane directory discovery was skipped. |
| tests/playwright/tools | SCOPED | Selected lane discovery was restricted to explicit target specs. |

## Runtime Savings Observations

- Scoped discovery prevented broad Playwright lane-directory enumeration for targeted execution.
- Helper and fixture inputs are explicit, allowing the runner to cache the discovery map within one execution cycle.
- Deterministic discovery-scope failures block Playwright launch instead of expanding into fallback lanes.
- Full samples smoke remains outside targeted discovery unless samples scope is explicitly active.

## Blockers

No scan-scope blockers.
