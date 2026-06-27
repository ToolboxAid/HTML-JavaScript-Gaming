# PR_26178_ALFA_001 Manual Validation Notes

## Review Notes
- Confirmed the Tags read path remains server/API owned and still requires the configured API database adapter.
- Confirmed no Tags page, browser-owned product data, local storage product source, MEM DB, or page-local product arrays were added.
- Confirmed the public failure message no longer exposes raw missing-table details such as `relation "project_tags" does not exist`.
- Confirmed the operator diagnostic still carries the raw cause for developer troubleshooting.
- Confirmed the Local API route returns HTTP 503 JSON for Tags setup failures instead of allowing the async service rejection to escape.
- Confirmed the API response body does not include `operatorDiagnostic`, raw relation text, table names, database URLs, hostnames, or credentials.
- Confirmed Assets no longer triggers an async Tags database read while the Local API data source is being constructed.

## Expected Manual Behavior
- With the Tags database schema applied, opening Tags and invoking the repository snapshot/list path should load seeded flat Tags from the API database.
- If account, Game Hub, or Tags database setup is missing, Tags API requests should fail with a 503 setup message telling the operator to verify the API database connection and apply setup.
- The service should not return fake data or silently treat missing schema as an empty Tags list.
- After a Tags setup failure, the Local API server should continue handling other API requests.

## Packaging
- Repo-structured delta ZIP: `tmp/PR_26178_ALFA_001-fix-tags-local-api-crash_delta.zip`
