# PR Plan — engine/core architecture boundary pass

## Scope
`engine/core`

## Goal
Create a low-risk architecture PR that clarifies `engine/core` as the runtime boundary, reduces boundary ambiguity, and prepares later refactors without changing core runtime behavior.

## Why this PR first
`engine/core` is the architectural center of the repo:
- `GameBase` is the runtime owner
- `RuntimeContext` is the runtime façade
- several non-runtime files still live beside them, weakening folder meaning

A boundary-first PR gives the repo a clear contract before higher-risk lifecycle or service refactors.

## What this PR should do
1. Define `engine/core` as the runtime layer in docs.
2. Classify `engine/core` modules as:
   - public
   - internal
   - transitional / candidate-to-move
3. Document approved consumer entry points.
4. Document files that consumers should avoid importing directly.
5. Add follow-up notes for future extraction work.

## What this PR should NOT do
- no runtime lifecycle behavior changes
- no constructor/startup refactor yet
- no service-instance conversion yet
- no file moves yet unless purely documentation references require it

## Proposed boundary classification

### Public
- `gameBase.js`

### Internal
- `runtimeContext.js`
- `fullscreen.js`
- `performanceMonitor.js`

### Transitional / candidate-to-move
- `canvasUtils.js`
- `canvasText.js`
- `canvasSprite.js`
- `sprite.js`
- `tileMap.js`
- `spriteFrameUtils.js`

## Intended consumer guidance
Games and samples should treat:
- `GameBase` as the main runtime entry point

Games and samples should avoid direct imports from:
- runtime context internals
- fullscreen/performance internals
- low-level canvas helper internals unless explicitly documented as allowed for engine-internal demos

## Files to update in this PR
- `docs/ENGINE_STANDARDS.md`
- `docs/ENGINE_API.md`
- `docs/reviews/architecture-review-v1.md`
- `docs/reviews/pr-roadmap.md`

## Optional repo docs additions
- `docs/ENGINE_BOUNDARIES.md`
- `docs/prs/PR-001-engine-core-boundary.md`

## Acceptance criteria
- `engine/core` runtime role is clearly documented
- public/internal/transitional classification exists
- consumer guidance is explicit
- no runtime behavior changes
- next refactor PRs are easier because the boundary is written down

## Follow-up PRs enabled by this plan
- explicit runtime start
- disposable/service registry
- runtime context narrowing
- core file relocation out of `engine/core`
