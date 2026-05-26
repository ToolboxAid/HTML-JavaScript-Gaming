# Lane Compilation Report

Generated: 2026-05-26
PR: PR_26146_028-zero-browser-preflight-and-lane-compilation

## Summary

Status: PASS
Lane compilation failures: none
Runtime discovery failures prevented: none needed

## Compiled Lane Graph

| Lane | Status | Runtime Execution | Targets | Reason |
| --- | --- | --- | --- | --- |
| workspace-contract | PASS | Skipped | `npm run test:workspace-v2` | Lane definition compiles and fixture path resolves; not selected for affected runtime validation. |
| tool-runtime | PASS | Executed | `tests/playwright/tools/AssetManagerV2.spec.mjs`; `tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs`; `tests/playwright/tools/CollisionInspectorV2.spec.mjs` | Selected affected lane. Targets are inside `tests/playwright/tools`; grep pipe is Node-argv safe. |
| integration | PASS | Executed | `tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs` | Selected affected lane. Target is inside `tests/playwright/integration`. |
| engine-src | PASS | Skipped | node engine/src test files | Lane definition compiles; not affected by this PR. |
| samples | PASS | Skipped | node samples test files | Lane definition compiles; samples lane remains on-request and sample scope was not active. |

## Compilation Rules

- Unknown lanes fail before runtime.
- Missing targets, fixtures, or helper imports fail before runtime.
- Playwright targets must stay inside the owning lane directory.
- Shell-sensitive grep values must use the Node CLI argv path.
- Deterministic lane-definition failures do not trigger fallback reruns or full lane escalation.

## Runtime Savings Observations

- Lane graph resolution happens before browser startup.
- Invalid targeted lane setup cannot fall through into runtime discovery.
- Tool-runtime combines Preview Generator V2 and Collision Inspector V2 into one Playwright CLI invocation.
- Workspace V2 was not scheduled for this PR.
