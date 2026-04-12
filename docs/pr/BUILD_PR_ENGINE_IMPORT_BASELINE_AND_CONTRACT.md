# BUILD_PR_ENGINE_IMPORT_BASELINE_AND_CONTRACT

## PR Purpose
Create one execution-ready, low-token lane to baseline current `/src/engine/` usage and convert it into an explicit contract report.

## Scope
This PR is single-purpose:
- inventory current `/src/engine/` imports and stylesheet references
- classify the usage surface by area
- record whether the current import style is already stable enough to treat as the baseline contract
- do not rewrite imports in this PR
- do not move files
- do not touch unrelated cleanup targets

## Why This PR Now
Recent cleanup work reduced noise and removed active template blockers. This makes engine import baselining a good next high-impact lane with low execution risk.

## Exact Target Files

### Must create or overwrite
- `docs/dev/reports/engine_import_baseline_report.md`
- `docs/dev/reports/engine_import_contract_decision.md`
- `docs/dev/reports/BUILD_PR_ENGINE_IMPORT_BASELINE_AND_CONTRACT_report.md`
- `docs/dev/reports/validation_checklist.txt`

### May update only if already present and only to align with this PR
- `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

## Required Work

### 1) Baseline report
Create `docs/dev/reports/engine_import_baseline_report.md`.

This report must:
- summarize current `/src/engine/` usage in active repo surfaces
- separate usage into:
  - `src/`
  - `games/`
  - `samples/`
  - `tools/`
  - HTML stylesheet references
  - metadata/report-only references if found
- identify whether current usage appears consistent, mixed, or transitional
- capture exact validation commands used

### 2) Contract decision
Create `docs/dev/reports/engine_import_contract_decision.md`.

This file must include:
- current contract candidate:
  - `absolute-root /src/engine/*`
- whether this should be treated as the current baseline contract
- rationale
- allowed now
- not allowed now
- exact future follow-up needed before any mass rewrite lane

Expected outcome for this PR:
- treat the current `/src/engine/` style as the active baseline unless contradictory evidence is found

### 3) Optional roadmap alignment
Only if exact wording already exists, Codex may apply bracket-only roadmap state updates for:
- `imports normalized after moves`
- `imports pointing to legacy paths reduced`
- `move/refactor validation strategy documented`

Rules:
- no wording edits
- no reorder
- if exact text is not cleanly applicable, record it in the BUILD report under `Unapplied Planned Delta`

### 4) BUILD report
Create `docs/dev/reports/BUILD_PR_ENGINE_IMPORT_BASELINE_AND_CONTRACT_report.md` with:
- bundle type
- exact files created
- exact files changed
- summary of findings
- contract decision
- any roadmap bracket changes actually applied
- unapplied delta if any
- explicit statement that no runtime code, file moves, or import rewrites occurred

### 5) Validation checklist
Create `docs/dev/reports/validation_checklist.txt` with pass/fail for:
- protected start_of_day directories untouched
- no runtime import rewrites performed
- required reports created
- roadmap wording preserved if roadmap changed
- roadmap changes bracket-only if roadmap changed

## Validation Commands Codex Must Run
Run only narrow commands needed for this PR:
1. scan active repo surfaces for `/src/engine/`
2. scan HTML files for `/src/engine/ui/`
3. confirm no changes under protected start_of_day directories
4. if roadmap changed, verify diff is bracket-only

## Non-Goals
- no import rewrites
- no directory moves
- no broad cleanup
- no template/archive work
- no runtime behavior changes

## Expected Output
Package output to:
- `<project folder>/tmp/BUILD_PR_ENGINE_IMPORT_BASELINE_AND_CONTRACT.zip`
