# PLAN PR — Protected BUILD Template

## Purpose
Introduce a protected BUILD template to standardize constraints across all BUILD PRs.

## Scope
- Add protected BUILD template under `docs/dev/templates/`
- Define mandatory constraints section
- Require future BUILD PRs to include or reference this protected template

## Non-Goals
- No runtime changes
- No Codex execution
- No changes to protected start_of_day directories

## Acceptance Criteria
- `docs/operations/dev/templates/BUILD_TEMPLATE_PROTECTED.md` exists
- Template includes mandatory constraints section
- Future BUILD PRs can reuse the exact constraints block
