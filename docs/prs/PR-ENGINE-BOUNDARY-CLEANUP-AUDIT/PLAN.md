Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# PLAN_PR - Engine Boundary Cleanup Audit

## 0) Audit Scope + Snapshot
- Audited: `engine/` (all top-level modules) and `tests/engine/`.
- Result: `tests/engine/` does not exist (blocking required-scope parity).
- Evidence:
  - `tests/README.md:3-9` confirms engine-boundary intent, but no dedicated `tests/engine/` tree is present.
  - Current test execution is explicit-registration based in `tests/run-tests.mjs:7-34` and `tests/run-tests.mjs:36-62`.

---

## 1) Engine Module Inventory (Ownership + Architecture Fit)

| Path | Purpose | Ownership Bucket(s) | Fit | Reason |
| --- | --- | --- | --- | --- |
| `engine/core/` | loop/runtime orchestration | `CORE_ENGINE`, `BROWSER_ADAPTER`, `UNCLEAR_OWNERSHIP` | `MIXED` | Core loop is valid, but direct browser scheduler/perf globals and settings policy defaults are embedded in `Engine`. |
| `engine/render/` | renderer contracts + canvas impl | `RENDERER_ONLY` | `GOOD` | Clear renderer boundary and concrete adapter split. |
| `engine/scenes/` | scene lifecycle + transitions | `SCENE_LIFECYCLE`, `RENDERER_ONLY` | `MIXED` | Transition implementation reaches through renderer internals (`ctx`) instead of renderer contract. |
| `engine/input/` | input abstractions + browser integration | `INPUT_ABSTRACTION`, `BROWSER_ADAPTER` | `MIXED` | Good abstractions, but default/browser coupling still leaks into constructors and attach paths. |
| `engine/runtime/` | runtime platform helpers | `BROWSER_ADAPTER` | `MIXED` | Correct ownership, but partial global guards and implicit browser assumptions remain. |
| `engine/theme/` | document/page theming | `BROWSER_ADAPTER` | `MIXED` | Browser-specific by nature, but unguarded direct `document` usage in public method. |
| `engine/persistence/` | storage + serialization | `CORE_ENGINE`, `BROWSER_ADAPTER` | `MIXED` | Useful abstraction, but default localStorage dependency is not null-safe for non-browser contexts. |
| `engine/tooling/` | debug/dev tools | `BROWSER_ADAPTER`, `STATIC_GLOBAL_DEBT` | `MIXED` | Mostly tooling-owned, but global flags and DOM coupling are unmanaged. |
| `engine/release/` | release and packaging helpers | `CORE_ENGINE`, `GAMEPLAY_POLICY_LEAK`, `UNCLEAR_OWNERSHIP` | `POOR` | Packaging logic hardcodes sample runtime entry paths from within engine layer. |
| `engine/prefabs/` | prefab constructors | `GAMEPLAY_POLICY_LEAK` | `POOR` | Encodes gameplay policy (player/enemy/projectile constants) in engine. |
| `engine/automation/` | automation/benchmark harnesses | `CORE_ENGINE`, `BROWSER_ADAPTER` | `MIXED` | Mixed environment assumptions (`performance`) and limited adapter seams. |
| `engine/ai/` | reusable behavior/pathing helpers | `CORE_ENGINE` | `GOOD` | Generic behavior logic and bounded scope. |
| `engine/assets/` | asset registry/loading/optimization | `CORE_ENGINE`, `BROWSER_ADAPTER` | `MIXED` | Mostly sound ownership, some browser-adapter assumptions via loaders. |
| `engine/audio/` | audio backend + orchestration | `BROWSER_ADAPTER` | `MIXED` | Correctly adapter-like but strongly coupled to WebAudio/fetch/global timers. |
| `engine/collision/` | geometry collision stack | `CORE_ENGINE` | `GOOD` | Domain-pure utility systems. |
| `engine/combat/` | combat utility rules | `CORE_ENGINE` | `GOOD` | Self-contained service-level logic. |
| `engine/ecs/` | ECS world container | `CORE_ENGINE` | `GOOD` | Clear storage/ownership boundaries. |
| `engine/entity/` | core entity data types | `CORE_ENGINE` | `GOOD` | Small focused contracts. |
| `engine/events/` | event bus | `CORE_ENGINE` | `GOOD` | No platform leakage. |
| `engine/fx/` | generic particle fx helpers | `CORE_ENGINE` | `GOOD` | Reusable visualization model via renderer contract. |
| `engine/game/` | mode/state helpers | `CORE_ENGINE` | `GOOD` | Limited and generic scope. |
| `engine/interaction/` | interaction systems | `CORE_ENGINE` | `GOOD` | Generic ECS-style behavior. |
| `engine/level/` | level loading | `CORE_ENGINE` | `MIXED` | Ownership is right; test coverage is thin. |
| `engine/localization/` | localization service | `CORE_ENGINE` | `GOOD` | Generic and bounded. |
| `engine/logging/` | logger/error boundary | `CORE_ENGINE` | `GOOD` | Clear concerns. |
| `engine/memory/` | disposable/pool utilities | `CORE_ENGINE` | `GOOD` | Utility-scoped and testable. |
| `engine/network/` | networking stack | `CORE_ENGINE` | `MIXED` | Broad ownership footprint; some helper duplication and coverage gaps. |
| `engine/pipeline/` | content pipeline systems | `CORE_ENGINE` | `MIXED` | Ownership plausible but broad and lightly validated by focused tests. |
| `engine/security/` | packet/session validation | `CORE_ENGINE` | `GOOD` | Domain-specific and decoupled. |
| `engine/state/` | state-machine helper | `CORE_ENGINE` | `GOOD` | Narrow concern. |
| `engine/systems/` | ECS systems | `CORE_ENGINE` | `MIXED` | Core ownership is valid; module breadth is high, tests are uneven. |
| `engine/tilemap/` | tilemap runtime helpers | `CORE_ENGINE`, `RENDERER_ONLY` | `MIXED` | Sound intent, limited direct coverage. |
| `engine/ui/` | lightweight UI framework | `CORE_ENGINE`, `RENDERER_ONLY` | `GOOD` | Uses renderer abstraction. |
| `engine/utils/` | small shared helpers | `CORE_ENGINE` | `GOOD` | Mostly tiny, reusable primitives. |
| `engine/vector/` | vector helpers | `CORE_ENGINE` | `GOOD` | Utility-pure. |
| `engine/world/` | world systems | `CORE_ENGINE` | `GOOD` | Generic system primitives with test touchpoints. |

