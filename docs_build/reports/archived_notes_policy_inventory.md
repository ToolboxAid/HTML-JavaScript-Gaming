# Archived Notes Policy Inventory

Generated: 2026-04-12
Scope: `docs_build/archive/` policy surface only (non-destructive, docs-only lane).

## Source-Of-Truth Baseline (Existing Cleanup Evidence)
- `docs_build/reports/cleanup_live_reference_inventory.txt` (Target 4):
  - Exact path: `docs_build/archive/`
  - Exists: yes
  - Assessment: `live-reference`
  - Notes: archive location is active/documented; policy item still incomplete.
- `docs/reference/features/docs-system/move-history-preserved.md`:
  - Target row: ``docs_build/archive/` archived-notes policy``
  - Proposed classification: `keep`
  - Recommended future scope: policy-definition PR.

## 1) Path Existence And Archive Contents
- `docs_build/archive/` exists: **yes**
- Recursive file count under `docs_build/archive/`: **446**
- Recursive directory count under `docs_build/archive/`: **5**

Exact directories under `docs_build/archive/`:
- `docs_build/archive/dev-ops`
- `docs_build/archive/generated-reports`
- `docs_build/archive/pr`
- `docs_build/archive/generated-reports/dev-reports`
- `docs_build/archive/pr/legacy-pr-history`

Exact file inventory command used:
```powershell
rg --files docs_build/archive
```

## 2) Active References To `docs_build/archive/`
Reference scan command used:
```powershell
rg -n "docs_build/archive/" docs tools src games samples tests --glob "!docs_build/archive/**" --glob "!**/node_modules/**"
```

Unique active consumer files found:
- `docs/reference/root/README.md`
- `docs/reference/root/repo-directory-structure.md`
- `docs/reference/root/getting-started.md`
- `docs/reference/root/review-checklist.md`
- `docs/reference/architecture-standards/architecture/repo-operating-model.md`
- `docs/reference/architecture-standards/architecture/engine-api-boundary.md`
- `docs_build/operations/dev/README.md`
- `docs_build/operations/dev/paths.md`
- `docs_build/operations/dev/file_tree.txt`
- `docs_build/operations/dev/codex_commands.md`
- `docs_build/operations/dev/validation_checklist.txt`
- `docs_build/reports/README.md`
- `docs_build/reports/cleanup_live_reference_inventory.txt`
- `docs/reference/features/docs-system/move-history-preserved.md`
- `docs_build/reports/BUILD_PR_REPO_CLEANUP_AND_ROADMAP_UPDATE_report.md`
- `docs_build/reports/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_1_report.md`
- `docs_build/reports/cleanup_execution_guard.md`
- `docs_build/reports/cleanup_target_enforcement_map.md`
- `docs_build/reports/cleanup_target_normalization_report.md`
- `docs_build/reports/templates_validation_guard.md`
- `docs/reference/features/docs-system/move-history-preserved.md`
- `docs_build/pr/PLAN_PR_DOCS_ARCHIVE_CLEANUP.md`
- `docs_build/pr/BUILD_PR_DOCS_ARCHIVE_CLEANUP.md`
- `docs_build/pr/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_1.md`
- `docs_build/pr/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_3_ARCHIVED_NOTES_POLICY.md`

### Reference Classification (Policy / Structure / Navigation / Historical)
| File | Classification | Notes |
| --- | --- | --- |
| `docs/reference/root/README.md` | structure/navigation | Canonical docs entry points include archive destinations. |
| `docs/reference/root/repo-directory-structure.md` | structure | Declares archive folders as part of repo structure. |
| `docs/reference/root/getting-started.md` | navigation | Explains archive location for onboarding. |
| `docs/reference/root/review-checklist.md` | policy | Review rules cite archive destinations. |
| `docs/reference/architecture-standards/architecture/repo-operating-model.md` | policy/structure | Operating model includes archive paths. |
| `docs/reference/architecture-standards/architecture/engine-api-boundary.md` | policy | Boundary guidance references archived outputs. |
| `docs_build/operations/dev/README.md` | structure/navigation | Dev docs index references archive subpaths. |
| `docs_build/operations/dev/paths.md` | policy/structure | Explicit path constants map to archive locations. |
| `docs_build/operations/dev/file_tree.txt` | historical/structure | Snapshot includes archive tree placement. |
| `docs_build/operations/dev/codex_commands.md` | policy | Command constraints include archive protections. |
| `docs_build/operations/dev/validation_checklist.txt` | policy | Validation wording references archive destination. |
| `docs_build/reports/README.md` | navigation/policy | Report retention guidance points to archive reports path. |
| Cleanup reports/specs listed above | policy | Cleanup governance tracks archive target and guard rules. |
| Docs archive cleanup plan/build specs | historical/policy | Historical movement plan and manifest contract references archive destination. |
| Current archived-notes policy BUILD spec | policy | Defines this exact policy lane scope/constraints. |

## 3) Required Separation

### Direct path references
- Direct literal `docs_build/archive/` references are present and active in the unique consumer files listed above.

### Documentation/policy references
- All current active references found by scan are documentation/policy/governance surfaces under `docs/`.

### Test/config references
Commands used:
```powershell
rg -n "docs_build/archive/" tests --glob "!**/node_modules/**"
rg -n "docs_build/archive/" --glob "*.json" --glob "*.yml" --glob "*.yaml" --glob "!**/node_modules/**"
```
Result:
- No test references found.
- No JSON/YAML config references found.

## 4) Path Assumptions That Block Safe Move/Delete
1. Documentation contracts currently encode specific archive destinations:
   - `docs_build/archive/dev-ops/`
   - `docs_build/archive/generated-reports/`
   - `docs_build/archive/pr/legacy-pr-history/`
2. Cleanup governance artifacts already track `docs_build/archive/` as a retained policy target.
3. Existing archive-cleanup plan/build specs depend on the exact archive destination path for manifest-based movement and rollback.
4. Moving/deleting archive paths would require synchronized updates across multiple docs governance surfaces to avoid broken navigation/policy references.

## 5) Inventory Conclusion
- `docs_build/archive/` is an active policy/structure target with live documentation references.
- Current evidence supports a conservative keep/defer posture in this lane.
- No movement, deletion, or rewrite action is justified in this BUILD.
