# Persistent Lane Manifest Report

Generated: 2026-06-28T14:20:34.629Z
Status: PASS
Manifest directory: dev/workspace/generated/lane_manifests

## Summary

Reused manifests: 1
Invalidated manifests: 0
Generated manifests: 0
Prevented discovery scans: 1

## Manifest Events

| Lane | Status | Manifest Path | Input Hash | Manifest Hash | Reason |
| --- | --- | --- | --- | --- | --- |
| tool-display-mode | REUSED | dev/workspace/generated/lane_manifests/tool-display-mode.json | 95c8372105592543 | 9f823d041166f7f6 | Inputs unchanged; persisted lane manifest reused. |

## Persisted Manifest Files

| Lane | Ownership | Source | Tests | Helpers | Fixtures | Dependency Graph Hash | Manifest Hash |
| --- | --- | --- | --- | --- | --- | --- | --- |
| tool-display-mode | tools | persistent | dev/tests/playwright/tools/ToolDisplayModeSingleLineSummary.spec.mjs | dev/tests/helpers/playwrightRepoServer.mjs; dev/tests/helpers/playwrightStorageIsolation.mjs; dev/tests/helpers/playwrightV8CoverageReporter.mjs; dev/tests/helpers/workspaceV2CoverageReporter.mjs | none | 6de254babab8aecd | 9f823d041166f7f6 |

## Fast-Fail Enforcement

- Persisted manifest metadata must match current lane ownership before reuse.
- Lane definition, dependency graph, helper, fixture, import, and targeted-file hashes invalidate stale manifests.
- Invalidated manifests are regenerated deterministically before Playwright/browser launch.
- Persisted manifests never trigger fallback broad discovery.
