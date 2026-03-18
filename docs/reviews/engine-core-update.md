# engine/core Architecture Update Summary

## Key Changes Recommended

1. Split engine/core responsibilities
- Keep: GameBase, RuntimeContext
- Move graphics/utilities elsewhere

2. Add explicit start()
- Remove constructor side-effects
- Add start() lifecycle

3. Replace destroy conventions
- Add disposable registry pattern

4. Keep RuntimeContext narrow
- Prevent god-object growth

5. Move static services to instances (future)

## Files to Update

- engine/core/gameBase.js
- engine/core/runtimeContext.js

## Next PR Suggested

PR-001: Core Boundary Cleanup
