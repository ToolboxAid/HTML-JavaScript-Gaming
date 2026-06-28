# PR_26171_BETA_073-message-tts-table-ui-correction Validation Report

Generated: 2026-06-20T23:06:25.711Z
Team ownership: Bravo
Branch: pr/26171-BETA-073-message-tts-table-ui-correction

## Required Validation

- PASS: `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs`
  - 3 passed. Covers TTS page behavior, one-line summary row, toolbox registration path, and unavailable speech error.
- PASS: `node --test tests/tools/Text2SpeechShell.test.mjs`
  - 4 passed. Covers TTS shell/profile contract.
- PASS: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --trace=off`
  - 2 passed. Covers Messages parent/child table, inline add/edit rows, TTS Profile dropdown compatibility, playback, and unavailable audio error.
- PASS: `npm run test:workspace-v2`
  - Legacy command name; user-facing product language is Project Workspace/Game Hub. Final rerun passed 5 workspace-contract tests.
- PASS: `git diff --check`
  - No whitespace errors; Git emitted line-ending normalization warnings only.

## Additional Focused Sanity Validation

- PASS: `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs -g "toolbox index shows wireframe" --trace=off`
  - 1 passed after updating expected toolbox counts for Text To Speech moving from planned/missing metadata into active beta registration.

## Notes

- Initial Message Studio validation exposed a missing Add Message control on empty tables; fixed and reran to PASS.
- Initial Project Workspace validation exposed stale toolbox count expectations; fixed and reran to PASS.
- Node emitted experimental SQLite warnings during relevant test runs; tests passed.
