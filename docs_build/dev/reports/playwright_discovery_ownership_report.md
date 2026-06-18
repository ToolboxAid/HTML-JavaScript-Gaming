# Playwright Discovery Ownership Report

Generated: 2026-06-18T01:35:28.849Z
Status: PASS

## Discovery-Time Ownership

| File | Lane Requested | Detected Ownership | Expected Location | Lane Blocked | Status | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| tests/playwright/tools/PublicMembershipsPage.spec.mjs | tools | tools | tests/playwright/tools | none | PASS | tools lane location |
| tests/playwright/tools/RootToolsFutureState.spec.mjs | tools | tools | tests/playwright/tools | none | PASS | tool-specific filename: RootToolsFutureState |

## Shared Helper Naming

| File | Detected Ownership | Expected Location | Status | Reason |
| --- | --- | --- | --- | --- |
| tests/helpers/playwrightRepoServer.mjs | shared | tests/helpers | PASS | Intentionally shared helper is documented. |

## Blocking Findings

No discovery ownership blockers. Targeted Playwright lanes may be scheduled.

## Execution Guard

- Discovery ownership validation runs before lane scheduling and browser startup.
- Tool lanes reject game-owned, integration-owned, and engine-owned Playwright files.
- Game lanes reject tool-owned, integration-owned, and engine-owned Playwright files.
- Integration-only files are blocked from targeted tool/game lanes.
- Engine/src Playwright files are blocked from tool/game lanes unless the lane explicitly owns them.
- Ownership failures do not trigger fallback lanes or broad reruns.
