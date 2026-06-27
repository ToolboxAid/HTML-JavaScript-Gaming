# PR_26154_031-033 Remaining Cleanup Report

## Remaining Candidates

These items were not moved or deleted because they are ambiguous, historical, or outside this stacked PR scope.

| Item | Status | Reason |
| --- | --- | --- |
| `toolbox/toolRegistry.js` | Ambiguous legacy registry | It still references `archive/v1-v2/tools/` and `archive/v1-v2/samples/`, but no active page/import path in this PR proved it is safe to delete. |
| `toolbox/renderToolsIndex.js` | Ambiguous legacy renderer | It references `archive/v1-v2/samples/` and may belong with the legacy registry cleanup, but was not touched without a clear active dependency answer. |
| `toolbox/shared/preview/*.html` | Ambiguous preview tooling | Still references `archive/v1-v2/samples/`; requires a dedicated preview-generator/tooling ownership PR. |
| `toolbox/dev/*.baseline.json` | Ambiguous guard baselines | Baselines preserve `archive/v1-v2/samples/` evidence and may still support active guard scripts. |
| `tests/fixtures/v2-tools/` | Deprecated-looking fixture archive | Deprecated tests were removed, but fixture deletion was not required by this PR and may need a separate fixture inventory. |
| `tests/validation/samples.*.json` | Historical validation data | Retained because active contract tests still inspect schema/report boundaries. |
| `docs_build/dev/roadmaps/*` and archived docs | Historical references | Old path references are preserved history, not active runtime/page wiring. |
| `archive/v1-v2/games/index.html` and `archive/v1-v2/samples/index.html` | Deprecated playable references | Excluded by request; still preserve old playable/reference access. |

## Confirmed Clean

- No active public/root or toolbox page references `assets/theme/v2`.
- No active public/root or toolbox page references `assets/theme-v2/css/styles.css`.
- No active public/root or toolbox page references `favicon.ico`.
- No active public `tools/` routes remain.
- Active toolbox template audit remains clean.
- Active toolbox nav coverage remains complete.

## Deferred Work

- Decide whether `toolbox/toolRegistry.js`, `toolbox/renderToolsIndex.js`, and `toolbox/shared/preview/` should move to `archive/v1-v2/tools/` or be replaced by a current active toolbox registry.
- Inventory and retire `tests/fixtures/v2-tools/` if no future active test plan needs those payloads.
- Separate historical docs cleanup from runtime cleanup so old path history is not mistaken for active wiring.
