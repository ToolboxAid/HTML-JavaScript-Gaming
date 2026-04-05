Toolbox Aid
David Quesenberry
04/05/2026
repo-operating-model.md

# Repo Operating Model

## Purpose
This document captures the durable operating model for how this repository is organized and how work should flow through planning, build, and apply stages.

## Workflow Contract
- Required workflow: `PLAN_PR -> BUILD_PR -> APPLY_PR`
- Docs-first: define scope, constraints, and validation before implementation.
- One PR per purpose: keep each change set focused and reviewable.
- ZIP outputs for build/apply bundles go to `<project folder>/tmp/`.

## Ownership Model
- Planning/PR docs define scope and acceptance.
- Implementation applies only approved scope.
- `docs/pr/` is the historical PR and architecture trail and must remain intact.

## Layer Boundaries
- `engine/` owns foundational reusable runtime systems.
- `src/advanced/` owns composable higher-level architecture patterns.
- `samples/` demonstrates usage patterns and should not become the source of reusable runtime logic.
- `games/` consumes public contracts; it should not bypass engine boundaries.
- `tools/` contains editor and workflow tooling and should not modify engine internals directly unless explicitly scoped.

## Scene and Runtime Expectations
- Scene modules follow lifecycle contracts used by the engine runtime.
- Advanced state ownership belongs in `src/advanced/state/`, not engine internals.
- Engine should not import advanced-layer modules.

## File Header Standard
For newly created files, include the required file header at the top with:
- author line
- creation date
- filename

Exception:
- `docs/dev/commit_comment.txt` must stay header-free.

## Active vs Archived Documentation
- Active operations live in `docs/dev/` and should remain minimal.
- Durable architecture belongs in `docs/architecture/`.
- Historical PR narrative belongs in `docs/pr/`.
- Older operational notes and generated outputs live in:
  - `docs/archive/dev-ops/`
  - `docs/archive/generated-reports/`
