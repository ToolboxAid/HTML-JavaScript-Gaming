# PR_26180_BRAVO_002-complete-messages-creator-tool

## Branch Validation

PASS - Current branch is `PR_26180_BRAVO_002-complete-messages-creator-tool`.
PASS - Scoped PR_002 Messages Creator Tool changes were preserved.
PASS - Artifact paths use `dev/reports` and `dev/workspace/zips`.
PASS - `dev/build/database/seed/guest/game-crew.json` was not modified.
PASS - `dev/tests/dev-runtime/DbSeedIntegrity.test.mjs` was not modified for Game Crew.
PASS - PR_003+ Game Crew cleanup was not started from this dirty branch.

## Product Owner Testable Outcome

After applying this PR, the Product Owner can test the API-backed Message Studio MVP workflow:

- Create, edit, save, archive, and delete Messages.
- Use creator-facing `Speaker`, `Text`, `Trigger`, `Typewriter Speed`, and `TTS Profile` fields.
- Preview Message and sentence playback through existing Text To Speech behavior.
- Add sentences with emotions scoped by the selected TTS Profile.
- Confirm guest browsing is allowed while guest saves redirect to `account/sign-in.html`.
- Confirm referenced Messages cannot be deleted while they have sentence usage.

This PR is not part of the Game Crew cleanup batch. Previous dependency: none for PR_002. Next dependency: resolve the separate Game Crew guest seed ownership cleanup before running full seed integrity as a required gate.

## Requirement Checklist

PASS - Preserve current PR_002 Messages Creator Tool changes.
PASS - Do not modify guest `game-crew` seed files.
PASS - Do not modify `DbSeedIntegrity` for Game Crew in this PR.
PASS - Do not run or plan PR_003+ from this dirty branch.
PASS - Document Game Crew seed integrity failure as unrelated/out-of-scope.
PASS - Run only in-scope Messages validation and impacted Playwright.
PASS - Produce PR_002 artifacts.
PASS - Browser-owned product data was not introduced.
PASS - No silent JSON fallback was introduced.
PASS - No MEM DB/local-mem was introduced.
PASS - No unrelated cleanup.

## Changed File Inventory

- `dev/build/database/ddl/messages.sql`
- `dev/tests/dev-runtime/MessagesPublishValidation.test.mjs`
- `dev/tests/helpers/playwrightRepoServer.mjs`
- `dev/tests/playwright/tools/MessagesTool.spec.mjs`
- `src/dev-runtime/messages/messages-postgres-service.mjs`
- `toolbox/messages/index.html`
- `toolbox/messages/messages.js`
- `dev/reports/codex_changed_files.txt`
- `dev/reports/codex_review.diff`
- `dev/reports/PR_26180_BRAVO_002-complete-messages-creator-tool.md`

## DB/API Inventory

- `messages_records` DDL includes `speaker`, `trigger`, and `typewriterSpeed`.
- Messages Postgres service normalizes, validates, serializes, creates, and updates `speaker`, `trigger`, and `typewriterSpeed`.
- `typewriterSpeed` must be a number of 0 or greater.
- Messages write resources require authenticated API actors.
- Existing Text To Speech profile and Emotion Profile service contracts remain API-backed.
- Guest writes redirect to `account/sign-in.html` through the existing account route.

## Validation Lane Report

PASS - Scoped Node/API Messages validation:

```powershell
node --test dev/tests/tools/Text2SpeechShell.test.mjs dev/tests/tools/MessagesPlaybackSource.test.mjs dev/tests/dev-runtime/MessagesPublishValidation.test.mjs
```

Result: PASS, 21/21 tests.

PASS - Messages Playwright validation:

```powershell
npx playwright test --config dev/workspace/tmp/pr_26180_bravo_002.playwright.headless.config.cjs dev/tests/playwright/tools/MessagesTool.spec.mjs --project=playwright
```

Result: PASS, 6/6 tests.

PASS - Text To Speech Playwright validation:

```powershell
npx playwright test --config dev/workspace/tmp/pr_26180_bravo_002.playwright.headless.config.cjs dev/tests/playwright/tools/TextToSpeechFunctional.spec.mjs --project=playwright
```

Result: PASS, 4/4 tests.

INFO - A temporary ignored Playwright config under `dev/workspace/tmp` was used to run the repo's `playwright` project headlessly in this environment. The product/test delta does not depend on that generated file.

## Playwright Impacted Assessment

PASS - `dev/tests/playwright/tools/MessagesTool.spec.mjs` validates:

- table-first Message Studio structure
- Speaker, Text, Trigger, Typewriter Speed fields
- TTS Profile selection
- API-backed profile consumption
- sentence emotion filtering by selected profile
- referenced Message delete protection
- guest save redirect
- Creator-safe load failures

PASS - `dev/tests/playwright/tools/TextToSpeechFunctional.spec.mjs` validates existing Text To Speech behavior remains intact.

The Playwright repo helper was fixed so static files are served from the repository root instead of `dev/`.

## Manual Validation Notes

Recommended Product Owner manual validation:

1. Open Message Studio as an authenticated Creator.
2. Add a message with Speaker, Text, Trigger, Typewriter Speed, and TTS Profile.
3. Save and reload to confirm API/Postgres persistence.
4. Edit the same fields and confirm changes persist.
5. Add a sentence with a profile-scoped emotion and confirm playback.
6. Confirm guest can browse but Save redirects to `account/sign-in.html`.
7. Confirm referenced Message Delete remains blocked.

## Known Issues

- Full `DbSeedIntegrity` remains blocked outside PR_002 because `dev/build/database/seed/guest/game-crew.json` publishes `game-crew` while canonical inventory expects Game Crew under `users`.
- This PR intentionally does not clean up Game Crew guest seed JSON ownership.
- The Game Crew cleanup should be planned from clean `main` as a separate batch after PR_002 is clean, committed, and opened.

## ZIP Outcome

DELTA artifact:

`dev/workspace/zips/PR_26180_BRAVO_002-complete-messages-creator-tool_delta.zip`
