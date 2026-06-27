# PR_26172_CHARLIE_038-assets-upload-http-500-investigation

## Summary

Status: PASS with blocker documented.

The Assets upload HTTP 500 was reproduced and traced to the Local API data-provider persistence boundary. No executable code was changed because the failure is not caused by the Charlie migration and the safe fix requires a separately scoped persistence/API decision.

## Root Cause

The upload worker successfully loads and returns file bytes to the Assets page. The failure occurs later when the browser calls:

`POST /api/toolbox/assets/repositories/assets-1/methods/addAssetRecord`

The Local API route executes `addAssetRecord`, then persists asset runtime tables through:

- `repositoryMethodRequiresPersistence(methodName)`
- `persistAssetProviderState(action)`
- `persistSupabaseAssetSnapshot(action)`
- `upsertSupabaseProductTables(tables, action)`
- `SupabasePostgresProviderAdapter.upsertProductTables(...)`

The configured product data adapter request fails with:

`fetch failed`

The API response includes the expected boundary rule:

`Browser -> Server API -> Data Source`

## Migration Causality

Caused by migration: NO.

Evidence:

- The canonical Assets entrypoint loads successfully.
- The retained upload worker starts successfully from `toolbox/assets/assets-upload-worker.js`.
- The failure happens only after the worker completes and `addAssetRecord` calls the server data persistence layer.
- The failed response is from Local API persistence, not from a missing script, missing worker, import error, or browser module path.

## Files Reviewed

- `assets/toolbox/assets/js/index.js`
- `toolbox/assets/assets-api-client.js`
- `toolbox/assets/assets-upload-worker.js`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `tests/helpers/playwrightRepoServer.mjs`
- `src/api/server-api-client.js`
- `src/dev-runtime/server/local-api-router.mjs`
- `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- `src/dev-runtime/auth/provider-contract-stubs.mjs`

## Reproduction Evidence

Targeted probe result:

```json
{
  "log": "Batch upload complete: 0 written, 1 failed, 0 skipped, 0 warnings.",
  "batchLog": [
    {
      "status": "FAIL",
      "text": "FAIL: http-500-probe.png - fetch failed"
    }
  ],
  "workers": [
    "http://127.0.0.1:<port>/toolbox/assets/assets-upload-worker.js"
  ],
  "failedResponses": [
    {
      "status": 500,
      "url": "http://127.0.0.1:<port>/api/toolbox/assets/repositories/assets-1/methods/addAssetRecord",
      "body": "{\"error\":\"fetch failed\",\"ok\":false,\"rule\":\"Browser -> Server API -> Data Source\"}"
    }
  ]
}
```

Provider contract route result:

- `/api/providers/contract`: HTTP 200
- Active provider: `supabase-postgres`
- Status: `ready`
- Diagnostic: runtime account and product data connections are fixed to configured server services.

## Fix Decision

Fix applied: NO.

Reason:

- A safe fix would require deciding how Local API Playwright upload validation should persist asset runtime tables when the configured product data adapter is unavailable or unreachable.
- Options include test-scoped Postgres stubbing, a Local API asset persistence adapter, or improved diagnostics. Each option changes persistence/API behavior and is outside this Charlie retained-exception migration scope.
- Silently bypassing persistence for `addAssetRecord` would violate the active server data boundary and could hide real provider failures.

## Validation Lane Report

- HTTP 500 reproduction: PASS
- Worker load confirmation: PASS
- Root-cause trace through Local API persistence: PASS
- Migration causality check: PASS
- Runtime source changes: PASS, none.
- ZIP artifact exists: PASS after artifact creation.

## Branch Validation

- Current branch: `PR_26172_CHARLIE_repository-compliance-stack`
- Expected branch: `PR_26172_CHARLIE_repository-compliance-stack`
- Local/origin sync before PR: `0 0`
- Branch validation: PASS

## Requirement Checklist

- Determine root cause: PASS
- Confirm whether caused by migration or pre-existing persistence/API issue: PASS
- Fix only if clear and safe: PASS, no fix applied because safe resolution is outside scope.
- Otherwise document blocker: PASS
- Do not merge: PASS
- Produce ZIP artifact: PASS after artifact creation.

## Manual Validation Notes

The blocker should be handled by a separate persistence/API validation PR. The retained Assets worker path is not the source of this HTTP 500.

## Recommendation

Continue to PR_039. Move the shared Assets API client if safe, but keep the upload worker as a temporary exception until worker placement governance and upload persistence validation are separately resolved.
