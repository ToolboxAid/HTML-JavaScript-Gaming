# PR_26172_CHARLIE_014 Low-Risk Tool Migration 1

## Purpose

Migrate the safest single tool from `PR_26172_CHARLIE_013-tool-js-css-canonical-migration-audit`.

Selected tool:

- Text To Speech

## Scope Summary

| Requirement | Status | Evidence |
| --- | --- | --- |
| Move JS to canonical structure | PASS | `toolbox/text-to-speech/text2speech.js` moved to `assets/toolbox/text-to-speech/js/index.js`. |
| Move CSS only if required | PASS | No Text To Speech tool-specific CSS sidecar exists; Theme V2 CSS remains unchanged. |
| Preserve behavior | PASS | Targeted Text To Speech Node tests passed; page-level Playwright behavior passed except for the pre-existing Game Journey metrics failure described below. |
| Update references | PASS | Tool page module script and direct Text To Speech test import now use the canonical path. |
| Targeted validation only | PASS | Ran targeted Node, guardrail, and Text To Speech Playwright validation only. |

## Files Changed

| File | Change |
| --- | --- |
| `assets/toolbox/text-to-speech/js/index.js` | Added via move from `toolbox/text-to-speech/text2speech.js`; import paths adjusted for new canonical depth. |
| `toolbox/text-to-speech/index.html` | Updated module script source to canonical JS path. |
| `tests/tools/Text2SpeechShell.test.mjs` | Updated direct import to canonical JS path. |
| `scripts/validate-canonical-repository-structure.mjs` | Removed retired Text To Speech legacy JS exception. |

## Reference Check

Active references to the retired module path were searched with:

```text
rg -n "toolbox/text-to-speech/text2speech\.js|text-to-speech/text2speech\.js|text2speech\.js" . --glob "!archive/**" --glob "!docs_build/dev/reports/**" --glob "!tmp/**" --glob "!node_modules/**"
```

Result:

- PASS for active runtime/test references.
- One historical `docs_build/pr/PR_26171_069-message-tts-profile-contract-alignment/BUILD_PR.md` reference remains intentionally unchanged.

## Validation Results

| Command | Status | Notes |
| --- | --- | --- |
| `node --check assets/toolbox/text-to-speech/js/index.js` | PASS | Syntax check for moved module. |
| `node --check scripts/validate-canonical-repository-structure.mjs` | PASS | Syntax check for updated guardrail. |
| `node --check tests/tools/Text2SpeechShell.test.mjs` | PASS | Syntax check for updated test import. |
| `node scripts/run-node-test-files.mjs tests/tools/Text2SpeechShell.test.mjs` | PASS | 4/4 Text To Speech targeted Node tests passed. |
| `npm run validate:canonical-structure` | PASS | Blocking violations: 0; approved legacy exceptions: 494. |
| `npx playwright test tests/playwright/tools/TextToSpeechFunctional.spec.mjs` | PARTIAL | 2/3 passed. The failing registration test reached the Text To Speech page but failed because the toolbox index emitted the known pre-existing `500 /api/game-journey/completion-metrics` request documented by PR_006A. |
| `git diff --check` | PASS | No whitespace errors. |

## Playwright Failure Classification

Root cause:

- The failed Playwright assertion records `500 http://127.0.0.1:<port>/api/game-journey/completion-metrics`.

Whether PR_014 caused it:

- No. The failure matches the previously documented PR_006A validation failure from legacy SQLite preservation protection.
- The Text To Speech page load and browser speech behavior tests passed.
- The failed test confirms the Text To Speech toolbox registration path still navigates to `/toolbox/text-to-speech/index.html`.

Action:

- Do not expand this PR into Game Journey API work.
- Continue stack because this migration did not introduce the known failure.

## Branch Validation

| Check | Status | Evidence |
| --- | --- | --- |
| Current branch | PASS | `PR_26172_CHARLIE_repository-compliance-stack`. |
| Worktree clean before PR_014 edits | PASS | PR_013 was committed and pushed before this scope. |
| Local/origin sync before PR_014 edits | PASS | `0 0` after PR_013 push. |
| Main merge avoided | PASS | No merge to `main` was performed. |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Use safest tool from PR_013 | PASS | Text To Speech ranked #1. |
| Move JS to canonical structure | PASS | Canonical path added. |
| Move CSS only if required | PASS | No CSS move required. |
| Preserve behavior | PASS | Targeted TTS behavior passed; unrelated known failure documented. |
| Update references | PASS | HTML/test references updated. |
| Targeted validation only | PASS | No samples or full smoke run. |
| Produce ZIP artifact | PASS | `tmp/PR_26172_CHARLIE_014-low-risk-tool-migration-1_delta.zip` generated. |

## Manual Validation Notes

- This PR removes one approved legacy JS exception from the guardrail.
- The Text To Speech module remains the same executable implementation after the move, except for relative import path depth.
- The known Game Journey metrics 500 remains outside Charlie PR_014 scope.
