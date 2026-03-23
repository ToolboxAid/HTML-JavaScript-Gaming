Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Engine Class Usage Alignment + Guardrail

## Goal
Perform the smallest possible full alignment pass by normalizing known deep-import drift onto canonical public engine barrels across shipped samples and Asteroids, then add a focused guardrail to prevent regression.

## Why This Combined PR Is Safe
The audit found:
- no stale engine class names
- no `REVIEW_REQUIRED` ambiguity
- no proven shipped usage that lacks a canonical replacement
- the drift is mechanical and low-risk

So this PR combines:
1. scene barrel normalization across samples and Asteroids
2. Asteroids barrel cleanup for known public subsystems
3. guardrail validation to keep the alignment from regressing

## In Scope
- `samples/`
- `games/Asteroids/`
- focused validation/tests for import guardrails
- `tests/run-tests.mjs` only if required

## Out of Scope
- engine/runtime behavior changes
- gameplay changes
- engine API redesign
- broad refactors
- speculative cleanup outside proven drift
- new public barrel design work

## Canonical Import Rule For This PR
When `engine/<subsystem>/index.js` exists, samples and games should use that public barrel.

Approved direct import exception:
- `engine/core/Engine.js`

## Required Changes

### 1. Scene barrel normalization
Replace direct sample/game imports of:
- `engine/scenes/Scene.js`

with:
- `engine/scenes/index.js`

Use the barrel-provided `Scene` export and preserve behavior.

### 2. Asteroids public barrel alignment
Replace known Asteroids deep imports with the corresponding current public barrels:
- `engine/fx/ParticleSystem.js` -> `engine/fx/index.js`
- `engine/collision/polygon.js` -> `engine/collision/index.js`
- `engine/utils/math.js` -> `engine/utils/index.js`
- `engine/tooling/CapturePreviewRuntime.js` -> `engine/tooling/index.js`
- plus the scene barrel normalization above

Do not widen the scope beyond imports already proven by the audit.

### 3. Guardrail validation
Add a focused validation check that catches new deep imports into engine subsystems that already expose `index.js`, while allowing the approved direct exception:
- `engine/core/Engine.js`

The guardrail should be:
- narrow
- explainable
- easy to maintain
- targeted at shipped samples/games

### 4. Preserve behavior
This PR must not change:
- engine runtime behavior
- sample/game gameplay behavior
- rendering/timing/lifecycle semantics

## Acceptance Criteria
- samples and Asteroids no longer deep-import `engine/scenes/Scene.js`
- Asteroids known deep imports align to public barrels
- a guardrail exists to catch future deep-import regressions
- no runtime behavior changes are introduced
- `engine/core/Engine.js` remains the approved direct-import exception
