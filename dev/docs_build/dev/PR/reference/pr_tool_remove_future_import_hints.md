# PR — Remove Future Import Hint Fields

## Purpose
Remove confusing future/advisory import hint fields from tool manifests and import workflows when they are not required for current tool operation.

This PR is tools-cleanup only.

---

## Problem
Fields such as `importDestination` and `importName` are future/advisory hints for a non-destructive import plan.

That creates confusion because they can reference:
- folders that do not exist
- filenames that do not exist
- future artifacts not currently present on disk

This conflicts with current tool UX rules:
- no silent assumptions
- no hidden future data
- no non-required fields that look like missing/broken data

---

## Decision
If a field is not required for current tool operation, remove it.

Do not keep future intent fields just because a later import workflow might use them.

---

## Target Fields
Audit and remove non-required advisory fields such as:

- `importDestination`
- `importName`
- `destinationFolder`
- future-only import plan defaults
- any field whose only purpose is to prefill a future manual/advisory plan

Only keep fields that are required to load, display, edit, validate, or export current assets/layouts.

---

## Scope
Search current tool/sample metadata for future/advisory import hints.

Likely areas:
- Asset Browser metadata
- Import Hub metadata
- tool launch presets
- sample tool manifests
- active-project manifest tool sections
- docs that describe these fields as expected behavior

Do not modify:
- King of the Iceberg gameplay
- runtime game engine files
- `start_of_day` folders

Sample metadata may be changed only when removing confusing unused future-hint fields.

---

## Required Behavior After Removal
Asset Browser / Import Hub must not show or rely on future-only defaults.

If a user wants to import/create an asset, the tool must require explicit current input at the time of action.

If a destination is required for an actual import action:
- ask/show required field then
- validate it then
- show actionable error if missing

Do not predeclare future paths/filenames in sample metadata.

---

## Validation Rules
After cleanup:

- No `importDestination` remains unless proven required for current execution.
- No `importName` remains unless proven required for current execution.
- No generated UI explains non-existing future paths as expected behavior.
- Asset Browser empty/missing states remain explicit.
- Sample `0204` and `1505` do not rely on future import hints.
- No silent fallback data is introduced.

---

## Acceptance Criteria
- Future/advisory import hint fields are removed wherever not required.
- Remaining import-related fields are documented as required current inputs.
- Any removed field does not break tool launch.
- Asset Browser still reports empty/missing/invalid data clearly.
- Import Hub/Asset Browser do not imply future non-existing files are normal data.
- Targeted validation passes.
- No `start_of_day` changes.
- No runtime game engine changes.

---

## Targeted Validation
Do not run full sample suite.

Run targeted checks only:

```powershell
node --check "toolbox/Asset Browser/main.js"
```

If Import Hub JS changes, run `node --check` on that file too.

Run targeted browser/sample checks:
- Asset Browser sample `0204`
- Asset Browser sample `1505`
- Any Import Hub sample touched by the cleanup

Search validation:

```powershell
rg "importDestination|importName|destinationFolder" tools samples docs
```

Remaining hits must be either:
- required current behavior
- migration/cleanup documentation
- explicit tests

---

## Required Report
Create:

```txt
dev/docs_build/dev/reports/PR_tool_remove_future_import_hints_report.md
```

Include:
- PASS/FAIL
- changed files
- fields removed
- remaining search hits and why they remain
- targeted validation results
- confirmation no `start_of_day` changes
- confirmation no runtime game engine changes
