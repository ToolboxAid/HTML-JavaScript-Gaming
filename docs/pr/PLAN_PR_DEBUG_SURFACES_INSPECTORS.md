# PLAN_PR_DEBUG_SURFACES_INSPECTORS

## Objective
Introduce a read-only inspector layer:
- Entity inspector
- Component inspector
- State diff viewer
- Timeline debugger
- Event stream viewer

## Constraints
- Docs-only PR
- No runtime mutation
- Use existing debug providers only

## Contracts
- InspectorRegistry
- InspectorContext
- FrameBufferProvider (bounded)
- EventStreamProvider (read-only)

## Acceptance
- No performance regression
- No runtime changes
- Inspectors render correctly