---

## 2) Exact Boundary Violations

### Renderer boundary leaks / `ctx` usage outside renderer
1. `engine/scenes/TransitionScene.js:32-52`
- Uses `renderer?.ctx` and directly mutates `ctx.globalAlpha`.
- Violates renderer abstraction (`RENDERER_ONLY`) by depending on canvas internals in scene layer.

2. `engine/core/Engine.js:22` and `engine/core/Engine.js:26`
- Core runtime stores raw `ctx` and couples concrete canvas context creation to engine core constructor.
- Ownership drift: core + browser adapter concerns mixed in one class.

### DOM/browser globals in core runtime or cross-cutting services
1. `engine/core/Engine.js:68-69`, `engine/core/Engine.js:74`, `engine/core/Engine.js:88`, `engine/core/Engine.js:102`, `engine/core/Engine.js:113`, `engine/core/Engine.js:119`, `engine/core/Engine.js:127`
- Direct `performance` + `requestAnimationFrame` + `cancelAnimationFrame` usage without scheduler/time adapter.

2. `engine/input/InputService.js:14`, `engine/input/InputService.js:27-30`, `engine/input/InputService.js:52-57`
- Default constructor references `window`; runtime path references `navigator`.
- Limits non-browser runtime stability unless callers inject safe targets.

3. `engine/input/ActionInputService.js:56-59`, `engine/input/ActionInputService.js:61-63`, `engine/input/ActionInputService.js:440-445`
- Direct `window` listener ownership and `navigator.getGamepads` usage at service layer.

