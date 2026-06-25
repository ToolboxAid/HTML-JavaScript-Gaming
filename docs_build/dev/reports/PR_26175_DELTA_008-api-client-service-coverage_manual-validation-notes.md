# PR_26175_DELTA_008 Manual Validation Notes

- Confirmed the API service lane is discoverable by service name: `npm run test:service:api`.
- Confirmed `npm test` remains the site-wide/all-tests command.
- Confirmed no `test:delta-runtime` command exists.
- Confirmed `scripts/run-delta-runtime-validation.mjs` does not exist.
- Confirmed the changed runtime file is limited to `src/api/session-api-client.js`.
- Confirmed the logout change is directly covered by new tests for success and missing server data restore guidance.
- Confirmed no UI, Playwright, browser storage, project JSON, runtime workspace JSON, or status bar files were modified.
