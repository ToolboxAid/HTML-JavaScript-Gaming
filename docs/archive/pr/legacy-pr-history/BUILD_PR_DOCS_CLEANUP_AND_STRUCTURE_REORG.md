Toolbox Aid
David Quesenberry
04/05/2026
BUILD_PR_DOCS_CLEANUP_AND_STRUCTURE_REORG.md

# BUILD PR
Docs Cleanup and Structure Reorg

## Objective
Remove low-value or stale documentation, consolidate duplicate operating docs, and normalize the docs/dev, docs/architecture,
and related documentation structure without touching runtime behavior or engine logic.

## Why This PR
The repo currently contains:
- strong long-term architectural history in `docs/pr/`
- active workflow controls in `docs/dev/`
- generated review artifacts in `docs/dev/reports/`
- duplicate rules/workflow/start-of-day notes
- one-off utility files that do not add lasting value

This PR cleans that up and leaves one clear, durable documentation structure.

## Scope
- Remove stale or low-value documentation artifacts
- Archive or consolidate duplicate dev-operating docs
- Normalize where architecture docs live
- Update key index/readme files to explain the new structure
- Preserve repo history and active workflow controls
- Keep code/runtime untouched

## Non-Goals
- No engine core changes
- No sample/game/tool runtime changes
- No `docs/pr/` history purge
- No destructive deletion of valuable architectural records
- No renaming of active PR handoff files in a way that breaks current workflow

## Keep Intact
Keep these as first-class active areas:
- `docs/pr/` as project/architecture history
- `docs/dev/WORKFLOW_RULES.md`
- `docs/operations/dev/README.md`
- active `docs/dev/CODEX_COMMANDS.md`
- active `docs/dev/COMMIT_COMMENT.txt`
- active `docs/dev/NEXT_COMMAND.txt`
- `docs/architecture/`
- key root docs such as `README.md`

## Safe Cleanup Targets
These are safe deletion or move-out/archive candidates if confirmed redundant:
- `docs/dev/usage monitor.url`
- `docs/dev/PROJECT_TEMPLATE_SNAPSHOT.zip_`
- consumed generated artifacts in `docs/dev/reports/` such as:
  - `change_summary.txt`
  - `file_tree.txt`
  - `validation_checklist.txt`
- duplicate workflow/rules/start-of-day files if their content is preserved elsewhere:
  - `docs/dev/RULES.txt`
  - `docs/dev/WORKFLOW.md`
  - `docs/dev/UPDATE_REQUIRED.txt`
  - sprite-editor-only workflow/rules duplicates
  - start-of-day duplicates
  - one-off patch/fix notes

## Required Reorg
Codex should normalize to this documentation shape:

- `docs/reference/root/README.md`
  - top-level docs map
- `docs/architecture/`
  - durable architecture references only
- `docs/dev/`
  - active workflow controls only
- `docs/dev/reports/`
  - only current/valuable generated reports
- `docs/archive/dev-ops/`
  - archived duplicate operational notes that are worth keeping
- `docs/archive/generated-reports/`
  - older generated review artifacts worth retaining but not cluttering active docs
- `docs/pr/`
  - unchanged history trail

## Required Moves / Consolidations
1. Move or rewrite `docs/dev/ARCHITECTURE.txt`
   - into a durable architecture-facing document under `docs/architecture/`
   - preferred target:
     `docs/reference/architecture-standards/architecture/repo-operating-model.md`
   - then remove the dev-side duplicate

2. Consolidate workflow docs
   - preserve `docs/dev/WORKFLOW_RULES.md` as canonical
   - fold useful content from `RULES.txt` and `WORKFLOW.md` into canonical docs
   - archive or delete redundant originals

3. Consolidate start-of-day / sprite-editor-specific operating notes
   - keep only if still relevant
   - otherwise archive under `docs/archive/dev-ops/`
   - do not leave multiple conflicting active rule files in `docs/dev/`

4. Trim `docs/dev/reports/`
   - keep only current-value reports
   - move stale/historical reports to `docs/archive/generated-reports/`
   - remove no-value/generated duplicates

## Required Doc Updates
Update these docs to reflect the cleaned structure and current operating model:
- `README.md`
- `docs/reference/root/README.md`
- `docs/reference/root/getting-started.md`
- `docs/reference/architecture-standards/architecture/README.md`
- `docs/reference/architecture-standards/architecture/engine-api-boundary.md`
- `docs/operations/dev/README.md`
- `docs/reference/root/repo-directory-structure.md` if present
- `docs/reference/root/review-checklist.md` if present

## Acceptance Criteria
- `docs/dev/` contains only active workflow controls and active handoff files
- duplicate operational docs are removed or archived
- durable architecture docs live under `docs/architecture/`
- `docs/pr/` remains intact
- no runtime code or engine files changed
- root/readme/index docs describe the new structure clearly
- commit comment file remains header-free

## Validation
- compare before/after docs tree
- verify `docs/dev/` is materially smaller and cleaner
- verify `docs/architecture/` contains durable architecture docs
- verify archived docs are outside active operating surfaces
- verify no JS/HTML/CSS/runtime files changed
- verify no references in active docs point to removed paths

## Packaging
Codex must produce the implementation delta ZIP at:
`<project folder>/tmp/BUILD_PR_DOCS_CLEANUP_AND_STRUCTURE_REORG_delta.zip`
