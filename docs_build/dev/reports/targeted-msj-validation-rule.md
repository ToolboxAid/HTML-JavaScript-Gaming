# PR_26155_043 Targeted MSJ Validation Rule

## Summary

Added targeted MSJ validation governance to `docs_build/dev/PROJECT_INSTRUCTIONS.md`.

Every tool, page, or `src/` change must declare its impacted MSJ/test lane.

## Rule

Run only the affected MSJ/test lane by default.

Do not run the full suite for small scoped changes unless one of these shared surfaces changes:
- shared runtime behavior
- shared parser behavior
- shared DB behavior
- shared Theme V2 behavior
- cross-tool integration behavior

If a shared source file changes, name affected dependent lanes and run only those targeted lanes unless the dependency impact proves broader validation is required.

Reports must state:
- impacted lane
- skipped lanes
- why skipped lanes were safe to skip
- when the full suite is required

## This Bundle

Impacted lane: `workspace-contract`.

Command run:
- `npm run test:workspace-v2`

Skipped lanes:
- runtime
- integration
- engine
- samples
- recovery/UAT

Skipped-lane rationale: the bundle updates Toolbox role-banner wireframe markup, its existing page script visibility wiring, governance docs, and Playwright coverage. It does not alter shared runtime, shared parser, shared DB implementation, shared Theme V2 CSS, engine behavior, samples, or cross-tool integration.

Full suite is required when shared runtime, shared parser, shared DB, shared Theme V2, or cross-tool integration behavior changes.

## Validation Notes

- `npm run test:workspace-v2` passed with 4 Playwright tests.
- `git diff --check` passed.

Theme V2 gap findings: none.
