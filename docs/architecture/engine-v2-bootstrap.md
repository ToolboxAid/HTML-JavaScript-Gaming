# Engine Bootstrap

## Intent

Start a parallel engine rewrite without touching the locked runtime.

## Boundary decisions

### Engine
Owns orchestration only:

- start/stop loop
- call update/render in the right order
- delegate scene switching
- delegate canvas access

### FrameClock
Owns frame timing only:

- delta calculation
- delta clamp
- reset behavior

### FixedTicker
Owns fixed-step accumulation only:

- accumulator
- fixed-step count
- alpha interpolation value

### CanvasSurface
Owns canvas/context only:

- resolve canvas element
- create 2D context
- clear surface
- resize surface

### Scene
Owns scene contract only:

- enter
- exit
- update
- render

### SceneManager
Owns active scene only:

- set scene
- transition lifecycle
- forward update/render calls

## Why this cut first

This slice creates the foundation needed for every future subsystem without dragging old object, renderer, input, or game rules into the rewrite.

## Next likely slices

1. input service boundary
2. asset loader boundary
3. world/entity boundary
4. renderer command boundary
5. collision boundary
