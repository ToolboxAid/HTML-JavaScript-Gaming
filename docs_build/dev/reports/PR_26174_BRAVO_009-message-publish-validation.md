# PR_26174_BRAVO_009-message-publish-validation

## Branch Validation
- PASS: Current branch is `team/BRAVO/messages`.
- PASS: Work continued on the stacked Bravo branch.
- PASS: No merge was performed.
- PASS: No push to `main` was performed.
- PASS: `start_of_day` folders were not modified.

## Scope Summary
- Added server-owned Messages Local API publish validation at `/api/messages/publish-validation`.
- Added a Message Studio Publish Validation inspector panel with external JavaScript behavior.
- Added focused dev-runtime coverage for publish-ready and publish-blocked message/TTS configurations.
- Updated the Messages Playwright spec to cover the visible validation panel and successful validation flow.

## Requirement Checklist
- PASS: Missing message text is reported for Messages and Message Parts.
- PASS: Missing Emotion Profile is reported.
- PASS: Missing Voice Profile is reported.
- PASS: Broken Message, Emotion Profile, Voice Profile, and Event Action references are reported.
- PASS: Invalid provider assignment is reported; Browser Speech API is the only publish-ready provider.
- PASS: Publish validation returns `canPublish: false` and `valid: false` for invalid message/TTS configuration.
- PASS: Theme V2 classes and existing external JavaScript patterns are used.
- PASS: No inline styles, style blocks, inline handlers, or inline script blocks were added.
- PASS: No browser-owned authoritative product data was added.
- PASS: No browser-generated authoritative database keys were added.
- PASS: Local API / Local DB wording is preserved.
- PASS: API/runtime failure text is Creator-safe.

## Validation Lane Report
- PASS: `node --check src\dev-runtime\messages\messages-postgres-service.mjs`
- PASS: `node --check toolbox\messages\messages-api-client.js`
- PASS: `node --check toolbox\messages\messages.js`
- PASS: `node --check tests\dev-runtime\MessagesPublishValidation.test.mjs`
- PASS: `node --check tests\playwright\tools\MessagesTool.spec.mjs`
- PASS: HTML inline/style/script guard on `toolbox/messages/index.html`
- PASS: Ownership guard for `imageDataUrl`, browser-owned wording, `localStorage`, and `sessionStorage`
- PASS: `node --test tests\dev-runtime\MessagesPublishValidation.test.mjs`
- PASS: `git diff --check` for PR_009 touched files, with line-ending warnings only
- BLOCKED: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --project=playwright`
  - Blocker: Playwright Chromium executable is not installed in the local `ms-playwright` cache.
- BLOCKED: `npm run test:workspace-v2`
  - Blocker: Same missing Playwright Chromium executable.

## Manual Validation Notes
- Verified the Messages tool has a visible Publish Validation panel with `Run Validation`, status, and issue list.
- Verified validation result rendering supports Not checked, Ready, and Blocked states.
- Verified validation failures are Creator-safe and do not expose server or database internals.
- Browser visual/manual validation still needs a local Playwright browser install before the Playwright lane can launch.

## Reports And Package
- Shared diff: `docs_build/dev/reports/codex_review.diff`
- Changed files: `docs_build/dev/reports/codex_changed_files.txt`
- PR report: `docs_build/dev/reports/PR_26174_BRAVO_009-message-publish-validation.md`
- Delta ZIP: `tmp/PR_26174_BRAVO_009-message-publish-validation_delta.zip`
