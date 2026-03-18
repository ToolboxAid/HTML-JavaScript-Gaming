# Architecture Review v1

## engine/render findings

### Findings
1. The actual render folder in the repo is `engine/renderers/`, not `engine/render/`. Architecturally, this pass covers `engine/renderers`.

2. `engine/renderers/` has a mostly coherent top-level purpose: renderers and renderer support. The main reusable render modules are:
   - `primitiveRenderer.js`
   - `spriteRenderer.js`
   - `pngRenderer.js`
   - `vectorRenderer.js`
   - `rendererGuards.js`

   That center is solid.

3. The folder boundary is weakened by mixed abstraction levels:
   - renderer implementations live beside
   - asset catalogs (`assets/colors.js`, `assets/font5x6.js`, `assets/palettes.js`, `assets/palettesList.js`)
   - effect/entity-like behavior (`particleExplosion.js`)
   - a planning note file (`pixelRenderer.js.txt`)

   So `engine/renderers/` is partly a renderer subsystem, partly a render-assets bucket, and partly a staging area.

4. `PrimitiveRenderer` is the architectural center. It is a broad static drawing utility with many shape/debug helpers and private internals. This gives the repo one canonical low-level drawing API, which is good.

   The main architecture concern is scope: `PrimitiveRenderer` is both:
   - foundational drawing backend
   - high-level debug drawing helper

   That makes it powerful, but also increases the chance it becomes the rendering “god utility.”

5. `RendererGuards` is a good boundary helper. It centralizes:
   - renderability checks
   - offset normalization
   - line-width/number normalization

   This is a strong architectural move because it keeps renderer entry checks consistent.

6. The renderers are tightly coupled to `engine/core` canvas helpers:
   - `PrimitiveRenderer` depends on `CanvasUtils`
   - `SpriteRenderer` depends on `CanvasSprite`
   - `PngRenderer` depends on `CanvasUtils` and `CanvasText`

   This is workable, but it means the rendering subsystem is split across two folders:
   - low-level canvas primitives in `engine/core`
   - concrete renderers in `engine/renderers`

   The boundary is therefore not cleanly “all rendering lives here.”

7. `PngRenderer`, `SpriteRenderer`, and `VectorRenderer` are thin specializations over shared low-level helpers. That is good. Their responsibility is clear:
   - PNG image draw path
   - sprite frame draw path
   - vector/path draw path

   The downside is that the real rendering dependency graph is centered on `engine/core` canvas classes and `PrimitiveRenderer`, not on a self-contained render subsystem.

8. `particleExplosion.js` does not fit the same abstraction level as the renderer classes. It is not just a renderer; it is an effect object with:
   - state
   - particle generation
   - update logic
   - draw logic
   - lifecycle (`isDone`, `destroy`)

   This makes it feel closer to:
   - an object/effects subsystem
   - or a gameplay visual effect
   than a pure renderer module.

9. The assets subfolder is useful, but it mixes raw data and utility APIs:
   - `palettesList.js` is a data catalog
   - `colors.js` and `palettes.js` are static utility/service layers
   - `font5x6.js` is a font data holder with utility-class shape

   These likely deserve a clearer `render-assets` or `graphics-assets` boundary if the repo keeps growing.

10. Public/internal/private boundaries are still implicit.

   Best current classification:
   - public:
     - `PrimitiveRenderer`
     - `SpriteRenderer`
     - `PngRenderer`
     - `VectorRenderer`
   - internal:
     - `RendererGuards`
     - render asset helpers
   - misplaced / should move:
     - `ParticleExplosion`
     - `pixelRenderer.js.txt` (planning note, not runtime module)

### Risks
#### High
1. **Rendering split across `engine/core` and `engine/renderers`**
   The subsystem boundary is blurred because core owns important canvas rendering primitives while renderers owns higher-level draw logic.

2. **`PrimitiveRenderer` scope creep**
   It is already the canonical draw backend and also contains debug helpers. Without guardrails it can become an all-purpose graphics utility sink.

3. **Effect-object mixed into renderer subsystem**
   `ParticleExplosion` combines simulation state and rendering in the renderers folder, which muddies ownership boundaries.

#### Medium
4. **Asset/data/utilities mixed together**
   The `assets/` area combines catalogs, palette services, fonts, and color utilities under one renderers path.

5. **Folder naming and staging drift**
   `pixelRenderer.js.txt` is a planning artifact inside the live module tree, which weakens the production/runtime boundary.

6. **Static-global rendering assumptions**
   Most rendering entry points depend on global/static canvas utilities, which reduces isolation and multi-surface flexibility.

#### Lower
7. **Public API ambiguity**
   Consumers can likely import many helper modules directly because public vs internal render APIs are not explicitly documented.

### PR Candidates
#### PR-015 — Clarify render subsystem boundary
- Type: architecture
- Risk: medium
- Goal: define where rendering truly lives
- Suggested direction:
  - keep high-level renderers in `engine/renderers`
  - classify `CanvasUtils`, `CanvasSprite`, `CanvasText` as rendering internals or move them toward a dedicated render foundation area

#### PR-016 — Split `ParticleExplosion` out of `engine/renderers`
- Type: architecture/refactor
- Risk: medium
- Goal: move stateful visual effects into a more appropriate home such as:
  - `engine/effects/`
  - `engine/objects/effects/`
  - or `games/shared/effects/`

#### PR-017 — Split render assets from renderers
- Type: architecture/refactor
- Risk: low
- Goal: separate:
  - renderer implementations
  - asset catalogs
  - palette/color utilities
- Suggested destinations:
  - `engine/render-assets/`
  - `engine/graphics/assets/`

#### PR-018 — Keep `PrimitiveRenderer` low-level and move debug helpers out
- Type: architecture/refactor
- Risk: medium
- Goal: preserve `PrimitiveRenderer` as the core shape/path backend, while moving debug/bounds helpers into:
  - `DebugRenderer`
  - or `RenderDebugUtils`

#### PR-019 — Remove planning artifacts from runtime tree
- Type: cleanup/docs
- Risk: low
- Goal: move `pixelRenderer.js.txt` into docs, backlog, or ADR-style notes

## PR Roadmap Additions

### PR-015
Title: Clarify engine render subsystem boundaries
Scope: engine/renderers, engine/core
Risk: Medium
Status: pending

### PR-016
Title: Move ParticleExplosion out of engine/renderers
Scope: engine/renderers
Risk: Medium
Status: pending

### PR-017
Title: Split render assets from renderer implementations
Scope: engine/renderers/assets
Risk: Low
Status: pending

### PR-018
Title: Separate PrimitiveRenderer debug helpers from draw backend
Scope: engine/renderers
Risk: Medium
Status: pending

### PR-019
Title: Remove pixelRenderer planning artifact from runtime tree
Scope: engine/renderers
Risk: Low
Status: pending
