Toolbox Aid
David Quesenberry
04/05/2026
BUILD_PR_OVERLAY_PANEL_REGISTRY.md

# BUILD PR
## Overlay Panel Registry

## Build Objective
Translate the approved panel registry plan into an execution-ready build package that Codex can implement without widening scope beyond sample-level overlay integration.

## Build Summary
This BUILD_PR defines the implementation path for:
- `OverlayPanelRegistry`
- panel descriptor validation
- overlay host consumption of registry snapshots
- sample-level panel registration in `MultiSystemDemoScene.js`
- optional console-facing visibility commands through approved public calls only

No implementation code is included in this docs bundle.

## Build Constraints
- follow PLAN_PR -> BUILD_PR -> APPLY_PR
- docs-first package only
- no engine-core breakage
- no console/overlay merger
- sample-level integration only
- public contract driven

## Proposed File Touch Targets
Expected implementation touch points should stay as small and surgical as possible. Final file names may vary slightly if Codex finds existing equivalent locations.

Likely targets:
- `src/engine/debug/` overlay registry module
- `src/engine/debug/` overlay host / panel consumption module
- `tools/dev/devConsoleIntegration.js` only if public registry commands already belong there and can remain isolated
- `samples/.../MultiSystemDemoScene.js` for sample registration and validation wiring
- docs under `docs/pr/` and `docs/dev/reports/`

## Build Workstreams
### 1. Registry Module
Codex should implement a lightweight registry with:
- register
- unregister if already approved by current debug lifecycle, otherwise defer
- get ordered list
- get by id
- set enabled state
- snapshot export

Acceptance goals:
- stable deterministic ordering
- duplicate rejection
- no overlay host mutation leaks

### 2. Descriptor Validation
Codex should validate required descriptor fields at registration time.

Validation checks:
- `id` exists and is string
- `title` exists and is string
- `order` is finite numeric value
- `readModel` is function
- `render` is function
- optional hooks are type-checked when present

Failure mode:
- reject invalid descriptor
- preserve existing registry state
- emit clear debug error

### 3. Overlay Host Consumption
Codex should update the overlay host so that it:
- requests a registry snapshot each frame or approved update point
- filters visible/enabled panels
- reads model first, then renders
- lays out panels in deterministic order
- does not know about panel-specific runtime internals

### 4. Approved Context Adapter
Codex should introduce or formalize a narrow panel context object.

Suggested contents:
- frame timing snapshot
- scene summary
- approved debug selectors
- draw helpers
- feature flags
- panel bounds/layout helpers

Suggested exclusions:
- unrestricted engine mutation methods
- raw console state/history
- arbitrary scene object mutation handles

### 5. Sample Registration Path
Codex should register a minimal first-pass panel set in `MultiSystemDemoScene.js` or approved sample bootstrap helper.

Suggested initial sample panels:
- FPS/runtime frame panel
- scene identity/status panel
- render layers/status panel
- entity count panel

### 6. Console Surface Integration
Only if already aligned with existing command architecture, Codex may add public command hooks that:
- list panel ids
- toggle a panel by id
- show current enabled state

The console must remain a caller of the registry contract, not a co-owner of panel rendering.

## Build Validation Matrix
### Contract Validation
- valid panel descriptor registers successfully
- invalid descriptor is rejected cleanly
- duplicate id is rejected

### Behavior Validation
- ordered snapshot is stable
- disabled panels do not render
- conditional visibility works independently of enabled state
- render call order matches contract sort rules

### Isolation Validation
- panel renderers do not access console internals
- overlay host does not contain panel-specific logic branches
- sample-specific panel removal does not break host

### Sample Validation
- `MultiSystemDemoScene.js` demonstrates registry-based panel registration
- overlay still draws with no registered sample panel failures
- console autocomplete/interaction remains intact

## Contract Test Suggestions
Codex should include lightweight tests or validations for:
- registration order
- duplicate rejection
- enable/disable state transition
- visibility gate behavior
- snapshot immutability expectations if implemented

## Risks
- leaking runtime internals through panel context
- allowing console-specific logic into panel descriptors
- tying ordering to registration sequence
- over-designing the registry before minimal validation

## Risk Controls
- keep context narrow
- reject descriptors that violate contract shape
- validate through sample integration only first
- favor immutable or read-only snapshots where practical

## Rollback Strategy
If implementation becomes noisy or starts expanding scope:
- keep registry internal behind one public module
- disable console toggle hooks first
- retain sample registration only
- leave presets and persistence for later PRs

## Deliverables
Codex should produce:
- updated docs in `docs/pr/`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
- `docs/dev/next_command.txt`
- `docs/dev/reports/change_summary.txt`
- `docs/dev/reports/validation_checklist.txt`
- `docs/dev/reports/file_tree.txt`
- implementation changes only if this BUILD_PR is executed outside the docs-only planning workflow
