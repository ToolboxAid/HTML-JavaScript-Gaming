# BUILD_PR_LEVEL_10_6N_TOOL_UI_DOD_AUDIT

## Purpose
Validate the Tool UI Readiness Definition of Done against all game/sample-launched tools and report any missed required inputs, fields, controls, or readiness checks.

## Scope
Docs-first audit only.

Codex must inspect the current repo tool/sample/game launch flow and produce a validation report. Codex must not implement fixes in this PR.

## Mandatory Audit Questions

For every tool reachable from `games/index.html`, `samples/index.html`, or sample/game manifests, Codex must answer:

1. What data inputs are required?
2. What data inputs are optional?
3. What files are fetched?
4. What files are expected but not fetched?
5. What UI controls are visible?
6. What controls require loaded data?
7. What controls are initialized from hardcoded/default/demo values?
8. What controls can show success while required data is missing?
9. What diagnostics exist for request/fetch/load/classification?
10. What diagnostics are missing for UI control readiness?

## Required Tool Coverage

Codex must audit at least these areas if present in repo:

- Sprite Editor
- Palette Browser
- Animation / Sprite Animation Tool
- Tilemap / Map Editor
- Vector Map Editor
- Vector Asset Studio
- Replay / Event Tool
- Manifest / Data Flow Inspector
- Workspace Manager / Launcher Tool
- Game launch tiles
- Sample launch tiles

If Codex finds additional tools, include them in the report.

## Required Report Output

Create:

`docs/dev/reports/level_10_6n_tool_ui_dod_audit_report.md`

Report format:

```md
# Level 10.6N Tool UI DoD Audit Report

## Summary
- Tools audited:
- Missing required inputs found:
- Missing controls found:
- Controls using default/demo data:
- Palette contract violations:
- Recommended next PR:

## Tool: <tool id/name>

### Required inputs found
| Input | Source | Required? | Fetched? | Shape validated? | Notes |

### UI controls found
| Control | Required data | Bound to loaded data? | Empty/default risk? | Diagnostic exists? | Notes |

### Missing DoD fields or controls
- ...

### Contract violations
- ...

### Recommended fix scope
- Smallest next PR:
```

## Acceptance Criteria

- Report exists at `docs/dev/reports/level_10_6n_tool_ui_dod_audit_report.md`
- Report lists every discovered tool
- Report identifies missed fields or controls
- Report explicitly says whether sprite-editor requires and binds palette data to:
  - palette grid
  - Color 1
  - Color 2
  - active drawing color
  - sprite canvas
- Report explicitly says whether palette-browser still depends on any `*.palette-browser.json`
- No implementation code is changed
- No roadmap text is rewritten
- If roadmap is touched, only status marker progression is allowed
