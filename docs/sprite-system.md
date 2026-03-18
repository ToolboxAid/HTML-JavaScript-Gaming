# Sprite System

This repo supports both shape-driven and sprite-driven rendering. The sprite-related code is already enough to serve as the foundation for a reusable 2D sprite system.

## Current sprite-related areas

The main files and folders tied to sprite work are:

- `engine/core/sprite.js`
- `engine/core/spriteFrameUtils.js`
- `engine/objects/objectSprite.js`
- `engine/objects/objectSpriteFrameConfig.js`
- `engine/objects/objectPNG.js`
- `tools/SpriteEditor/`
- `engine/renderers/assets/palettes.js`
- `engine/renderers/assets/palettesList.js`
- `engine/renderers/assets/colors.js`
- `engine/renderers/spriteRenderer.js`
- `engine/renderers/pngRenderer.js`
- `engine/animation/spriteController.js`
- `engine/animation/pngController.js`
- `engine/animation/animationStateBridge.js`
- `engine/animation/stateUtils.js`

Together, these suggest a flexible path that supports:

- pixel-style sprite construction
- palette-driven artwork
- PNG-backed sprites
- editor-assisted sprite workflows

## Sprite roles in the repo

### `engine/core/sprite.js`
A shared sprite utility layer for JSON sprite validation, palette conversion, text-to-sprite generation, and frame dimension helpers.

### `engine/core/spriteFrameUtils.js`
Shared frame and JSON helpers used by sprite validation, frame extraction, and dimension calculation.

### `engine/objects/objectSprite.js`
An object type for palette or JSON-frame sprites rendered through `SpriteRenderer`.

### `engine/objects/objectSpriteFrameConfig.js`
Normalizes single-frame arrays, multi-frame arrays, and JSON sprite assets into one runtime shape for `ObjectSprite`.

### `engine/objects/objectPNG.js`
A PNG sprite-sheet object with frame indexing, source-rect calculation, loading state, flip/rotation support, and preview helpers.

### `tools/SpriteEditor/`
The authoring side of the workflow. This is where sprite design and iteration can become faster and more consistent.

### `engine/animation/*Controller.js`
Animation state and frame progression controllers for sprite and PNG object flows.

### `engine/renderers/*Renderer.js`
The actual draw layer: `SpriteRenderer` renders frame arrays and RGB sprite data, while `PngRenderer` renders sprite-sheet frames.

## Two sprite paths in the current engine

The engine currently supports two main sprite workflows.

### 1. JSON / palette / frame-array sprites

This path is centered on `ObjectSprite`.

Use it when you want:

- retro pixel-art built from frame arrays
- palette-driven color workflows
- Sprite Editor style JSON assets
- lightweight frame-based animation without external image files

Current flow:

```text
frame array or JSON sprite
  -> ObjectSpriteFrameConfig.create(...)
  -> SpriteController
  -> SpriteRenderer.draw(...)
  -> CanvasUtils.drawSprite(...) or drawSpriteRGB(...)
```

### 2. PNG sprite-sheet sprites

This path is centered on `ObjectPNG`.

Use it when you want:

- image-backed characters or effects
- sprite sheets with source-rect animation
- frame offsets, rotation, or flip behavior
- image asset caching and loading state tracking

Current flow:

```text
PNG asset path + frame metadata
  -> ObjectPNG
  -> PngController
  -> PngRenderer.draw(...)
  -> Canvas drawImage(...)
```

## Conceptual sprite pipeline

A clean way to view the repo's sprite pipeline is:

```text
Sprite design
  -> sprite data or PNG asset
  -> object wrapper
  -> animation controller
  -> renderer
  -> draw to canvas
```

## Recommended sprite model

As this repo grows, every sprite-backed game object should ideally answer four questions:

1. What image or frame set do I use?
2. Where do I draw?
3. Which frame should I draw right now?
4. How does the current game state affect the frame?

That can be represented by a compact runtime model such as:

```text
Sprite
  frame source
  frame dimensions
  current frame index
  delay counter
  scale
  optional palette or image path
```

## Static sprites vs animated sprites

The repo can support both patterns.

### Static sprite
Good for pickups, decorations, obstacles, or UI elements.

### Animated sprite
Good for player movement, enemy movement, attacks, explosions, and state changes.

## How sprite objects should behave

A strong sprite object usually needs these responsibilities:

- track position
- track size or draw scale
- know its active frame
- update animation over time
- draw itself onto the canvas

