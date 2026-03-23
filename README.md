Toolbox Aid
David Quesenberry
03/23/2026
README.md

# BUILD_PR — Engine Class Usage Alignment + Guardrail

## Purpose
Complete engine class usage alignment across shipped samples and games in one mechanical, low-risk pass, then add a guardrail to keep the repo aligned.

## Goal
- normalize samples and games onto canonical public engine barrels
- eliminate known deep-import drift where public barrels already exist
- add a focused guardrail so future deep-import regressions are caught early

## Scope
- `samples/`
- `games/Asteroids/`
- test/validation files needed for the guardrail
- `tests/run-tests.mjs` only if required

## Constraints
- No runtime behavior changes
- No engine API redesign
- No gameplay changes
- No new engine barrels in this PR
- Treat `engine/core/Engine.js` as the approved direct import exception
- Keep this mechanical and evidence-based

## Expected Outcome
- scene imports use `engine/scenes/index.js`
- Asteroids deep imports align to public barrels for scenes/fx/collision/utils/tooling
- a focused validation check prevents reintroducing deep imports where a public barrel already exists
