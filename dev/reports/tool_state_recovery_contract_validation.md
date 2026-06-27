# Tool State Recovery Contract Validation

PR: PR_26152_068-tool-state-recovery-contract

Date: 2026-06-02

## Scope

Extended the reusable Tool State contract with recovery behavior as contract data and pure contract transition helpers.

No database implementation, authentication implementation, runtime/UI changes, page changes, CSS changes, HTML changes, or dependency changes were made.

## Files Validated

- `src/shared/contracts/toolStateContract.js`
- `tests/fixtures/tool-states/tool-state-scenarios.json`
- `tests/shared/ToolStateContract.test.mjs`
- `src/shared/contracts/projectContract.js`
- `tests/shared/ProjectContract.test.mjs`
- `src/shared/contracts/identityPermissionsContract.js`
- `tests/shared/IdentityPermissionsContract.test.mjs`

## Validation Lanes

- Lanes executed: contract - Tool State recovery rules, startup choices, Resume/Open behavior, discard, promotion, timestamp/tool/project validation, and saved-state separation.
- Compatibility executed: project contract and identity/permissions contract - confirms recovery remains compatible with approved project and identity contract layers.
- Lanes skipped: runtime, integration, engine, samples, recovery/UAT - this PR does not change runtime behavior, handoff contracts, engine code, samples, or UAT surfaces.
- Samples decision: SKIP because this PR does not touch samples or sample JSON.
- Playwright impacted: No. This PR adds shared contract data, fixtures, and targeted node tests only.

## Commands

```text
node ./scripts/run-node-test-files.mjs tests/shared/ToolStateContract.test.mjs tests/shared/ProjectContract.test.mjs tests/shared/IdentityPermissionsContract.test.mjs
```

Result:

```text
PASS tests/shared/ToolStateContract.test.mjs
PASS tests/shared/ProjectContract.test.mjs
PASS tests/shared/IdentityPermissionsContract.test.mjs

3/3 targeted node test file(s) passed.
```

```text
git diff --check -- src/shared/contracts/toolStateContract.js tests/shared/ToolStateContract.test.mjs tests/fixtures/tool-states/tool-state-scenarios.json
```

Result:

```text
PASS - no whitespace errors reported.
WARN - Git reported LF-to-CRLF working-copy warnings for edited fixture/test files.
```

## Contract Coverage

- Recovery is separate from Saved State: PASS.
- Recovery is temporary and user-selected: PASS.
- Recovery is never auto-loaded or auto-applied: PASS.
- Startup choices show Resume and Open when recovery exists: PASS.
- Resume loads Recovery State: PASS.
- Open loads Saved State: PASS.
- Recovery does not overwrite Saved State automatically: PASS.
- Recovery survives Open action: PASS.
- Recovery can be discarded: PASS.
- Recovery can be promoted to Saved State: PASS.
- Recovery must show timestamp: PASS.
- Recovery must identify tool and project: PASS.
- Valid recovery exists/newer/older/without saved state fixtures pass: PASS.
- Invalid recovery without owner/tool type or linked to wrong project fixtures fail with expected codes: PASS.

## Scope Guard

- No database files changed.
- No authentication files changed.
- No runtime/UI files changed.
- No CSS files changed.
- No HTML files changed.
- No dependencies were added.
- No samples tests were run.
- No repo-wide tests were run.
