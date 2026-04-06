Toolbox Aid
David Quesenberry
04/05/2026
PLAN_PR_PRODUCTIZATION_DISTRIBUTION_STARTER.md

# PLAN_PR_PRODUCTIZATION_DISTRIBUTION_STARTER

## Goal
Define a productization distribution starter contract for the showcase samples (Asteroids and Breakout) covering packaging, presentation, discoverability, and user entry flows.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## In Scope
- Showcase landing page structure definition.
- Sample discovery improvements definition for `games/index.html`.
- Packaging strategy definition (standalone package vs repo-linked package).
- Asset bundling rule definition.
- User entry point definition (play flow vs debug flow).

## Out of Scope
- Engine core changes.
- Runtime refactors.
- Track G work.
- Track H work.

## Constraints
- Docs-first only.
- No `BIG_PICTURE_ROADMAP.md` edits.
- If `PRODUCTIZATION_ROADMAP.md` is updated, bracket-only state edits only.
- Preserve production-safe defaults for debug access.

## Distribution Starter Decisions To Define
1. Landing page information architecture:
- Hero summary.
- Sample cards for Asteroids/Breakout.
- Entry actions for Play and Debug.
- Compatibility and known limitations block.

2. Discovery contract for `games/index.html`:
- Consistent debug showcase labeling.
- Clear visual distinction between playable vs debug showcase context.
- Link path conventions for play and debug entry.

3. Packaging contract:
- `repo-linked` mode for contributors.
- `standalone` mode for product demo distribution.
- Explicit list of required files and excluded files.

4. Asset bundling rules:
- Include sample-local assets, required engine UI, and required shared debug assets.
- Exclude tests, temporary artifacts, and unrelated samples.
- Preserve relative paths and browser-loadable structure.

5. Entry points:
- Play entry: default production-safe mode.
- Debug entry: explicit query-param entry (`?debug=1`).
- Optional demo entry: explicit one-click mode (`?debugDemo=1`).

## Acceptance Criteria
- Distribution contract is explicit and actionable.
- Asteroids and Breakout are both covered.
- Packaging and asset rules are deterministic.
- Entry point behavior is clear for users and maintainers.