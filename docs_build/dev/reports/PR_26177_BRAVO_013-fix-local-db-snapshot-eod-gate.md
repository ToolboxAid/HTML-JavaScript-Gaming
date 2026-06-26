# PR_26177_BRAVO_013-fix-local-db-snapshot-eod-gate

## Branch Validation
- PASS: Work stayed on `bravo/26177-text-to-speech`.
- PASS: Main was not checked out during the PR_013 fix.
- PASS: No `start_of_day` folders were modified.

## Scope Summary
- Restored the explicit DEV Local DB snapshot route required by the EOD gate: `GET /api/local-db/snapshot`.
- Restored the explicit DEV Local DB reseed route required by the EOD gate: `POST /api/local-db/seed`.
- Restored the explicit test-only state replacement route used by the same Local DB seed/reseed tests: `POST /api/dev/testing/mock-db-state`.
- Kept the product-data/Postgres snapshot route strict and unchanged.
- Rejected non-`local-db` legacy mode ids so `local-mem` does not become a fallback.
- Completed active-tool guest seed metadata for `idea-board`, `messages`, `text-to-speech`, and `users` with read-only package entries only.

## Requirement Checklist
- PASS: Investigated why `/api/local-db/snapshot` was not returning ok.
- PASS: Fixed only the Local DB snapshot/seed/reseed and EOD validation setup needed for the failing command.
- PASS: Did not change Text to Speech behavior.
- PASS: Did not add a Local Mem fallback.
- PASS: Did not reintroduce SQLite.
- PASS: Did not add silent fallback behavior.
- PASS: Preserved Local DB/Postgres direction.
- PASS: No governance changes or unrelated cleanup.
- PASS: EOD report was updated with the final hard-stop outcome.

## Root Cause
- `GET /api/local-db/snapshot` had no active route and returned `404`.
- After the route was restored, the full product-data snapshot path tried to read Postgres-backed Game Journey completion metrics in the Local DB seed test environment.
- The Local DB testing snapshot now reads seeded Local DB state without requiring that Postgres-only completion metrics store.
- The same EOD unit lane then exposed missing read-only guest seed package coverage for active tool groups; minimal guest seed metadata was added for those active groups.

## File Inventory
- `src/dev-runtime/server/local-api-router.mjs`
- `docs_build/database/seed/guest/idea-board.json`
- `docs_build/database/seed/guest/messages.json`
- `docs_build/database/seed/guest/text-to-speech.json`
- `docs_build/database/seed/guest/users.json`
- `docs_build/dev/reports/PR_26177_BRAVO_013-fix-local-db-snapshot-eod-gate.md`
- `docs_build/dev/reports/PR_26177_BRAVO_EOD-closeout.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## Validation
- PASS: `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS: `node --test tests/tools/Text2SpeechShell.test.mjs tests/tools/MessagesPlaybackSource.test.mjs tests/dev-runtime/MessagesPublishValidation.test.mjs tests/dev-runtime/DbSeedIntegrity.test.mjs` (23/23)
- FAIL/BLOCKED: `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs tests/playwright/tools/MessagesTool.spec.mjs --project=playwright`
  - Browser launch failed before page code ran because Chromium is missing at `C:\Users\davidq\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.

## EOD Outcome
- Unit/API EOD blocker fixed.
- EOD hard-stopped at impacted Playwright validation.
- Main was not touched.
- Bravo was not pushed.
- Main merge and branch deletion were not attempted.

## Repo-Structured ZIP
- `tmp/PR_26177_BRAVO_013-fix-local-db-snapshot-eod-gate_delta.zip`
