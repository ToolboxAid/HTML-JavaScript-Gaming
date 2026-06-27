# PR_26172_CHARLIE_041-final-retained-exceptions-reaudit

## Summary

Status: PASS with one retained owner-review exception.

Final retained-exceptions status after PR_037 through PR_040:

- `toolbox/controls/controls-api-client.js`: resolved, moved to `assets/js/shared/controls-api-client.js`.
- `toolbox/assets/assets-api-client.js`: resolved, moved to `assets/js/shared/assets-api-client.js`.
- `toolbox/game-journey/game-journey-api-client.js`: resolved, moved to `assets/js/shared/game-journey-api-client.js`.
- `toolbox/assets/assets-upload-worker.js`: retained temporary exception, owner review required for canonical worker placement.

## Remaining Exception

| Path | Status | Blocker | Owner review item |
| --- | --- | --- | --- |
| `toolbox/assets/assets-upload-worker.js` | Temporary exception | Canonical governance does not define tool-local worker module placement. | Approve a worker path rule before moving. |

## Migration Status

| Original exception | Final status |
| --- | --- |
| `toolbox/controls/controls-api-client.js` | Migrated to shared |
| `toolbox/assets/assets-api-client.js` | Migrated to shared |
| `toolbox/assets/assets-upload-worker.js` | Retained exception |
| `toolbox/game-journey/game-journey-api-client.js` | Migrated to shared |

## Active Reference Audit

Remaining active references from the original exception list:

- `toolbox/assets/assets-upload-worker.js`
  - `assets/toolbox/assets/js/index.js`
  - `scripts/validate-canonical-repository-structure.mjs`
  - `tests/regression/CanonicalRepositoryStructureGuardrail.test.mjs`
  - `tests/playwright/tools/AssetToolMockRepository.spec.mjs`

Resolved shared client references:

- `assets/js/shared/assets-api-client.js`
- `assets/js/shared/controls-api-client.js`
- `assets/js/shared/game-journey-api-client.js`

## Blockers

1. Assets upload worker placement:
   - The canonical structure currently defines `assets/toolbox/{tool-name}/js/index.js` and `assets/js/shared/`.
   - The worker is tool-specific, not shared.
   - Moving it safely requires an approved worker path rule.

2. Assets upload HTTP 500:
   - PR_038 traced the failure to Local API persistence/provider behavior.
   - This is separate from worker placement and should be fixed in a persistence/API validation PR.

3. Browser-env gate:
   - `npm run validate:browser-env-agnostic` still fails on existing Local API product service contract findings and Messages implementation wording.
   - These findings are outside the retained-exceptions migration scope.

## Guardrail Status

- `npm run validate:canonical-structure`
  - Result: PASS
  - Blocking violations: 0
  - Approved legacy exceptions: 478
- `node --test tests/regression/CanonicalRepositoryStructureGuardrail.test.mjs`
  - Result: PASS
- `npm run validate:browser-env-agnostic`
  - Result: FAIL
  - Existing findings:
    - Product service contract findings in `src/dev-runtime/server/local-api-router.mjs`.
    - Messages user-facing implementation wording findings.

## Branch Validation

- Current branch: `PR_26172_CHARLIE_repository-compliance-stack`
- Expected branch: `PR_26172_CHARLIE_repository-compliance-stack`
- Local/origin sync before PR: `0 0`
- Branch validation: PASS

## Requirement Checklist

- Final audit remaining exceptions: PASS
- Report migration status: PASS
- Report blockers: PASS
- Report owner review items: PASS
- Report guardrail status: PASS
- Do not merge: PASS
- Produce ZIP artifact: PASS after artifact creation.

## Manual Validation Notes

The retained-exceptions workstream reduced the original target exception list from four active legacy files to one tool-specific worker exception. The remaining worker path should stay documented until the owner approves canonical worker placement.

## Recommended Next PRs

1. OWNER/Charlie worker placement governance for tool-local module workers.
2. Assets upload persistence/API validation recovery for `addAssetRecord` HTTP 500.
3. Assets worker migration after worker placement governance and upload persistence validation are complete.
4. Browser-env gate cleanup for Local API product service contract and Messages wording findings.
