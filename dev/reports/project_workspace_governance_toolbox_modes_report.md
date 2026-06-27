# PR_26155_001 Project Workspace Governance Toolbox Modes Report

## Scope
- PR: `PR_26155_001-project-workspace-governance-toolbox-modes`
- Source of truth read first: `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- Purpose: add targeted governance for validation, tool planning data, debug release gating, and Project Workspace naming while confirming the Toolbox page modes remain one shared surface.

## Changes
- Added `Targeted Independent Validation Guidance` to `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Added `Tool Registry Planning Governance` to require declared tool registry/data-source ownership before runtime tools database behavior.
- Added `Game Debug Configuration Governance` for creator-visible debug settings and public/playable release rejection or disablement.
- Added `Project Workspace Naming Guidance` for user-facing copy and new report/test prose.
- Reviewed `toolbox/index.html` and the current `tools-page-accordions.js` page wiring.
- Confirmed Order, Group, Progress, and Build Path are page modes for the same Toolbox surface.
- Confirmed Progress and Build Path are not separate tools, standalone tool cards, or extra static accordions.
- Confirmed Arcade remains out of Toolbox.
- Confirmed visible dynamic tool labels do not use forbidden `Studio` wording.

## Toolbox Mode Contract
- Order: existing active tool tiles sorted alphabetically.
- Group: existing active tool tiles grouped by Toolbox category.
- Progress: existing active tool tiles with static readiness labels only.
- Build Path: existing active tool tiles grouped into visual path stages only.
- No new tools were added.
- No runtime database behavior was added.
- No new CSS was added.
- No new implementation logic was added beyond the current page wiring.

## Targeted Validation Notes
- Narrow affected lane selected: Project Workspace toolbox page lane through the legacy `npm run test:workspace-v2` command.
- Additional targeted checks:
  - `node scripts/validate-active-tools-surface.mjs`
  - `node scripts/validate-tool-registry.mjs`
  - changed JS syntax checks
  - Toolbox source checks for view controls, Progress readiness labels, Build Path path groups, no extra Progress/Build Path wireframe sections, Arcade absence, forbidden `Studio` label absence, and no inline CSS/JS/event handlers.
- Broad lanes skipped:
  - full samples smoke test
  - full repository Playwright
  - broad engine test lane
  - unrelated tool suites
- Skipped broad-lane rationale: this PR changes governance text and verifies the existing Toolbox page-mode wiring; it does not change shared engine runtime behavior, public navigation behavior, sample behavior, or unrelated tool runtime behavior.
- Full samples validation skipped because samples are not in scope and no shared sample runtime behavior changed.

## Project Workspace Naming Note
- User-facing and new report/test prose should use `Project Workspace`.
- `npm run test:workspace-v2` remains the current package script name and is treated as legacy test-command naming only.
- Existing package scripts and legacy lane identifiers were not renamed in this PR.

## Validation Results
- PASS: `node scripts/validate-active-tools-surface.mjs`
- PASS: `node scripts/validate-tool-registry.mjs`
- PASS: Toolbox source validation for mode controls and forbidden standalone Progress/Build Path content.
- PASS: `npm run test:workspace-v2`
- PASS: `git diff --check`
- PASS: `node --check` for changed JS/MJS files.
- PASS: no CSS files changed.

## Playwright
- Playwright impacted: Yes.
- Behavior validated:
  - Toolbox page loads.
  - Order, Group, Progress, and Build Path controls are visible.
  - Progress and Build Path are not rendered as standalone tool cards or static wireframe accordions.
  - Progress renders readiness labels on active tool tiles.
  - Build Path renders active tool tiles under path groups.
  - Arcade is absent from Toolbox main content.
  - Visible dynamic tool labels do not use forbidden `Studio` wording.
  - Tool template still loads from root Theme V2 paths.
- Expected pass behavior: the legacy `npm run test:workspace-v2` command passes for the Project Workspace toolbox surface checks.
- Expected fail behavior: missing view controls, standalone Progress/Build Path cards or accordions, missing readiness labels, missing Build Path groups, Arcade in Toolbox, forbidden `Studio` labels, page errors, or failed requests fail the lane.

## Manual Test Notes
- Open `/toolbox/index.html`.
- Confirm Order, Group, Progress, and Build Path render as controls for the same Toolbox list area.
- Click Order and confirm active tool tiles render in ordered view.
- Click Group and confirm active tool tiles render grouped by Toolbox category.
- Click Progress and confirm active tool tiles render with static `locked`, `ready`, `in-progress`, and `complete` readiness labels.
- Click Build Path and confirm active tool tiles render under path groups.
- Confirm Progress and Build Path are not standalone tool cards or extra accordions.
- Confirm Arcade does not appear in Toolbox content.
- Confirm visible dynamic tool labels do not include `Studio`, except the GameFoundryStudio brand exception.
- Confirm the page uses existing Theme V2 styling and no new CSS-backed visual pattern is introduced.
