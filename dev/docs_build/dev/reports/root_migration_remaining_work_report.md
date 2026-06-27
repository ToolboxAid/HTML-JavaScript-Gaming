# PR_26154_017 Root Migration Remaining Work Report

Task: `PR_26154_017-root-migration-closeout-bundle`

## Remaining Cleanup Candidates

These items were identified during closeout but intentionally not moved in this PR:

| Candidate | Reason Deferred |
| --- | --- |
| `toolbox/_tool_template-v2/` | Still present with an `index.html`; confirm whether it is an active template surface or should move to deprecated template ownership. |
| `toolbox/dev/`, `toolbox/shared/`, `toolbox/schemas/` | Active support folders under `toolbox/`, not user-facing tool surfaces. Move only if a new support-code ownership target is approved. |
| `toolbox/renderToolsIndex.js` and `toolbox/toolRegistry.js` | Active root-level tool support files. Consolidation would require a separate import/launcher audit. |
| `games/assets/` | Active game support assets, not a game category page. No move recommended without a new assets ownership PR. |
| `docs_build/` historical archives and reports | Historical records still mention old paths by design; not active runtime references. |
| `archive/v1-v2/tools/`, `archive/v1-v2/games/`, `archive/v1-v2/samples/` | Deprecated reference/playable areas preserved by request. |

## Confirmed Closed

- No active `GameFoundryStudio/` references.
- No active `src/engine/theme/` references.
- No active `assets/theme/v1/` references.
- No active `favicon.ico` references.
- No active deprecated root `samples/` references.
- `/favicon.svg` is the canonical active site icon.
- `LICENSE` is proprietary/restrictive.

## Notes

- `archive/v1-v2/samples/` references remain where they preserve deprecated sample access or validation routing.
- `toolbox/shared/samples/` and `toolbox/schemas/samples/` are active support/schema namespaces, not deprecated root sample paths.
