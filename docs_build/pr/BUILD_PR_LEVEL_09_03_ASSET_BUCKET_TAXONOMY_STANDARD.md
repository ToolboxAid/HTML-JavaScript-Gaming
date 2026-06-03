# BUILD_PR — LEVEL 09.03 ASSET BUCKET TAXONOMY STANDARD

## Purpose
Standardize asset folder taxonomy across games, samples, and tools so ownership is clear and asset
types are easy to find, package, and evolve.

## Decision
Use **type-first buckets under each owner `assets/` folder**.

### Recommended pattern
- `games/<GameName>/assets/`
- `samples/<SampleName>/assets/`
- `tools/<ToolName>/assets/`

Inside each owner `assets/`, use the following standard buckets:

- `images/`
- `sprites/`
- `tiles/`
- `backgrounds/`
- `icons/`
- `audio/`
- `music/`
- `midi/`
- `fonts/`
- `data/`
- `shaders/`
- `ui/`
- `video/`

## Key decision on `platform/`
**Do not keep `platform/` as a default asset bucket.**

Reason:
- `platform` describes theme/source/context, not type
- it becomes a junk-drawer bucket
- it overlaps with true asset types like images, audio, icons, fonts, and data
- it will age poorly once MIDI/player/editor work expands the media surface

## What to do instead
Move contents of any existing `platform/assets` into the correct type buckets under the owning scope.

Examples:
- platform PNG/SVG art -> `assets/images/` or `assets/icons/`
- platform sprite sheets -> `assets/sprites/`
- platform tile maps / payload JSON -> `assets/data/` or `assets/tiles/`
- platform audio FX -> `assets/audio/`
- platform music tracks -> `assets/music/`
- future MIDI songs / patterns -> `assets/midi/`
- platform fonts -> `assets/fonts/`

## Allowed exception
A theme/domain subfolder may exist **inside** a type bucket when needed.

Examples:
- `assets/images/platform/`
- `assets/audio/platform/`
- `assets/midi/platform/`

This preserves theme grouping without losing type clarity.

## Why this is the best long-term choice
This approach gives:
- clear ownership
- clear type grouping
- easy packaging/export
- easy tooling
- easy future MIDI/editor support
- less ambiguity than `platform/assets`

## Naming guidance
Use plural, lowercase bucket names:
- good: `images`, `icons`, `fonts`, `audio`
- avoid: `img`, `snd`, `fontFiles`, `platformAssets`

## Classification rules
### `images/`
Raster and general image payloads not better classified elsewhere.

### `sprites/`
Sprite sheets, frame atlases, sprite-specific PNG/JSON pairs.

### `tiles/`
Tile sheets, tile atlases, tile metadata tied to tile rendering.

### `backgrounds/`
Parallax layers, static scene backdrops, panorama payloads.

### `icons/`
Small symbolic UI/app/tool icons.

### `audio/`
Short sound effects and non-musical audio cues.

### `music/`
Rendered music tracks (mp3, ogg, wav, etc).

### `midi/`
MIDI files, patterns, sequences, and future editor/player assets.

### `fonts/`
Font payloads and font metadata.

### `data/`
JSON, TMX-like payloads, level data, tuning payloads, manifests.

### `shaders/`
Shader source/assets if present.

### `ui/`
UI skin assets not already better classified as icons/images/fonts.

### `video/`
Video payloads.

## Scope
Docs-first standard only.
Apply to:
- games
- samples
- tools

## Migration rule
1. owner-specific assets stay under the owner
2. remove default `platform/` asset bucket
3. preserve exact payloads
4. update references
5. if theme grouping is needed, nest `platform/` under the correct type bucket
6. do not move runtime/platform code

## Acceptance criteria
1. owner asset folders use standard type buckets
2. `platform/` is not used as a top-level default asset bucket
3. assets are classified by type first
4. references are updated
5. future MIDI assets have a defined home: `assets/midi/`
6. no runtime/platform code moved

## Out of scope
- engine/runtime refactors
- media conversion
- audio pipeline redesign
- MIDI engine/editor implementation
