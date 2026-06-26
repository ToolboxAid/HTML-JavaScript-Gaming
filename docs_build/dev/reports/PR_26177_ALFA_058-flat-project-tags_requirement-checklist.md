# PR_26177_ALFA_058 Requirement Checklist

| Requirement | Status | Notes |
| --- | --- | --- |
| Flat tags only, no categories | PASS | Tags use `project_tags` and `project_tag_assignments` only. |
| Tags tool loads through API | PASS | Browser uses shared server repository client. |
| Signed-in Creator can add tag | PASS | Playwright API/UI coverage passed. |
| Signed-in Creator can assign/remove current-game tag | PASS | Playwright API/UI coverage passed with refresh persistence. |
| Duplicate prevention | PASS | API/UI duplicate validation covered. |
| Guest save/create/update/delete redirects or 401s | PASS | UI redirect and API rejection covered. |
| No browser-owned product data | PASS | Writes route through API database service. |
| No JSON source of truth | PASS | No tool JSON store added. |
| No mock repository source of truth | PASS | Retired mock files deleted and guardrail added. |
| No new or expanded mock-db-store usage for Tags/Game Crew/Game Design/Game Configuration | PASS | Router uses DB-backed Alfa services; this PR does not change `mock-db-store.js`. |
| Server/API owns keys and audit fields | PASS | Service uses adapter key creation and audit fields. |
| DDL/DML/seed location discipline | PASS | DDL under `docs_build/database/ddl/`; no duplicate tool DDL folders added. |
