Toolbox Aid
David Quesenberry
03/23/2026
TASKS.md

# TASKS — Engine Class Usage Alignment + Guardrail

- [ ] Normalize sample scene imports from `engine/scenes/Scene.js` to `engine/scenes/index.js`
- [ ] Normalize Asteroids scene imports to `engine/scenes/index.js`
- [ ] Normalize Asteroids FX imports to `engine/fx/index.js`
- [ ] Normalize Asteroids collision imports to `engine/collision/index.js`
- [ ] Normalize Asteroids utils imports to `engine/utils/index.js`
- [ ] Normalize Asteroids tooling imports to `engine/tooling/index.js`
- [ ] Add a focused import guardrail validation for samples/games
- [ ] Allow `engine/core/Engine.js` as the approved direct-import exception
- [ ] Update test runner only if required
- [ ] Validate no runtime/gameplay behavior changed
- [ ] Confirm no broader cleanup slipped into this PR
