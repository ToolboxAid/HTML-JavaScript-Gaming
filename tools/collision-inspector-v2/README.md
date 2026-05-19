# Collision Inspector V2

Collision Inspector V2 loads game manifests and inspects collision behavior through the shared engine Object Vector collision path. It uses Object Vector Studio V2 `objects[].shapes[]` geometry only, and it does not create fallback vector maps or ship hardcoded Asteroids geometry.

## Primary Flow

1. Open `tools/collision-inspector-v2/index.html`.
2. Load a game manifest from disk, use `gameId=Asteroids`, or click `Load Asteroids Manifest`.
3. Select Object A and Object B from the manifest object list.
4. Let the tool auto-select the collision mode for the pair, or manually override it.
5. Drag either object on the canvas and change object rotation inputs to inspect runtime orientation.
6. Adjust zoom in the Simulation panel when inspecting tight overlaps.

## Live Output

- collision true/false
- bounds and overlap state
- object origins and world origins
- object rotation and manifest shape rotations
- transformed point samples
- collision/debug log

Use the manifest file input in standalone mode, or launch with a Workspace Manager V2 `hostContextId` to hydrate the active workspace manifest automatically.
