# BUILD_PR: Codex Execution Notes

## Model

GPT-5.4 or GPT-5.3-codex

## Reasoning

High

## Codex Command

```bash
codex
```

## Task

Implement the PLAN_PR in `docs/dev/plan_pr_tool_workspace_schema_manifest_boundaries.md`.

## Constraints

- Smallest valid change.
- One PR purpose only.
- Docs-first schema/manifest boundary cleanup.
- Do not modify `start_of_day`.
- Do not delete preserved legacy folders.
- Do not write broad custom validation code where `*.schema` files can define the contract.
- Preserve existing sample behavior.
- Samples must use named palettes only and remain locked.
- Workspaces must use duplicated palettes and enforce used-palette replacement restrictions.
- Workspace assets must live in `workspace.manifest`; only rendered/exportable artifacts such as PNG files may be saved separately.

## Suggested Implementation Order

1. Inventory only the specific files referencing:
   - `buildDefaultPayload`
   - 3D camera path editor payload setup
   - 3D JSON payload normalizer
   - viewer asset save/export paths
   - workspace/sample manifest loading
   - palette mutation rules
2. Add schema files near the owning tool or manifest contract.
3. Wire sample tool payloads to validate/load through the same tool schema.
4. Wire workspace manifest validation through `workspace.manifest` schema.
5. Centralize button/action enablement by loaded context:
   - tool context
   - workspace context
6. Add/update minimal tests or fixtures proving:
   - sample palette lock
   - workspace palette duplication
   - used swatch replacement protection
   - workspace-owned assets persisted in manifest
   - PNG export still works
7. Update roadmap/status markers only if the repo has an active roadmap file for this phase.

## Test Commands

Use the repo’s existing test commands. If none exist, run the smallest available smoke checks:

```bash
npm test
npm run build
```

If the repo does not use npm for this area, document the actual commands run in the PR notes.

## Required Output From Codex

- List changed files.
- List tests run.
- Note any compatibility shims left in place.
- Note any old references that were intentionally preserved.
