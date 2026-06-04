# BUILD_PR_VECTOR_SHOWCASE_AND_GEOMETRY_RUNTIME_FINAL

## Purpose
Deliver the final public-facing vector platform showcase and deterministic vector geometry runtime finalization in one surgical build PR.

## Scope
In scope:
- registry-driven showcase surface for the active first-class tools
- mandatory engine theme framing for the active tools platform
- explicit deterministic vector geometry runtime policy
- stable transform, render-order, and precision contract visibility
- preserved-but-excluded legacy sprite tooling

Out of scope:
- gameplay feature work
- engine rewrites
- duplicate tool navigation lists outside the registry
- deletion of preserved sprite paths

## Active First-Class Tools
- `toolbox/Vector Map Editor/`
- `toolbox/Vector Asset Studio/`
- `toolbox/Tilemap Studio/`
- `toolbox/Parallax Scene Studio/`

## Preserved But Excluded
- actual preserved legacy path on disk: `toolbox/SpriteEditor_old_keep/`
- preserved current sprite workspace on disk: `toolbox/Sprite Editor/`
- neither preserved sprite path appears in the active platform showcase or shared navigation

## Modules Created Or Changed
- `toolbox/toolRegistry.js`
- `toolbox/renderToolsIndex.js`
- `toolbox/index.html`
- `toolbox/shared/platformShell.css`
- `toolbox/shared/vectorGeometryRuntime.js`
- `tests/tools/VectorGeometryRuntime.test.mjs`
- `docs_build/pr/BUILD_PR_VECTOR_SHOWCASE_AND_GEOMETRY_RUNTIME_FINAL.md`
- `docs_build/dev/COMMIT_COMMENT.txt`

## Showcase Surface Summary
- the tools landing surface remains registry-driven through `toolbox/toolRegistry.js`
- active showcase cards now render richer public-facing metadata from the registry instead of hardcoded per-page content
- each first-class tool card now exposes its canonical open action and registry-owned sample/help entry points where available
- the landing page explicitly calls out the shared engine theme and deterministic geometry runtime proof without duplicating the active tool list outside the registry

## Geometry Runtime Finalization
- `toolbox/shared/vectorGeometryRuntime.js` now exports `VECTOR_GEOMETRY_RUNTIME_POLICY`
- the policy makes the deterministic runtime contract explicit:
  - fixed six-decimal rounding
  - epsilon `0.000001`
  - transform order `scale -> rotate -> translate`
  - render order `layer order -> shape order`
  - collision primitives follow render order
- prepared runtime assets now carry the shared `runtimePolicy` payload and a deterministic policy report

## Shared Boundaries Preserved
- `src/engine/ui/hubCommon.css` remains the engine theme source of truth
- `toolbox/shared/platformShell.css` remains the shared tool-shell layer consuming engine theme tokens
- `toolbox/toolRegistry.js` remains the single source of truth for active tool visibility and showcase metadata
- geometry runtime behavior remains shared infrastructure, not tool-specific logic

## Validation Performed
- `node --check toolbox/toolRegistry.js`
- `node --check toolbox/renderToolsIndex.js`
- `node --check toolbox/shared/platformShell.js`
- `node --check toolbox/shared/vectorGeometryRuntime.js`
- `node --check scripts/validate-active-tools-surface.mjs`
- `node --check tests/tools/VectorGeometryRuntime.test.mjs`
- `node scripts/validate-active-tools-surface.mjs`
- `node scripts/run-node-tests.mjs`

## Validation Summary
- active showcase cards still come from the registry only
- active landing and navigation still exclude preserved sprite paths
- no obsolete deprecated sprite-rename references remain in the validated surface
- active tools still load the engine theme and shared shell
- repeated vector geometry runtime preparation now asserts deep deterministic equality in tests
- vector-native template and sample-game flows continue to consume `runtimeKind: "vector-geometry"` assets under the shared runtime contract

## Follow-Up Recommendations
- keep future showcase-card changes in `toolbox/toolRegistry.js` and `toolbox/renderToolsIndex.js`
- keep future geometry runtime precision changes centralized in `toolbox/shared/vectorGeometryRuntime.js`
- avoid adding tool-local geometry policy forks
