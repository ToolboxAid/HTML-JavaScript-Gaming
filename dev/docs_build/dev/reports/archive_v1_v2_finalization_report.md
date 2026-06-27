# Archive V1/V2 Finalization Report

Task: `PR_26154_046-archive-v1-v2-finalization`

## Summary

Confirmed the legacy reference material root is consolidated under `archive/v1-v2/`:

- `archive/v1-v2/tools/`
- `archive/v1-v2/games/`
- `archive/v1-v2/samples/`

The former root folders `old-tools/`, `old_games/`, and `old_samples/` are absent.

## Changes

- Added the newly retired Toolbox reference pages under `archive/v1-v2/tools/toolbox-reduction-reference/`.
- Rewired hidden legacy Toolbox registry entries from `../old-tools/` and `../old_samples/` to `../archive/v1-v2/tools/` and `../archive/v1-v2/samples/`.
- Rewired `toolbox/renderToolsIndex.js` sample metadata paths from `/old_samples/` to `/archive/v1-v2/samples/`.
- Updated docs_build guard scripts and baselines that still encoded root `old_samples` / `old_games` paths to use `archive/v1-v2/samples` and `archive/v1-v2/games`.
- Updated selected validation utilities so archive game/sample paths are recognized as deprecated reference ownership.

## Archive State

| Path | State |
| --- | --- |
| `archive/v1-v2/tools/` | Present; contains deprecated tool/reference material. |
| `archive/v1-v2/games/` | Present; contains deprecated playable reference games. |
| `archive/v1-v2/samples/` | Present; contains deprecated sample references. |
| `old-tools/` | Absent. |
| `old_games/` | Absent. |
| `old_samples/` | Absent. |
| `docs_build/archive/` | Absent. |
| `docs_build/dev/archive/` | Absent. |

## Remaining Archive Policy Items

- `archive/v1-v2/docs_build/archive/tools/SpriteEditor_old_keep/` remains in its existing policy location. It is reported as an archive-placement policy candidate rather than moved in this PR.
- Some compatibility code still accepts historical `old_games` / `old_samples` strings as legacy input. Those are retained as compatibility aliases and should be addressed in a dedicated runtime/path-convention PR.

## Validation

- PASS: archive root existence checks for `archive/v1-v2/tools`, `archive/v1-v2/games`, and `archive/v1-v2/samples`.
- PASS: root absence checks for `old-tools`, `old_games`, and `old_samples`.
- PASS: `node docs_build/dev/toolbox/checkSharedExtractionGuard.mjs`
- PASS: changed JS syntax checks for touched archive-routing scripts.
- INFO: `docs_build/dev/toolbox/checkPhase24CloseoutExecutionGuard.mjs` now resolves archive paths from repo root; its roadmap hash lock is stale independently of this PR and was not used as a required gate.

No tests were run against `archive/v1-v2/`.
