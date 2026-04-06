# APPLY_PR_DEBUG_SURFACES_INSPECTORS

## Purpose
Apply the approved inspector-layer build exactly as defined by:
- PLAN_PR_DEBUG_SURFACES_INSPECTORS
- BUILD_PR_DEBUG_SURFACES_INSPECTORS

## Apply Scope
Promote the inspector layer into the repo in a controlled, non-invasive way.

Included inspector surfaces:
- Entity inspector
- Component inspector
- State diff viewer
- Timeline debugger
- Event stream viewer

Included contracts:
- InspectorRegistry
- InspectorContext
- FrameBufferProvider
- EventStreamProvider

## Hard Rules
- Apply only approved BUILD scope
- No runtime mutation APIs
- No unrelated engine changes
- No breaking sample behavior
- Preserve engine/runtime separation
- Debug surfaces remain optional

## Validation Requirements
- Inspector surfaces render through approved debug pathways
- Read-only behavior is preserved
- Frame buffer remains bounded
- Event stream viewer is passive/read-only
- Existing samples still run
- No regressions outside inspector scope

## Roadmap Update
Update only bracket states in docs/dev/BIG_PICTURE_ROADMAP.md

Track I:
- Entity inspector -> [x]
- Component inspector -> [x]
- State diff viewer -> [x]
- Timeline debugger -> [x]
- Event stream viewer -> [x]

Do not modify roadmap wording, order, headings, or structure.

## Output
Create:
<project folder>/tmp/APPLY_PR_DEBUG_SURFACES_INSPECTORS_delta.zip