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

1. **Keep** architectural history under `docs/pr/`
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
- `docs/reports/change_summary.txt`
- `docs/dev/reports/expansion_decision.txt`
- `docs/reports/file_tree.txt`
- `docs/dev/reports/readiness_decision.txt`
- `docs/reports/validation_checklist.txt`

Recommended rule:
- keep only the latest report set for the currently active PR, or
- move older report sets outside the repo

### Likely obsolete / duplicate dev-operating notes
These appear to overlap and should be consolidated rather than all kept active:
- `docs/dev/---patches-fixes.txt`
- `docs/dev/RULES.txt`
- `docs/dev/WORKFLOW.md`
- `docs/dev/usage monitor.url`
- `docs/dev/sprite_editor_RULES.txt`
- `docs/dev/sprite_editor_RULES_updated.txt`
- `docs/dev/sprite_editor_RULES_codex_enforced.md`
- `docs/dev/sprite_editor_START_OF_DAY_checklist.md`
- `docs/dev/CODEX_START_OF_DAY.md`
- `docs/dev/START_OF_DAY.md`

Recommended rule:
- keep one canonical workflow/rules file
- keep one canonical start-of-day file if still needed
- archive or delete the rest

---

## Keep (important history / still useful)

### Keep under `docs/pr/`
These are valuable architectural records and should generally stay:
- Level 7 through Level 11 plan/build docs
- level specs, usage docs, criteria docs, rollout docs
- repo cleanup PR docs
- engine promotion and stabilization docs

Why keep them:
- they document how the architecture evolved
- they are reusable patterns for future projects
- they support future audits and template extraction

### Keep in `docs/dev/`
These should remain as the active operating files:
- `docs/dev/WORKFLOW_RULES.md`
- `docs/operations/dev/README.md`
- `docs/dev/CODEX_COMMANDS.md` (active PR only)
- `docs/dev/COMMIT_COMMENT.txt` (active PR only)
- `docs/dev/NEXT_COMMAND.txt` (active PR only)

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
- `docs/pr/` = architectural and PR history
- `docs/dev/` = active workflow and temporary execution controls
- `docs/dev/reports/` = generated review artifacts
- `docs/architecture/` = engine boundary / architecture references

### 3. `docs/reference/root/repo-directory-structure.md`
This needs explicit updates for:
- `src/advanced/state/`
- `docs/dev/reports/`
- current purpose of `games/`, `tools/`, `samples/`
- distinction between `src/engine/` and `src/advanced/`

### 4. `docs/reference/root/getting-started.md`
Update onboarding to current reality:
- use docs-first workflow
- PLAN_PR → BUILD_PR → APPLY_PR
- Codex writes code
- reports now live under `docs/dev/reports/`
- new projects should start from the template snapshot pattern

### 5. `docs/reference/root/review-checklist.md`
Update review checklist to include:
- check for `docs/dev/reports/`
- verify no engine-boundary violations
- verify new advanced work lives in `src/advanced/`
- verify PR docs are in `docs/pr/`
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

### 8. `docs/operations/dev/README.md`
Update to current operating model:
- docs-only bundles from planning
- Codex performs implementation
- reports required in `docs/dev/reports/`
- active files vs archival/historical files

---

## Suggested Consolidation Rules

### Canonical files to keep active
- `docs/dev/WORKFLOW_RULES.md`
- `docs/operations/dev/README.md`
- `docs/dev/CODEX_COMMANDS.md`
- `docs/dev/COMMIT_COMMENT.txt`
- `docs/dev/NEXT_COMMAND.txt`

### Historical files to keep but treat as archive
- `docs/pr/*`

### Delete or move out after use
- root ZIPs
- one-off tree/listing files
- stale report files
- duplicate operating notes

---

## Recommended Cleanup Sequence

1. Delete root temporary artifacts
2. Move or delete old `docs/dev/reports/*`
3. Consolidate duplicate `docs/dev/*RULES*`, `*START_OF_DAY*`, and one-off notes
4. Update the 8 key docs listed above
5. Leave `docs/pr/` intact as the project history trail

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
- `docs/operations/dev/README.md`

### Keep
- `docs/pr/` history
- `docs/dev/WORKFLOW_RULES.md`
- active Codex handoff files
