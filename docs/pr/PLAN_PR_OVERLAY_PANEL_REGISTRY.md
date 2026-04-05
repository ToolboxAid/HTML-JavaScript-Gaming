Toolbox Aid
David Quesenberry
04/05/2026
PLAN_PR_OVERLAY_PANEL_REGISTRY.md

# PLAN PR
## Overlay Panel Registry

## Objective
Define a docs-only, execution-ready plan for a clean contract for debug overlay panels. This PR follows PLAN_PR -> BUILD_PR -> APPLY_PR, stays docs-first, and does not include implementation code.

## Why This PR Exists
The prior overlay boundary work separated the Dev Console from the Debug Overlay. The next step is to define how overlay panels plug in without coupling panel authors to overlay rendering internals, console command internals, or engine core details.

A panel registry contract should let the overlay remain:
- modular
- discoverable
- deterministic
- sample-safe
- easy to extend without one-off hacks

## Problem Statement
Without a registry contract, overlay panels tend to drift into one or more bad patterns:
- ad hoc panel creation inside overlay rendering code
- sample-specific conditional branches
- direct console-to-panel coupling
- no stable panel identity or ordering
- inconsistent visibility and refresh behavior
- hidden dependencies on runtime internals

That increases friction and makes future HUD/debug expansion fragile.

## Scope
This plan PR defines:
- the panel registry purpose
- the public panel contract
- panel identity and ordering rules
- panel registration lifecycle
- visibility rules
- data/read boundaries
- console and sample interaction limits
- validation expectations
- BUILD_PR and APPLY_PR sequencing targets

This plan PR does not define implementation code.

## Architecture Fit
This PR sits across the current architecture path:
- TOOLS: Dev Console may target registry-visible actions but does not own panel rendering
- CONTRACT: overlay panel registration and rendering must use a public contract
- RUNTIME: panels may read approved runtime selectors only
- DEBUG: overlay hosts the registry and panel lifecycle
- VISUAL: overlay draws registered panels in deterministic order

## Core Design Principle
The registry owns panel composition.
Each panel owns only its descriptor, visibility rule, and render/read behavior through approved interfaces.

## Proposed Runtime Components
### 1. OverlayPanelRegistry
Purpose:
- maintain the set of registered overlay panels
- provide deterministic enumeration for layout and drawing
- isolate panel lifecycle from overlay rendering internals

Responsibilities:
- register panels by id
- reject invalid or duplicate panel ids
- return panels in deterministic order
- expose registry snapshot for overlay host usage
- support optional enable/disable state per panel
- remain simple enough for sample-level integration

Non-responsibilities:
- no console command parsing
- no direct scene mutation
- no layout rendering
- no hidden runtime data collection

### 2. OverlayPanelDescriptor
Purpose:
- define the contract a panel must satisfy before registration

Required fields:
- `id`: stable unique string
- `title`: human-readable label
- `order`: numeric sort key
- `isEnabledByDefault`: initial visibility default
- `readModel(context)`: approved selector-based data read
- `render(context, model)`: panel draw routine through overlay-approved drawing APIs

Optional fields:
- `group`: logical category such as runtime, render, physics, scene, input
- `isVisible(context)`: conditional visibility gate
- `getHeight(context, model)`: height hint for stacked layout
- `getStatus(model)`: compact state label for future registry views

### 3. OverlayHost
Purpose:
- render visible panels using the registry snapshot

Responsibilities:
- request ordered panel list from registry
- evaluate visibility using approved context only
- call readModel before render
- draw panels without mutating panel descriptors
- isolate layout policy from panel authors

Non-responsibilities:
- no registration logic
- no console ownership
- no runtime state mutation

## Proposed Panel Contract Rules
### Panel Identity
- every panel must have a stable unique `id`
- ids are contract-level names, not display labels
- ids should be namespaced enough to avoid collisions, for example `runtime.fps` or `render.layers`

### Panel Ordering
- panel order must be deterministic
- primary sort: ascending `order`
- secondary sort: ascending `id`
- overlay host must not depend on registration call order for stability

### Panel Visibility
- the registry stores enabled/disabled state
- a panel may also have conditional runtime visibility via `isVisible(context)`
- visibility must not depend on direct DOM state or console text state

### Panel Data Access
- panels may only read from approved overlay context/selectors
- panels may not reach directly into arbitrary engine internals
- panel data reads should be side-effect free
- heavy computations should be pre-aggregated outside the panel when practical

### Panel Rendering
- render methods must draw only through overlay-approved drawing helpers or context
- render methods must not register commands, allocate global listeners, or mutate unrelated systems
- render methods should degrade gracefully when the model is incomplete

## Approved Context Boundary
The overlay host should provide a narrow panel context such as:
- frame timing snapshot
- scene identifier
- approved debug selectors
- overlay drawing helpers
- panel layout region
- feature flags

The panel context should not expose:
- raw console input state
- arbitrary engine mutation functions
- unrestricted scene object handles
- private overlay host internals

## Console Interaction Rules
Allowed:
- console commands may toggle panel visibility by panel id
- console commands may ask the registry for a list of panel ids/titles/status
- console commands may switch overlay presets if those presets are defined through approved registry/state contracts

Not allowed:
- console commands directly rendering panel content
- console commands mutating panel descriptor shape at runtime
- panels depending on console focus/history/autocomplete internals

## Sample Integration Rules
- sample scenes may register sample-specific panels through the public registry
- sample registration must happen through explicit sample bootstrap or debug setup
- sample panels must not bypass the registry and draw directly into overlay internals
- sample-specific panels should be removable without changing core overlay host behavior

## Suggested Minimal Panel Set for Initial Adoption
- `runtime.fps`
- `scene.identity`
- `render.layers`
- `input.state`
- `entities.count`

These should be enough to validate the contract without over-expanding scope.

## Failure and Validation Behavior
The registry should fail safely on:
- missing required descriptor fields
- duplicate panel ids
- invalid render/read handlers
- non-deterministic order values

Expected behavior:
- reject invalid panels
- preserve previous valid registry state
- emit debug-visible error output without crashing the sample

## Validation Targets for BUILD_PR
BUILD_PR should produce docs and implementation guidance that prove:
- panel registration is deterministic
- duplicate ids are rejected
- disabled panels are skipped cleanly
- visible panels render in sorted order
- panels use approved selector/context reads only
- sample-level registration works in `MultiSystemDemoScene.js`
- Dev Console interaction remains command-driven only

## Sequencing
### PLAN_PR output
- contract definition
- component responsibilities
- allowed/prohibited interactions
- validation objectives

### BUILD_PR output
- executable implementation plan for registry, descriptor validation, host consumption, and sample integration
- file touch map
- contract test plan
- rollback/fallback notes

### APPLY_PR output
- implementation execution checklist
- validation checklist
- commit message guidance
- next-step recommendation

## Out of Scope
- redesigning the entire overlay layout engine
- embedding console UI into overlay panels
- adding charts/graphs unless already covered by approved host helpers
- engine-core API changes
- cross-sample registry persistence unless a later PR approves it

## Recommended Next PR After This One
`BUILD_PR_OVERLAY_PANEL_PRESETS_AND_TOGGLES`

That PR can build on a stable registry contract to define curated panel sets without re-opening panel boundaries.
