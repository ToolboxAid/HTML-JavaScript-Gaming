# Lane Runtime Optimization Report

Generated: 2026-05-26T22:17:10.904Z
Status: PASS

## Runtime Cost Summary

Reused runtime sessions: 1
Reused lane snapshots: 0
Reused warm-start lanes: 0
Reused dependency hydration: 0
Prevented graph rebuilds: 0
Prevented redundant initialization: 0
Prevented redundant browser launches: 1
Prevented redundant lane execution: 5
Baseline Playwright/browser launches: 2
Scheduled Playwright/browser launches: 1

## Scheduled Lane Order

1. integration

## Scheduling Blockers

No zero-browser, compilation, or dependency blockers were found.

## Lane Plans

| Lane | Snapshot | Warm Start | Hydration | Baseline Browser Launches | Scheduled Browser Launches | Commands | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| integration | INVALIDATED | INVALIDATED | INVALIDATED | 2 | 1 | C:\nvm4w\nodejs\node.exe C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\node_modules\@playwright\test\cli.js test tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs tests/playwright/integration/ToolsIndexFirstClassToolRegistration.spec.mjs --project=playwright --workers=1 --reporter=list | Integration lane validates explicit cross-surface handoffs only; broad all-game thumbnail coverage is outside the default targeted lane. |

## Runtime Savings Observations

- Zero-browser preflight, lane compilation, and dependency validation run once per targeted runner invocation.
- Reused lane snapshots avoid rebuilding identical targeted execution graphs.
- Validated warm-start lanes reuse deterministic initialization state when manifest and dependency hashes are unchanged.
- Reused dependency hydration avoids repeated helper resolution and fixture ownership traversal for compatible targeted runs.
- Compatible Playwright specs with matching options are kept in shared CLI invocations to avoid redundant browser startup.
- Unselected lanes are not scheduled after isolated targeted lane failures.
- Workspace V2 and samples lanes are not escalated unless explicitly selected.
