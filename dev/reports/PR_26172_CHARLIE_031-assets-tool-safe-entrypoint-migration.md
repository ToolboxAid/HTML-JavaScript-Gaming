# PR_26172_CHARLIE_031-assets-tool-safe-entrypoint-migration

## Summary

Status: PASS with validation blocker documented.

The Assets tool entrypoint was moved from the active legacy toolbox path to the canonical tool asset path:

- From: `toolbox/assets/assets.js`
- To: `assets/toolbox/assets/js/index.js`

The Assets API client and upload worker were retained in their existing legacy paths because PR_030 identified both as higher-risk follow-up items:

- `toolbox/assets/assets-api-client.js`
- `toolbox/assets/assets-upload-worker.js`

## Files Reviewed

- `docs_build/dev/ProjectInstructions/README.txt`
- `docs_build/dev/ProjectInstructions/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/reports/PR_26172_CHARLIE_030-assets-tool-canonical-js-migration-audit.md`
- `toolbox/assets/index.html`
- `toolbox/assets/assets.js`
- `toolbox/assets/assets-api-client.js`
- `toolbox/assets/assets-upload-worker.js`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `scripts/validate-canonical-repository-structure.mjs`

## Files Changed

- `assets/toolbox/assets/js/index.js`
- `toolbox/assets/index.html`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `scripts/validate-canonical-repository-structure.mjs`
- `docs_build/dev/reports/PR_26172_CHARLIE_031-assets-tool-safe-entrypoint-migration.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Migration Notes

- Updated the HTML module script reference to `assets/toolbox/assets/js/index.js`.
- Updated the moved module imports so it can still load the retained API client and session API from the canonical asset location.
- Updated the retained worker URL to continue loading `toolbox/assets/assets-upload-worker.js`.
- Removed `toolbox/assets/assets.js` from the approved legacy JS exception list.
- Added test public API configuration so the relocated module resolves the Playwright Local API server explicitly.

## Retained Exceptions

- `toolbox/assets/assets-api-client.js`
  - Reason: shared with Objects through `assets/toolbox/objects/js/index.js`.
  - Follow-up: define shared client placement before moving it.
- `toolbox/assets/assets-upload-worker.js`
  - Reason: worker filename/placement is not yet covered by the canonical guardrail.
  - Follow-up: add an approved worker placement rule or leave as a temporary legacy exception.

## Validation Lane Report

- `node --check assets/toolbox/assets/js/index.js`
  - Result: PASS
- `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
  - Result: PASS
- `git diff --check`
  - Result: PASS
- `npm run validate:canonical-structure`
  - Result: PASS
  - Blocking violations: 0
  - Approved legacy exceptions: 482
- Active stale reference check for `toolbox/assets/assets.js`
  - Result: PASS
  - No active non-report references remain.
- Direct browser probe for Assets page
  - Result: PASS
  - Canonical script loaded.
  - Retained legacy worker URL was reachable.
- Targeted Playwright route validation:
  - Command: `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs --grep "Assets launches as asset-type accordions" --workers=1 --reporter=line --timeout=90000`
  - Result: FAIL
  - Failure: upload completed with `0 written, 1 failed`.
  - Root observation: the browser loaded the canonical module, started the retained worker at `toolbox/assets/assets-upload-worker.js`, then the Local API returned HTTP 500 from `/api/toolbox/assets/repositories/assets-1/methods/addAssetRecord`.
  - Local API failure text observed in the UI: `fetch failed`.
  - Classification: validation blocker is in the asset persistence/provider lane, not the entrypoint path migration.

## Branch Validation

- Current branch: `PR_26172_CHARLIE_repository-compliance-stack`
- Expected branch: `PR_26172_CHARLIE_repository-compliance-stack`
- Local/origin sync before PR: `0 0`
- Branch validation: PASS

## Requirement Checklist

- Move `toolbox/assets/assets.js` to `assets/toolbox/assets/js/index.js`: PASS
- Update `toolbox/assets/index.html` script reference: PASS
- Preserve behavior: PASS for page load and worker startup; upload persistence lane blocked by Local API provider failure.
- Do not move worker unless PR_030 proves safe: PASS
- Do not move API client unless PR_030 proves safe: PASS
- Do not add feature work: PASS
- Run targeted Assets validation if available: PASS with documented failure in persistence lane.
- Run canonical structure guardrail: PASS
- Confirm old active `assets.js` path is no longer referenced unless documented: PASS
- Confirm worker still loads if retained: PASS
- Confirm ZIP exists: PASS after artifact creation.

## Manual Validation Notes

The migration changes only the active entrypoint path and keeps the higher-risk Assets API client and worker in place. Targeted browser probing confirmed the canonical script and retained worker load correctly. The full upload Playwright test still fails because `addAssetRecord` returns HTTP 500 from Local API persistence; that issue was reproduced after storage variables were cleared for the command, so it should be tracked separately from canonical JS relocation.

## Recommendation

Continue to PR_032. Retain the Assets API client and worker as documented exceptions unless PR_032 identifies a safe canonical placement that does not alter upload behavior.
