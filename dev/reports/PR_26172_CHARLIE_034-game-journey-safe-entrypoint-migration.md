# PR_26172_CHARLIE_034-game-journey-safe-entrypoint-migration

## Summary

Status: PASS.

The Game Journey browser entrypoint was moved from the active legacy toolbox path to the canonical tool asset path:

- From: `toolbox/game-journey/game-journey.js`
- To: `assets/toolbox/game-journey/js/index.js`

The Game Journey API client was retained for PR_035 review.

## Files Reviewed

- `docs_build/dev/ProjectInstructions/README.txt`
- `docs_build/dev/ProjectInstructions/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/reports/PR_26172_CHARLIE_033-game-journey-canonical-js-migration-audit.md`
- `toolbox/game-journey/index.html`
- `toolbox/game-journey/game-journey.js`
- `toolbox/game-journey/game-journey-api-client.js`
- `tests/playwright/tools/GameJourneyTool.spec.mjs`
- `scripts/validate-canonical-repository-structure.mjs`

## Files Changed

- `assets/toolbox/game-journey/js/index.js`
- `toolbox/game-journey/index.html`
- `scripts/validate-canonical-repository-structure.mjs`
- `tests/playwright/tools/GameJourneyTool.spec.mjs`
- `docs_build/dev/reports/PR_26172_CHARLIE_034-game-journey-safe-entrypoint-migration.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Migration Notes

- Updated the Game Journey page module script to load `assets/toolbox/game-journey/js/index.js`.
- Updated the moved module imports to continue using:
  - `toolbox/game-journey/game-journey-api-client.js`
  - `toolbox/tool-registry-api-client.js`
- Removed `toolbox/game-journey/game-journey.js` from the approved legacy JS exception list.
- Updated the Game Journey source separation test to read the canonical entrypoint path.

## Retained Exception

- `toolbox/game-journey/game-journey-api-client.js`
  - Reason: reviewed separately in PR_035.
  - Risk: the canonical guardrail currently approves the tool `index.js` entrypoint path but does not approve additional tool JS files under the same folder.

## Validation Lane Report

- `node --check assets/toolbox/game-journey/js/index.js`
  - Result: PASS
- `git diff --check`
  - Result: PASS
- `npm run validate:canonical-structure`
  - Result: PASS
  - Blocking violations: 0
  - Approved legacy exceptions: 481
- Active stale reference check for `toolbox/game-journey/game-journey.js`
  - Result: PASS
  - Only historical `docs_build/pr` references remain.
- Targeted Game Journey Playwright validation:
  - Command: `npx playwright test tests/playwright/tools/GameJourneyTool.spec.mjs --grep "Game Journey summary table uses inline notes" --workers=1 --reporter=line --timeout=90000`
  - Result: PASS

## Completion Metrics Note

The targeted Playwright route test uses the existing Postgres completion-metrics stub and passed. The known local legacy SQLite preservation failure documented in PR_26172_CHARLIE_006A did not appear in this validation lane.

## Branch Validation

- Current branch: `PR_26172_CHARLIE_repository-compliance-stack`
- Expected branch: `PR_26172_CHARLIE_repository-compliance-stack`
- Local/origin sync before PR: `0 0`
- Branch validation: PASS

## Requirement Checklist

- Use PR_033 audit: PASS
- Move only `game-journey.js` to canonical path: PASS
- Update `toolbox/game-journey/index.html`: PASS
- Update tests/references for old path: PASS
- Preserve behavior: PASS
- Do not move API client unless PR_033 proves safe: PASS, retained.
- No feature changes: PASS
- Run targeted Game Journey validation: PASS
- Run canonical structure guardrail: PASS
- Document known SQLite preservation blocker separately if encountered: PASS, not encountered.
- Confirm ZIP exists: PASS after artifact creation.

## Manual Validation Notes

The entrypoint migration is isolated and validated. The retained API client should be resolved in PR_035 without changing completion-metrics behavior.

## Recommendation

Continue to PR_035 and keep `toolbox/game-journey/game-journey-api-client.js` as an exception unless a safe guardrail-compliant placement is available.
