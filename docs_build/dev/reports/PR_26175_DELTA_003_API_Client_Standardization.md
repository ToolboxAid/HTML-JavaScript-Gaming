# PR_26175_DELTA_003_API_Client_Standardization

## Summary

Team Delta standardized remaining local API data unwrap helpers onto the shared `requireServerApiData(...)` client boundary.

`requireServerApiData(...)` now accepts optional client-specific restore guidance while preserving the existing default Browser -> Server API -> Data Source contract message. Session, Admin Setup, and DB Viewer API clients now delegate to the shared helper and keep their previous domain-specific guidance.

## Scope

- Team: Delta
- Backlog item: `Delta - API client consolidation`
- Shared API client changed: `src/api/server-api-client.js`
- API clients consolidated:
  - `src/api/session-api-client.js`
  - `src/api/admin-setup-api-client.js`
  - `src/api/db-viewer-api-client.js`
- Tests added: `tests/dev-runtime/ServerApiClientStandardization.test.mjs`
- Backlog updated: `docs_build/dev/ProjectInstructions/backlog/BACKLOG_MASTER.md`

## Runtime Impact

PASS - API client behavior remains backward compatible.

- Successful server API responses still return `payload.data`.
- Failed server API responses still throw the server error text.
- Missing `data` payloads still emit actionable restore guidance.
- Existing session, setup, and DB Viewer restore messages are preserved through the shared helper.

## Backlog Update

PASS - `Delta - API client consolidation` is marked complete with this PR as the completion reference.

## Tool State Update

SKIP - No Build Path tool status or tool tile state changed.

## Validation Summary

PASS - Focused API client and adjacent dev-runtime validation completed.

See `PR_26175_DELTA_003_API_Client_Standardization-validation.md` for command details.

## Branch Disposition

Source branch should be retained after merge unless OWNER later approves branch deletion.
