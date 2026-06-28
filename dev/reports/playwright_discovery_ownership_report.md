# Playwright Discovery Ownership Report

Generated: 2026-06-28T14:20:34.601Z
Status: PASS

## Discovery-Time Ownership

| File | Lane Requested | Detected Ownership | Expected Location | Lane Blocked | Status | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| dev/tests/playwright/tools/ToolDisplayModeSingleLineSummary.spec.mjs | tools | tools | dev/tests/playwright/tools | none | PASS | tools lane location |

## Shared Helper Naming

| File | Detected Ownership | Expected Location | Status | Reason |
| --- | --- | --- | --- | --- |
| dev/tests/helpers/playwrightRepoServer.mjs | shared | dev/tests/helpers | PASS | Intentionally shared helper is documented. |
| dev/tests/helpers/playwrightStorageIsolation.mjs | shared | dev/tests/helpers | PASS | Intentionally shared helper is documented. |
| dev/tests/helpers/playwrightV8CoverageReporter.mjs | shared | dev/tests/helpers | PASS | Generic shared helper name. |
| dev/tests/helpers/workspaceV2CoverageReporter.mjs | shared | dev/tests/helpers | PASS | Intentionally shared helper is documented. |

## Blocking Findings

No discovery ownership blockers. Targeted Playwright lanes may be scheduled.

## Execution Guard

- Discovery ownership validation runs before lane scheduling and browser startup.
- Tool lanes reject game-owned, integration-owned, and engine-owned Playwright files.
- Game lanes reject tool-owned, integration-owned, and engine-owned Playwright files.
- Integration-only files are blocked from targeted tool/game lanes.
- Engine/src Playwright files are blocked from tool/game lanes unless the lane explicitly owns them.
- Ownership failures do not trigger fallback lanes or broad reruns.
