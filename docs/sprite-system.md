# Sprite System

This repo supports both shape-driven and sprite-driven rendering. The sprite-related code is already enough to serve as the foundation for a reusable 2D sprite system.

## Current sprite-related areas

The main files and folders tied to sprite work are:

- `engine/core/sprite.js`
- `engine/objects/objectSprite.js`
- `engine/objects/objectPNG.js`
- `tools/SpriteEditor/`
- `engine/palettes.js`
- `engine/palettesList.js`
- `engine/gfx/`

Together, these suggest a flexible path that supports:

- pixel-style sprite construction
- palette-driven artwork
- PNG-backed sprites
- editor-assisted sprite workflows

## Sprite roles in the repo

### `engine/core/sprite.js`
A shared sprite utility layer.

### `engine/objects/objectSprite.js`
An object type designed for sprite-backed entities.

### `engine/objects/objectPNG.js`
A useful option for image-based entities that rely on PNG assets.

### `tools/SpriteEditor/`
The authoring side of the workflow. This is where sprite design and iteration can become faster and more consistent.

## Conceptual sprite pipeline

A clean way to view the repo's sprite pipeline is:

```text
Sprite design
  -> palette selection
  -> sprite data or PNG asset
  -> sprite-backed object
  -> animation / state updates
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
  image or frame source
  frame width / height
  current animation
  current frame index
  facing direction
  scale
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

In this repo, those behaviors can live either directly on sprite-aware object classes or in shared helper utilities.

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

## Relationship to object classes

The current object hierarchy is well suited for sprite work.

```text
ObjectStatic      position and bounds
ObjectDynamic     adds movement
ObjectKillable    adds state/life-cycle
ObjectSprite      adds sprite rendering behavior
```

A sprite-heavy game can mix those ideas depending on the object's needs.

For example:

- a background prop may only need static sprite behavior
- a player may need dynamic movement and animated sprite states
- an enemy may need dynamic movement plus killable state transitions

## Sprite editor workflow

The Sprite Editor should become the hub for authoring and maintaining sprite assets.

A good workflow is:

1. Build or edit sprite data in `tools/SpriteEditor/`.
2. Save or export the result in a format your game can load.
3. Keep sprite data grouped by game or by reusable engine asset type.
4. Attach the sprite to an object class or scene.

## Palette strategy

Because the repo includes palette files, it is a good fit for retro-style art workflows.

Recommended direction:

- define shared palettes centrally
- reuse palettes across multiple games where possible
- keep game-specific palettes separate when needed
- avoid hard-coding colors all over game logic files

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
Use delta-time-based animation updates so frame speed does not depend on browser speed.

### 3. Keep sprite data separate from behavior
A sprite definition should describe frames and animations. Object classes should describe game behavior.

### 4. Add sprite sheets where useful
For larger characters or repeated animations, sprite-sheet support can reduce per-asset overhead.

### 5. Let the Sprite Editor define more of the pipeline
The more consistent the editor output becomes, the easier every game becomes to maintain.

## Bottom line

The repo already has the pieces for a practical 2D sprite pipeline. The next step is to make those pieces consistent across games so sprites, animation states, palettes, and editor output all work together as one system.

