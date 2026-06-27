# Validation Lane - PR_26179_OWNER_005-move-tests-to-dev

Status: PASS

## Commands

- `git diff --check HEAD -- .` - PASS
- `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package-json-ok')"` - PASS
- Targeted `node --check` on changed scripts and representative moved tests - PASS
- `node ./scripts/run-node-test-files.mjs dev/tests/dev-runtime/AdminNotesBoundary.test.mjs dev/tests/tools/DevConsoleIntegration.test.mjs dev/tests/shared/TimeFoundation.test.mjs` - PASS
- `npm run test:service:api` - PASS
- `npx playwright test --config=playwright.config.cjs --list` - PASS

## Notes

The broad all-moved-file syntax sweep timed out because this PR moves hundreds of test files. Targeted syntax checks and targeted execution were used as the validation lane.
