# Documentation Cleanup and Current-State Update Audit

## Scope
This audit is based on the current repository tree snapshot.

## Summary
The repo now has a strong architecture and workflow trail, but the documentation set has accumulated:
- active workflow docs
- historical PR docs
- generated review artifacts
- older sprite-editor-specific operating notes
- temporary root artifacts

The safest cleanup approach is:

1. **Keep** architectural history under `docs_build/pr/`
2. **Delete or move out of repo** generated artifacts and one-off root files
3. **Consolidate** duplicate workflow and sprite-editor rule files
4. **Update** the small set of top-level docs that define the current repo state

---

## Delete Candidates (safe / low-risk)

### Root-level generated or temporary files
These are not part of the long-term docs system and can be removed from the repo after use:
- `PROJECT_TEMPLATE_SNAPSHOT.zip`
- `state_11_1.txt`

### Generated report artifacts
These are useful during review, but should not accumulate indefinitely if their conclusions are already captured elsewhere:
- `docs_build/reports/change_summary.txt`
- `docs_build/dev/reports/expansion_decision.txt`
- `docs_build/reports/file_tree.txt`
- `docs_build/dev/reports/readiness_decision.txt`
- `docs_build/reports/validation_checklist.txt`

Recommended rule:
- keep only the latest report set for the currently active PR, or
- move older report sets outside the repo

### Likely obsolete / duplicate dev-operating notes
These appear to overlap and should be consolidated rather than all kept active:
- `docs_build/dev/---patches-fixes.txt`
- `docs_build/dev/RULES.txt`
- `docs_build/dev/WORKFLOW.md`
- `docs_build/dev/usage monitor.url`
- `docs_build/dev/sprite_editor_RULES.txt`
- `docs_build/dev/sprite_editor_RULES_updated.txt`
- `docs_build/dev/sprite_editor_RULES_codex_enforced.md`
- `docs_build/dev/sprite_editor_START_OF_DAY_checklist.md`
- `docs_build/dev/CODEX_START_OF_DAY.md`
- `docs_build/dev/START_OF_DAY.md`

Recommended rule:
- keep one canonical workflow/rules file
- keep one canonical start-of-day file if still needed
- archive or delete the rest

---

## Keep (important history / still useful)

### Keep under `docs_build/pr/`
These are valuable architectural records and should generally stay:
- Level 7 through Level 11 plan/build docs
- level specs, usage docs, criteria docs, rollout docs
- repo cleanup PR docs
- engine promotion and stabilization docs

Why keep them:
- they document how the architecture evolved
- they are reusable patterns for future projects
- they support future audits and template extraction

### Keep in `docs_build/dev/`
These should remain as the active operating files:
- `docs_build/dev/WORKFLOW_RULES.md`
- `docs_build/operations/dev/README.md`
- `docs_build/dev/CODEX_COMMANDS.md` (active PR only)
- `docs_build/dev/COMMIT_COMMENT.txt` (active PR only)
- `docs_build/dev/NEXT_COMMAND.txt` (active PR only)

---

## Documents that Need Updating to Match Current State

### 1. Root `README.md`
Update to reflect:
- repo now includes `src/advanced/state/`
- authoritative state work completed through:
  - objective progress
  - score
- current recommended path is template-based new project startup
- docs-first / Codex-build workflow

### 2. `docs/reference/root/README.md`
Update to explain:
- `docs_build/pr/` = architectural and PR history
- `docs_build/dev/` = active workflow and temporary execution controls
- `docs_build/dev/reports/` = generated review artifacts
- `docs/architecture/` = engine boundary / architecture references

### 3. `docs/reference/root/repo-directory-structure.md`
This needs explicit updates for:
- `src/advanced/state/`
- `docs_build/dev/reports/`
- current purpose of `games/`, `tools/`, `samples/`
- distinction between `src/engine/` and `src/advanced/`

### 4. `docs/reference/root/getting-started.md`
Update onboarding to current reality:
- use docs-first workflow
- PLAN_PR → BUILD_PR → APPLY_PR
- Codex writes code
- reports now live under `docs_build/dev/reports/`
- new projects should start from the template snapshot pattern

### 5. `docs/reference/root/review-checklist.md`
Update review checklist to include:
- check for `docs_build/dev/reports/`
- verify no engine-boundary violations
- verify new advanced work lives in `src/advanced/`
- verify PR docs are in `docs_build/pr/`
- verify ZIP output path uses `<project folder>/tmp/...`

### 6. `docs/reference/architecture-standards/architecture/README.md`
Update to include the current layered model:
- `src/engine/` = stable foundational systems
- `src/advanced/` = composable optional architecture layer
- `games/` = primary consumers
- `tools/` = optional consumers
- `samples/` = demonstration only

### 7. `docs/reference/architecture-standards/architecture/engine-api-boundary.md`
Update to explicitly state:
- authoritative state belongs in `src/advanced/state/`, not `src/engine/state/`
- engine must not import advanced systems
- reusable + foundational goes to `src/engine/`
- reusable + composable goes to `src/advanced/`

### 8. `docs_build/operations/dev/README.md`
Update to current operating model:
- docs-only bundles from planning
- Codex performs implementation
- reports required in `docs_build/dev/reports/`
- active files vs archival/historical files

---

## Suggested Consolidation Rules

### Canonical files to keep active
- `docs_build/dev/WORKFLOW_RULES.md`
- `docs_build/operations/dev/README.md`
- `docs_build/dev/CODEX_COMMANDS.md`
- `docs_build/dev/COMMIT_COMMENT.txt`
- `docs_build/dev/NEXT_COMMAND.txt`

### Historical files to keep but treat as archive
- `docs_build/pr/*`

### Delete or move out after use
- root ZIPs
- one-off tree/listing files
- stale report files
- duplicate operating notes

---

## Recommended Cleanup Sequence

1. Delete root temporary artifacts
2. Move or delete old `docs_build/dev/reports/*`
3. Consolidate duplicate `docs_build/dev/*RULES*`, `*START_OF_DAY*`, and one-off notes
4. Update the 8 key docs listed above
5. Leave `docs_build/pr/` intact as the project history trail

---

## Bottom Line
If you want the cleanest current-state repo:

### Delete / move out now
- root ZIPs and one-off text artifacts
- stale generated reports
- duplicate dev operating files after consolidation

### Update now
- `README.md`
- `docs/reference/root/README.md`
- `docs/reference/root/repo-directory-structure.md`
- `docs/reference/root/getting-started.md`
- `docs/reference/root/review-checklist.md`
- `docs/reference/architecture-standards/architecture/README.md`
- `docs/reference/architecture-standards/architecture/engine-api-boundary.md`
- `docs_build/operations/dev/README.md`

### Keep
- `docs_build/pr/` history
- `docs_build/dev/WORKFLOW_RULES.md`
- active Codex handoff files
