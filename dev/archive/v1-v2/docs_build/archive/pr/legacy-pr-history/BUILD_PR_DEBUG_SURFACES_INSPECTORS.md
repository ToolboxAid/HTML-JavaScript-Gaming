# BUILD_PR_DEBUG_SURFACES_INSPECTORS

## Purpose
Build a docs-first, implementation-ready bundle for the first inspector layer in debug surfaces.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## Build Scope
- define read-only inspector contracts
- define entity/component/state/timeline/event inspector boundaries
- define adapter ownership (shared vs project-specific)
- define validation and rollout for inspector apply

## Hard Constraints
- docs only in this BUILD bundle
- no runtime implementation code
- no engine core API pollution
- inspectors remain read-only in this phase
- preserve existing debug behavior and boundaries

## Inspector Contract Targets (v1)
1. Entity inspector surface:
- id/label/type summaries
- filtered listing and selection contract

2. Component inspector surface:
- component type summaries
- read-only component payload preview contract

3. State diff viewer surface:
- deterministic before/after summary format
- bounded diff size and truncation rules

4. Timeline debugger surface:
- event marker summaries
- timestamped sequence contract

5. Event stream viewer surface:
- normalized event record shape
- severity/category tagging contract

## Adapter Boundaries
Shared layer:
- inspector interface contracts
- read-only normalization rules
- registration and lifecycle seams

Project/sample layer:
- source extraction adapters
- domain-specific mapping/formatting
- sensitive field redaction policy

## Validation Targets
- all inspector surfaces remain read-only
- no direct mutation paths are introduced
- adapter boundaries are explicit and enforceable
- apply sequence remains additive and non-destructive

## Apply Handoff
`APPLY_PR_DEBUG_SURFACES_INSPECTORS` should implement only approved read-only seams and keep project-specific extraction outside shared engine-debug surfaces.
