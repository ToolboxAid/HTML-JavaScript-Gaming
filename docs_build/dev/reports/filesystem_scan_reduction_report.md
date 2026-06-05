# Filesystem Scan Reduction Report

Generated: 2026-06-05T01:16:23.974Z
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
| tests/playwright/tools | SKIP | Unselected lane directory discovery was skipped. |

## Runtime Savings Observations

- Scoped discovery prevented broad Playwright lane-directory enumeration for targeted execution.
- Helper and fixture inputs are explicit, allowing the runner to cache the discovery map within one execution cycle.
- Deterministic discovery-scope failures block Playwright launch instead of expanding into fallback lanes.
- Full samples smoke remains outside targeted discovery unless samples scope is explicitly active.

## Blockers

No scan-scope blockers.
