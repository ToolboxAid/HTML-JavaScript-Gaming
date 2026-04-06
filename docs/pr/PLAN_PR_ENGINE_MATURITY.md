# PLAN_PR_ENGINE_MATURITY

## Purpose
Define the docs-first plan for promoting the current debug platform toward engine maturity without polluting engine core APIs and without skipping the established workflow.

## Context
The current project already has render pipeline contracts, a runtime scene loader with hot reload, a dev console runtime, a canvas HUD, and an interactive console UI. The active architecture is:

`TOOLS -> CONTRACT -> RUNTIME -> DEBUG -> VISUAL`

This PR is planning-only. Codex remains responsible for implementation.

## Goals
1. Establish a stable debug API surface.
2. Define a plugin model for debug extensions.
3. Define external documentation boundaries.
4. Define versioned contracts for debug-facing integrations.
5. Define performance benchmark rules and validation expectations.

## Non-Goals
- No runtime implementation changes.
- No engine-core API expansion in this PR.
- No restructuring of existing debug surfaces.
- No changes to combo keys or operator UX.
- No roadmap text edits outside bracket-state updates.

## Scope
### In Scope
- Planning docs for engine maturity.
- Build instructions for a later implementation PR.
- Apply instructions for a later implementation PR.
- API inventory and boundary definitions.
- Versioning strategy.
- Performance rules.
- Documentation map.
- Roadmap alignment notes.

### Out Of Scope
- New runtime modules.
- Inspector implementation.
- Network debug implementation.
- 3D debug feature implementation.
- Plugin host code.
- Benchmark harness code.

## Proposed Maturity Slices
### Slice 1 — Stable Debug API
Define approved public selectors, commands, provider registration points, panel registration boundaries, and event names that are safe to treat as supported.

### Slice 2 — Plugin System
Define plugin manifest expectations, registration lifecycle, extension boundaries, and failure isolation rules.

### Slice 3 — External Documentation
Define docs ownership, audience splits, and canonical document locations for engine-facing, tool-facing, and sample-facing consumers.

### Slice 4 — Versioned Contracts
Define compatibility policy, semantic versioning expectations, and deprecation handling for debug contracts.

### Slice 5 — Performance Benchmarks
Define benchmark categories, thresholds, measurement rules, and regression gates for debug surfaces.

## Acceptance Criteria
- Planning docs clearly separate public vs internal debug surfaces.
- Plugin model is defined without requiring engine pollution.
- Documentation ownership and map are explicit.
- Versioning rules identify compatibility expectations and deprecation flow.
- Performance rules define measurable expectations.
- Roadmap/tracker handling follows bracket-only rules.

## Risks
- Public API may be declared too early and limit future refactors.
- Plugin scope may become too broad and leak internals.
- Benchmark rules may be too vague to enforce.
- Documentation sprawl may create conflicting sources of truth.

## Risk Controls
- Promote only already-proven surfaces.
- Prefer read-only/public contract seams.
- Keep plugin hooks narrowly scoped.
- Define one canonical doc per concern.
- Require versioning and deprecation notes for promoted surfaces.

## Dependencies
- Existing debug platform baseline.
- Existing docs/dev controls.
- Strict adherence to `PLAN_PR -> BUILD_PR -> APPLY_PR`.

## Deliverables
- `docs/pr/PLAN_PR_ENGINE_MATURITY.md`
- `docs/pr/BUILD_PR_ENGINE_MATURITY.md`
- `docs/pr/APPLY_PR_ENGINE_MATURITY.md`
- `docs/dev/ENGINE_MATURITY_API_INVENTORY.md`
- `docs/dev/ENGINE_MATURITY_VERSIONING_STRATEGY.md`
- `docs/dev/ENGINE_MATURITY_PERFORMANCE_RULES.md`
- `docs/dev/ENGINE_MATURITY_DOCUMENTATION_MAP.md`
- `docs/dev/BIG_PICTURE_ROADMAP.md`
- `docs/dev/ROADMAP_GUARDRAILS.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
- `docs/dev/next_command.txt`
- reports under `docs/dev/reports/`

## Exit Condition
This planning slice is complete when the maturity surfaces are documented well enough for a separate BUILD PR to produce a surgical implementation bundle.