In this repo, those behaviors are split more clearly:

- object classes own state and lifecycle
- animation controllers own frame stepping rules
- renderers own drawing
- utility helpers own validation, normalization, and conversion

## Animation states

For larger projects, animation should be grouped by meaning instead of by raw frame index.

Examples:

- `idle`
- `walk`
- `run`
- `jump`
- `attack`
- `hit`
- `die`

That approach pairs especially well with killable or state-driven objects.

Today, the engine already supports this pattern in a practical way:

- `ObjectSprite` separates living and dying frames
- `SpriteController` supports looping and final-frame progression
- `ObjectPNG` uses `PngController` plus lifecycle status hooks
- killable objects transition naturally through alive, dying, and dead phases

## Relationship to object classes

The current object hierarchy is well suited for sprite work.

```text
ObjectStatic      position and bounds
ObjectDynamic     adds movement
ObjectKillable    adds state/life-cycle
ObjectSprite      adds frame-array / JSON sprite behavior
ObjectPNG         adds PNG sprite-sheet behavior
```

A sprite-heavy game can mix those ideas depending on the object's needs.

For example:

- a background prop may only need static sprite behavior
- a player may need dynamic movement and animated sprite states
- an enemy may need dynamic movement plus killable state transitions

`engine/game/gameObject.js` also extends `ObjectPNG`, which makes the PNG-backed path the current default for the newer game-facing object facade layer.

## Sprite editor workflow

The Sprite Editor should become the hub for authoring and maintaining sprite assets.

A good workflow is:

1. Build or edit sprite data in `tools/SpriteEditor/`.
2. Save or export the result as JSON sprite data.
3. Load that data through `ObjectSprite` when you want palette or frame-array rendering.
4. Keep sprite data grouped by game or by reusable engine asset type.
5. Attach the sprite to an object class or scene.

## Palette strategy

Because the repo includes palette files, it is a good fit for retro-style art workflows.

Recommended direction:

- define shared palettes centrally
- reuse palettes across multiple games where possible
- keep game-specific palettes separate when needed
- avoid hard-coding colors all over game logic files

For JSON sprite assets, palette handling currently flows through `Sprite.convert2RGB(...)`, which converts symbolic sprite data into RGB-ready frame arrays before rendering.

## Suggested folder strategy for growth

As the repo matures, sprite assets will be easier to manage if they follow a consistent layout.

Example:

```text
games/
  Asteroids/
    assets/
      sprites/
      palettes/
      audio/
```

or, for shared assets:

```text
engine/
  assets/
    sprites/
    palettes/
```

Use shared engine assets only when they are truly generic.

## Recommendations for the next step

The next improvement to the sprite system should be standardization, not a rewrite.

### 1. Standardize naming
Pick one consistent naming pattern for sprite files, animation states, and exported asset data.

### 2. Standardize animation timing
Continue moving toward clearer frame-step conventions so animation speed is predictable across games.

### 3. Keep sprite data separate from behavior
A sprite definition should describe frames and animations. Object classes should describe game behavior.

### 4. Add sprite sheets where useful
PNG sprite-sheet support already exists. The next step is to standardize metadata and asset placement around it.

### 5. Let the Sprite Editor define more of the pipeline
The more consistent the editor output becomes, the easier every game becomes to maintain.

### 6. Standardize which path a project uses
For each game, pick a primary sprite path early:

- `ObjectSprite` for retro frame-array or palette-driven art
- `ObjectPNG` for image-backed sprite sheets

That keeps asset loading, animation, and renderer usage more predictable.

## Testing the sprite system

Sprite and animation behavior is covered by Node-safe engine tests in:

- `tests/engine/animation/stateUtilsTest.js`
- `tests/engine/animation/spriteControllerTest.js`
- `tests/engine/animation/pngControllerTest.js`
- `tests/engine/animation/animationStateBridgeTest.js`
- `tests/engine/objects/objectLifecycleTest.js`
- `tests/engine/objects/objectSpriteFrameConfigTest.js`

Run all default engine tests from the repository root:

```bash
npm test
```

The test runner loads entries from `tests/engine/testManifest.js`.

## Bottom line

The repo already has a practical 2D sprite pipeline with two usable tracks: frame-array or JSON sprites through `ObjectSprite`, and image-backed sprite sheets through `ObjectPNG`. The next step is to make those tracks more consistent across games so sprites, animation states, palettes, editor output, and asset metadata all work together as one system.

