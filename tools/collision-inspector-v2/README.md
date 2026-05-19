# Collision Inspector V2

Collision Inspector V2 loads game manifests and inspects collision behavior using Object Vector Studio V2 `objects[].shapes[]` geometry. It does not create fallback vector maps or ship hardcoded Asteroids geometry.

## Primary Flow

1. Open `tools/collision-inspector-v2/index.html`.
2. Load a game manifest from disk, use `gameId=Asteroids`, or click `Load Asteroids Manifest`.
3. Select Object A and Object B from the manifest object list.
4. Drag either object on the canvas and change object rotation inputs to inspect runtime orientation.
5. Switch between Bounds, Vector, Pixel/Sprite, and Hybrid collision modes.

## Live Output

- collision true/false
- bounds and overlap state
- object origins and world origins
- object rotation and manifest shape rotations
- transformed point samples
- collision/debug log

Use the manifest file input in standalone mode, or launch with a Workspace Manager V2 `hostContextId` to hydrate the active workspace manifest automatically.