4. `engine/theme/Theme.js:22-31`
- Direct `document` mutation in service method without browser guard or document adapter.

5. `engine/persistence/StorageService.js:8`, `engine/persistence/StorageService.js:13`, `engine/persistence/StorageService.js:17`
- Defaults to `globalThis.localStorage` and assumes `setItem/getItem` are present.

6. `engine/tooling/CapturePreviewRuntime.js:27-30`, `engine/tooling/CapturePreviewRuntime.js:48-50`
- Direct DOM font loading and writes to `window.__captureReady`.

### Gameplay-policy leakage / unclear ownership
1. `engine/prefabs/PrefabFactory.js:7-61`
- Hardcoded player/enemy/projectile/pickup gameplay dimensions, speeds, labels in engine layer.

2. `engine/release/DistributionPackager.js:25`
- Hardcoded sample deployment entry `samples/${sampleId}/index.html` in engine release layer.

3. `engine/core/Engine.js:33-39`
- Core constructor seeds product/gameplay policy defaults (`difficulty`, audio/video preferences), mixing runtime orchestration and app policy ownership.

### Static/global shared-state debt
1. `engine/tooling/CapturePreviewRuntime.js:48-50`
- Writes mutable global coordination state (`window.__captureReady`), no scoped state owner.

---

## 3) Test Health Summary (`tests/engine/` Audit + Blockers)

## Required path blocker
- `tests/engine/` directory is absent; required scope target cannot be audited directly.

## Structural blockers
1. Central manual test registration
- Evidence: `tests/run-tests.mjs:7-34` + `tests/run-tests.mjs:36-62`.
- Blocker type: `design-coupling`.
- Impact: New tests are easy to omit; boundary regressions can be silently unexecuted.

2. Browser-adapter coverage requires bespoke stubs per test
- Evidence: browser-coupled services in `engine/input/*`, `engine/theme/*`, `engine/persistence/*`, `engine/core/Engine.js`.
- Blocker type: `runtime/design-coupling`.
- Impact: higher friction for boundary-focused unit tests and lower confidence in non-browser execution paths.

3. Top-level engine areas with no direct test import coverage in current test tree
- Areas: `animation`, `camera`, `components`, `debug`, `ecs`, `game`, `interaction`, `level`, `prefabs`, `state`, `systems`, `tilemap`.
- Blocker type: `design-coupling` (coverage gap).
- Impact: ownership drift can accumulate in less-tested modules.

---

## 4) Recommended First BUILD_PR (Smallest Safe)

## BUILD_PR
`PR-ENGINE-BOUNDARY-CLEANUP-STEP1-ADAPTER-SEAMS`

## Goal
Eliminate highest-risk boundary leaks without behavior changes.

## Minimal Implementation Set
1. Renderer seam fix (highest-priority leak)
- Replace direct `renderer.ctx` usage in `TransitionScene` with renderer-level alpha API (`withAlpha`/equivalent abstraction) implemented in renderer contract + canvas adapter.

2. Core scheduler/time seam
- Add injectable scheduler/time providers to `Engine` (defaults preserve current browser behavior).
- Keep existing runtime behavior identical while enabling deterministic/non-browser tests.

3. Browser adapter guards for testability
- Add safe-null guards and injectable document/storage targets for `Theme` and `StorageService`.
- Preserve existing browser behavior when globals exist.

4. Test tree normalization
- Create `tests/engine/` and migrate/add boundary tests for:
  - transition render alpha seam
  - engine scheduler/time injection
  - theme/storage non-browser guard behavior

## Explicit Out of Scope (for STEP1)
- Prefab de-policy refactor.
- Release packager sample-path ownership redesign.
- Broad systems/module reclassification.

## Acceptance
- No direct `ctx` access outside renderer implementation.
- `Engine` works with injected scheduler/time adapters.
- `Theme`/`StorageService` no longer throw in non-browser default tests.
- `tests/engine/` exists and is wired into `tests/run-tests.mjs`.

---

## 5) No-Behavior-Change Statement
This PR is documentation/audit only. It records ownership classification, boundary violations, and test blockers. It does not modify runtime source behavior.
