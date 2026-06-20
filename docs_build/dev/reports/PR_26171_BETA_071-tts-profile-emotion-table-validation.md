# PR_26171_BETA_071-tts-profile-emotion-table Validation Report

Generated: 2026-06-20T22:26:42.301Z
Team ownership: BETA
Branch: pr/26171-BETA-071-tts-profile-emotion-table

## Results

- PASS: `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs`
  - 2 passed.
- PASS: `node --test tests/tools/Text2SpeechShell.test.mjs`
  - 4 passed.
- PASS: `npx playwright test tests/playwright/tools/MessagesTool.spec.mjs --trace=off`
  - 2 passed.
- PASS: `npm run test:workspace-v2`
  - 5 workspace-contract Playwright tests passed.
- PASS: `git diff --check`
  - No whitespace errors reported.

## Notes

- The Message Studio compatibility check used `--trace=off` to avoid the known trace artifact writer issue while keeping the browser assertions unchanged.
- Node emitted experimental SQLite warnings during Playwright runs; tests still passed.
- Workspace validation refreshed the standard generated validation report snapshots under `docs_build/dev/reports`.
