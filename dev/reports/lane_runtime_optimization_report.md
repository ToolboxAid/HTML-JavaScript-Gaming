# Lane Runtime Optimization Report

Generated: 2026-06-28T14:20:34.627Z
Status: PASS

## Runtime Cost Summary

Reused runtime sessions: 0
Reused lane snapshots: 1
Reused warm-start lanes: 1
Reused dependency hydration: 1
Prevented graph rebuilds: 1
Prevented redundant initialization: 1
Prevented redundant browser launches: 0
Prevented redundant lane execution: 14
Baseline Playwright/browser launches: 1
Scheduled Playwright/browser launches: 1

## Scheduled Lane Order

1. tool-display-mode

## Scheduling Blockers

No zero-browser, compilation, or dependency blockers were found.

## Lane Plans

| Lane | Snapshot | Warm Start | Hydration | Baseline Browser Launches | Scheduled Browser Launches | Commands | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| tool-display-mode | REUSED | REUSED | REUSED | 1 | 1 | C:\nvm4w\nodejs\node.exe "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming - 1\\node_modules\\@playwright\\test\\cli.js" test dev/tests/playwright/tools/ToolDisplayModeSingleLineSummary.spec.mjs --config=dev/config/playwright.config.cjs --project=playwright --workers=1 --reporter=list | Tool Display Mode validates the single-line summary contract, direct summary children, registry-owned badge/tool art, fullscreen/exit icon swap, and removal of the deprecated body/navigation row without exercising unrelated toolbox routes. |

## Runtime Savings Observations

- Zero-browser preflight, lane compilation, and dependency validation run once per targeted runner invocation.
- Reused lane snapshots avoid rebuilding identical targeted execution graphs.
- Validated warm-start lanes reuse deterministic initialization state when manifest and dependency hashes are unchanged.
- Reused dependency hydration avoids repeated helper resolution and fixture ownership traversal for compatible targeted runs.
- Compatible Playwright specs with matching options are kept in shared CLI invocations to avoid redundant browser startup.
- Unselected lanes are not scheduled after isolated targeted lane failures.
- Workspace V2 and samples lanes are not escalated unless explicitly selected.
