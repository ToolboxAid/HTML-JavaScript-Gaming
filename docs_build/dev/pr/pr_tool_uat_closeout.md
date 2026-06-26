# PR — Tool UAT Closeout

## Purpose

Close the tools UAT loop before any King of the Iceberg work continues.

This PR is tools-only. Do not create, modify, or advance King of the Iceberg layout/gameplay work.

---

## Scope

Validate and close UAT for the four target tools:

- Vector Map Editor
- Vector Asset Studio
- Sprite Editor
- State Inspector

---

## Required Inputs

Use the latest UAT/fix artifacts already in the workspace:

- `tmp/uat_failed_cases_rerun.json`
- `tmp/interactive_uat_report_4tools.json`
- `docs_build/dev/reports/PR_tool_uat_failure_fix_report.md`
- Any current tool smoke/UAT reports already produced

Do not create new King of the Iceberg artifacts.

---

## Required Closeout Report

Create:

```txt
docs_build/dev/reports/PR_tool_uat_closeout_report.md
```

The report must include:

1. Overall PASS/FAIL
2. PASS/FAIL per tool
3. Evidence files reviewed
4. Remaining issues, if any
5. Confirmation that no King of the Iceberg work was advanced
6. Confirmation that no `start_of_day` folders were changed
7. Confirmation that no sample game/runtime engine changes were made

---

## Tool Closeout Criteria

### Vector Map Editor

Must confirm:

- No hidden/default map auto-load
- No silent auto-selection
- Explicit empty/no-selection state
- Sample `1212` failed case remains passing
- Selection and clear-selection behavior remain visible

### Vector Asset Studio

Must confirm:

- Samples `0901`, `1204`, and `1208` failed cases remain passing
- Paint/fill/stroke controls are selection-gated
- Disabled controls explain why
- Invalid/incomplete state produces actionable message
- No silent palette/paint/stroke fallback behavior

### Sprite Editor

Must confirm:

- Invalid-state actionable message is visible
- No silent fallback sprite/sample loading
- Header remains single-line and consistent

### State Inspector

Must confirm:

- Remains passing
- Valid JSON formats
- Invalid JSON shows parse error
- Empty/missing state shows explicit empty-state message

---

## Testing Guidance

Avoid long full sample suites unless required.

Use targeted validation only:

- Review latest UAT JSON/report artifacts
- Rerun only failed-case checks if there is uncertainty
- Run `npm run test:launch-smoke -- --tools` only if needed for confidence
- Do not run the full samples test unless a touched file requires it

If no JavaScript files change, `node --check` is not required.

---

## Acceptance Criteria

- `docs_build/dev/reports/PR_tool_uat_closeout_report.md` exists.
- All four tools are marked PASS or remaining issues are explicitly documented.
- No King of the Iceberg work is advanced.
- No runtime game code is changed.
- No sample games are changed.
- No `start_of_day` folders are changed.
- Any remaining tool issue becomes a follow-up tool PR, not a game/layout PR.

---

## Out of Scope

- King of the Iceberg gameplay
- King of the Iceberg layout contract follow-up
- First playable map
- Tileset breakout
- Runtime engine changes
- New tool features
