# Toolbox Recovery Alignment

PR: `PR_26155_005-toolbox-recovery-alignment`

## Scope
- This PR is docs/report alignment only.
- No runtime behavior was modified.
- `toolbox/index.html` was not modified.
- No CSS was added.
- No tools were added.
- `toolbox/tools-page-accordions.js` was not deleted.

## Executed Toolbox PR Sequence
- `PR_26154_053` added the initial Toolbox wireframe incorrectly as extra Progress and Build Path sections.
- The view-mode correction changed Progress and Build Path into page mode controls on the same Toolbox surface.
- The corrected Toolbox surface uses `Order | Group | Progress | Build Path` as view modes, not standalone tool cards, accordions, or extra sections.
- `PR_26155_004` audited `toolbox/index.html` and `toolbox/tools-page-accordions.js`.
- `PR_26155_004` decided KEEP for `toolbox/tools-page-accordions.js` because it still owns current Toolbox rendering.

## Current State
- `toolbox/index.html` is transitional.
- `toolbox/index.html` contains the Toolbox title, four view controls, and an empty `[data-tools-accordion-list]` render host.
- Current Toolbox card rendering still depends on `toolbox/tools-page-accordions.js`.
- Current Order, Group, Progress, and Build Path views still depend on `toolbox/tools-page-accordions.js`.
- Current Progress readiness labels still depend on `toolbox/tools-page-accordions.js`.
- Current Build Path grouped rendering still depends on `toolbox/tools-page-accordions.js`.

## Runtime Ownership Decision
- KEEP `toolbox/tools-page-accordions.js` for now.
- Deletion is not safe while the active Toolbox page still relies on it for rendering.
- Do not remove `toolbox/tools-page-accordions.js` until the Toolbox runtime has a replacement active source of truth.

## Next Required Architecture Step
Create a registry-driven Toolbox runtime for:
- Order
- Group
- Progress
- Build Path

The registry-driven runtime should own tool metadata, grouping, routes, status/readiness, requirements, progress checklist data, and deferred flags through a declared registry/data source.

Only after that runtime exists and `toolbox/index.html` no longer depends on `toolbox/tools-page-accordions.js` should `toolbox/tools-page-accordions.js` be removed.

## Project Workspace Naming Guidance
- User-facing text must say `Project Workspace`.
- New test/report prose should use `Project Workspace` for the current product experience.
- `Workspace V2` may appear only when referencing actual legacy script names, command names, lane identifiers, or historical suite names that still exist.
- Example: `npm run test:workspace-v2` may be named as a legacy command, but reports should explain that user-facing language is `Project Workspace`.

## Targeted Validation Reminder
- Tool, page, and `src/` changes must use the narrowest affected validation lane that proves the changed behavior.
- Do not run broad validation for small scoped changes unless shared runtime behavior changes.
- Docs/report-only alignment changes should use static validation such as `git diff --check` unless the BUILD explicitly requests more.

## Validation
- PASS: `git diff --check`.
- PASS: report names the current transitional Toolbox state clearly.
- PASS: report names the next required registry-driven runtime step clearly.
- SKIPPED: Playwright, because this PR is docs/report alignment only and Playwright impacted is No.
