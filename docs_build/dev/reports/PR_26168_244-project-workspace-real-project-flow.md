# PR_26168_244-project-workspace-real-project-flow

## Branch Validation
- PASS: current branch verified as `main`.
- Expected branch: `main`.

## Summary
- Extended Project Workspace project records with service-owned authoritative key and storage-reference linkage evidence.
- Preserved real create/open/delete/save flow through the server repository client.
- Kept guest browsing while guest saving remains blocked.
- Cleaned user-facing Project Workspace copy to product language while reports and API payloads retain Local API/Local DB/SQLite evidence.

## Requirement Checklist
- PASS: Project Workspace connects through API/service contract for project records.
- PASS: API/server owns authoritative project keys.
- PASS: Real project create/open/delete flow remains covered.
- PASS: Asset references are linked to storage object keys in the API project-record payload.
- PASS: Guest browsing is allowed.
- PASS: Guest saving is not allowed.
- PASS: Browser storage is not introduced as product-data SSoT.
- PASS: No Supabase Auth work added.

## Validation Lane Report
- PASS: `npx playwright test tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs --grep "Game Workspace creates, opens, and deletes mock games|Project Workspace preserves guest browsing and blocks guest saves" --reporter=line` passed 2/2.
- PASS: `npm run test:workspace-v2` passed 5/5. Command name is legacy; user-facing language is Project Workspace.
- PASS: `node --check toolbox/game-workspace/game-workspace.js`.
- PASS: `npm run validate:browser-env-agnostic` passed.
- PASS/WARN: V8 coverage covers `toolbox/game-workspace/game-workspace.js`; server-side Local API changes are advisory WARN.

## Manual Validation Notes
- Project record status now says records are loaded from the project records service with service-managed authoritative keys.
- API response still includes `api: Local API`, `database: Local DB`, and `databaseEngine: SQLite` for report/operator evidence.

## Full Samples Decision
- SKIP: Project Workspace flow changes did not touch sample JSON or sample launch behavior.
