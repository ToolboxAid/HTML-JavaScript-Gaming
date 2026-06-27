# PR_26172_CHARLIE_042-canonical-tool-worker-placement

## Summary

PASS: The Assets upload worker was moved from the remaining legacy toolbox sidecar path into the canonical tool-local worker path:

- From: `toolbox/assets/assets-upload-worker.js`
- To: `assets/toolbox/assets/js/assets-upload-worker.js`

The Assets tool entrypoint now constructs the module worker with `new URL("./assets-upload-worker.js", import.meta.url)`.

## Canonical Worker Rule Applied

PASS: Tool-local web workers may use:

`assets/toolbox/{tool-name}/js/{worker-name}.js`

For guardrail enforcement, the implemented validator allows `assets/toolbox/{tool-name}/js/*-worker.js` as a canonical tool-local worker sidecar while keeping general helper files outside `index.js` disallowed.

## Files Reviewed

- `docs_build/dev/ProjectInstructions/`
- `project-instructions/addendums/canonical-repository-structure.md`
- `project-instructions/addendums/legacy-migration-policy.md`
- `assets/toolbox/assets/js/index.js`
- `toolbox/assets/assets-upload-worker.js`
- `scripts/validate-canonical-repository-structure.mjs`
- `tests/regression/CanonicalRepositoryStructureGuardrail.test.mjs`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`

## Files Changed

- `assets/toolbox/assets/js/assets-upload-worker.js`
- `assets/toolbox/assets/js/index.js`
- `scripts/validate-canonical-repository-structure.mjs`
- `tests/regression/CanonicalRepositoryStructureGuardrail.test.mjs`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `toolbox/assets/assets-upload-worker.js` removed by move

## Validation Commands

- PASS: `node --check assets/toolbox/assets/js/index.js`
- PASS: `node --check assets/toolbox/assets/js/assets-upload-worker.js`
- PASS: `git diff --check`
- PASS: `npm run validate:canonical-structure`
- PASS: `node --test tests/regression/CanonicalRepositoryStructureGuardrail.test.mjs`
- PASS: Targeted in-browser worker load probe:
  - loaded `/toolbox/assets/index.html`
  - fetched `/assets/toolbox/assets/js/assets-upload-worker.js`
  - constructed `new Worker("/assets/toolbox/assets/js/assets-upload-worker.js", { type: "module" })`
  - processed a 3-byte file to worker completion

## Diagnostic Validation Note

- FAIL, documented blocker: `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs -g "Assets worker keeps UI responsive"` still reaches the worker and then reports `Batch upload complete: 0 written, 1 failed, 0 skipped, 0 warnings.`
- This matches the previously documented Assets upload persistence/API blocker and is not evidence that the worker path failed. The focused worker-load probe confirms the moved worker loads and completes file processing.

## Branch Validation

- PASS: Current branch was `PR_26172_CHARLIE_repository-compliance-stack`.
- PASS: Worktree was clean before PR_042 edits.
- PASS: Local/origin sync was `0 0` before PR_042 edits.
- PASS: Scope stayed within Team Charlie repository compliance and canonical structure work.

## Requirement Checklist

- PASS: Reviewed ProjectInstructions.
- PASS: Reviewed canonical repository structure governance.
- PASS: Defined safe canonical tool-local worker path.
- PASS: Applied path only to Assets upload worker.
- PASS: Updated Worker URL construction.
- PASS: Preserved worker behavior.
- PASS: No feature changes.
- PASS: Updated canonical guardrail and targeted guardrail test.
- PASS: Confirmed old active worker path is no longer referenced outside historical reports.
- PASS: Created ZIP artifact under `tmp/`.

## Manual Validation Notes

- The upload worker is still an Assets-only file processing worker.
- The worker move does not change upload payload shape, file chunking, progress messages, or completion/error message schema.
- Browser environment validation was not run for PR_042 because browser environment validation rules were not changed.

## Recommendation

Continue to PR_043 final Charlie compliance re-audit. The only retained upload blocker is the pre-existing Assets persistence/API write failure documented in earlier Charlie reports.
