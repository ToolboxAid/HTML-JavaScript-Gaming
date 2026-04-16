# MASTER ROADMAP - HIGH LEVEL (v7 ADDITIVE)

## Status Key
- [x] complete
- [.] in progress
- [ ] planned

## Rules
- repo structure work is now constrained to exact move-map BUILDs only
- remaining structure normalization should avoid broad folder churn until active shared extraction and promotion-gate work stabilize
- shared math is now a real active layer and should continue by exact-cluster extraction only
- avoid broad repo-wide cleanup passes until the active lanes above are materially further along

## Conservative Rebaseline (2026-04-12)
- status updates in this revision are conservative and execution-backed
- recent tool-host, asset-pipeline, debug-inspector, and launch-smoke lanes are reflected without broad scope expansion
- `templates/` cleanup was completed by relocating active template surfaces to `tools/templates/` and removing the empty root `templates/` directory

---

## Strategic Layer

### Learning System
- phases form a complete learning path
- each phase introduces one new concept cleanly
- each sample has a clear teaching purpose
- samples build progressively from prior phases
- no overlapping concept samples without clear justification
- advanced phases depend on mastered earlier phases
- samples remain understandable as standalone learning units
- sample naming stays aligned to phase numbering

### Architectural Separation
- engine contains reusable runtime logic only
- shared contains reusable cross-domain helpers only
- games contain game-specific implementation only
- samples contain learning/demo logic only
- tools contain editor/pipeline/debug-authoring logic only
- no sample logic promoted directly into engine without stabilization
- no tool logic promoted directly into engine without stabilization
- games do not become the default location for engine experiments
- dependency direction stays enforced across all refactors

### Promotion Pipeline
- sample proves concept
- shared extracts reusable logic
- engine receives stable abstraction
- promotion requires multi-use reuse evidence
- promotion requires stable public contract
- promotion requires removal of sample-specific assumptions
- promotion requires validation after extraction
- promotion does not happen as a blind dedupe exercise


### Productization Rule
- do not create standalone showcase tracks in future roadmaps
- fold showcase importance into the main feature or sample title when needed


### Tooling Strategy
- tools are created when they unblock engine/content progress
- tools do not define engine behavior
- tools share common IO/state/util layers where appropriate
- tools remain organized under `tools/`
- active tools list remains explicit
- legacy tools remain isolated and visibly non-current
- 3D tools arrive when 3D capability needs them, not before
- content pipeline tools arrive when asset complexity justifies them
- no standalone showcase-only tool tracks
- tools header accordion added to reduce vertical real-estate usage
- tool-shell UI compaction is useful but does not replace tool-boundary normalization work
- any follow-up tool UI cleanup should remain subordinate to shared-boundary and data-contract work

### End State Vision
- clean engine core
- clean shared layer
- games follow a standard structure
- samples form a complete curriculum
- tools support authoring/debug/content workflows
- debug platform supports games, tools, and samples
- network concepts are deterministic and explainable
- 2D capabilities are complete and reusable
- 3D capabilities are complete and reusable
- productization/distribution is documented and repeatable

---

## 0. Workflow + Delivery Foundation
- [x] PLAN => BUILD => APPLY workflow defined
- [x] docs-first operating model established
- [x] repo-structured ZIP delivery established
- [x] validation-gate model established
- [x] protected start_of_day operating boundary established
- [x] protected BUILD template direction established
- [x] ChatGPT owns planning/docs/bundles
- [x] Codex owns code/runtime edits
- [x] docs/dev reports + commit metadata pattern established
- [x] no-Codex APPLY rule established
- [x] single-validation-gate concept established

---

## 1. Repo Structure Normalization
- [x] target structure defined at high level
- [x] `src/engine` target established
- [x] `src/shared` target established
- [x] `games/` target established
- [x] `games/_template/` target established
- [x] `tools/shared` target established
- [x] phase-based `samples/` grouping target established
- [x] dependency direction rules defined
- [x] shared asset promotion rules defined
- [x] network samples classified as sample-phase content
- [x] current folder inventory mapped to target homes
- [x] move-map defined for root `engine/` -> `src/engine/`
- [x] duplicate-helper migration map defined
- [x] ambiguous-name rename map defined
- [x] legacy migration map defined
- [x] implementation PRs executed
- [x] imports normalized after moves
- [x] post-move validation complete

### Structure Targets
- [x] `src/engine/core`
- [x] `src/engine/state`
- [x] `src/engine/rendering`
- [x] `src/engine/input`
- [x] `src/engine/physics`
- [x] `src/engine/audio`
- [x] `src/engine/scene`
- [x] `src/shared/utils`
- [x] `src/shared/math`
- [x] `src/shared/state`
- [x] `games/_template/flow`
- [x] `samples/phase-01`
- [x] `samples/phase-13`
- [x] `tools/shared`

### Recent Checkpoint Notes
- [x] broad import-path correction from `engine/` to `src/engine/` applied across remaining games/samples
- [x] partial retro smoke pass completed after path correction
- [x] additional post-move validation complete

---

## 2. Engine Core
- [x] core bootstrapping normalized
- [x] scene management normalized
- [x] rendering layer normalized
- [x] input layer normalized
- [x] physics layer normalized
- [x] audio layer normalized
- [x] systems layer normalized
- [x] engine-level contracts documented
- [x] engine public boundaries clarified
- [x] timing/frame services stabilized
- [x] event routing stabilized
- [x] camera integration stabilized

### 2D Engine Capability
- [x] 2D scene boot
- [x] 2D render loop
- [x] 2D camera
- [x] 2D tilemap integration
- [x] 2D collision patterns
- [x] 2D gameplay hooks

---

## 3. Shared Foundation (`src/shared`)
- [x] core shared extraction pipeline executed
- [x] enforcement guard in place
- [x] numbers utilities consolidated
- [x] objects utilities consolidated
- [x] arrays utilities consolidated
- [x] strings utilities consolidated
- [x] ids utilities consolidated
- [x] shared math layer consolidated
- [x] shared state guards consolidated
- [x] shared state normalization consolidated
- [x] shared selectors consolidated
- [x] shared contracts consolidated
- [x] shared io/data/types stabilized

### Duplicate / Rename Focus
- [x] `asFiniteNumber` unified
- [x] `asPositiveInteger` unified
- [x] `isPlainObject` unified
- [x] `getState` variants bucketed by domain
- [x] `getSimulationState` naming established where needed
- [x] `getReplayState` naming established where needed
- [x] `getEditorState` naming established where needed
- [x] sample/tool/runtime duplicates classified before move

### Recent Consolidation Checkpoint
- [x] vector-domain `toFiniteNumber` promoted into `src/shared/math/numberNormalization.js`
- [x] vector-domain `roundNumber` promoted into `src/shared/math/numberNormalization.js`
- [x] state/sample `toFiniteNumber` consumers migrated to shared math
- [x] duplicated `asNumber` consumers migrated to shared math
- [x] Asteroids numeric sanitizers promoted into shared math
- [x] duplicated `asObject` / `asArray` consumers moved to shared utils
- [x] remaining number/string/id helpers still need exact-cluster normalization

---

## 4. State, Replay, Timeline, Authoritative Flow
- [x] authoritative state direction established
- [x] authoritative score/objective slices exist
- [x] promotion-gate lane active
- [x] final promotion gate implemented and applied
- [x] authoritative/passive handoff finalized
- [x] replay/timeline boundaries normalized
- [x] state contracts extracted/confirmed
- [x] public selectors stabilized
- [x] observability for promotion/handoff completed
- [x] long-run validation completed
- [x] rollback safety / abort logic completed

### Subcomponents
- [x] state contracts
- [x] authoritative state slices
- [x] replay model
- [x] timeline orchestration
- [x] selectors/public readers
- [x] promotion gating
- [x] rollback safety / abort logic

---

## 5. Debug Platform & Ecosystem

### Track A - Debug Foundation
- [x] Dev Console (input + command execution)
- [x] Debug Overlay (visual panels)
- [x] Console Ã¢â€ â€ Overlay Boundary
- [x] Panel Registry
- [x] Data Providers (read-only model)
- [x] Operator Commands (control surface)
- [x] Panel Persistence

### Track B - Promotion To Engine Layer
- [x] PLAN_PR_DEBUG_SURFACES_PROMOTION
- [x] BUILD_PR_DEBUG_SURFACES_PROMOTION
- [x] APPLY_PR_DEBUG_SURFACES_PROMOTION

### Track C - Standard Debug Library
- [x] PLAN_PR_DEBUG_SURFACES_STANDARD_LIBRARY
- [x] BUILD_PR_DEBUG_SURFACES_STANDARD_LIBRARY
- [x] APPLY_PR_DEBUG_SURFACES_STANDARD_LIBRARY

### Track D - Debug Presets
- [x] PLAN_PR_DEBUG_SURFACES_PRESETS
- [x] BUILD_PR_DEBUG_SURFACES_PRESETS
- [x] APPLY_PR_DEBUG_SURFACES_PRESETS

### Track E - Advanced Debug UX
- [x] PLAN_PR_DEBUG_SURFACES_ADVANCED_UX
- [x] BUILD_PR_DEBUG_SURFACES_ADVANCED_UX
- [x] APPLY_PR_DEBUG_SURFACES_ADVANCED_UX

### Track F - Game Integration
- [x] PLAN_PR_DEBUG_SURFACES_GAME_INTEGRATION
- [x] BUILD_PR_DEBUG_SURFACES_GAME_INTEGRATION
- [x] APPLY_PR_DEBUG_SURFACES_GAME_INTEGRATION
- [x] Sample game uses full debug platform
- [x] Toggle debug in production-safe mode
- [x] Performance-safe overlays
- [x] Build-time debug flags

### Track G - Network / Multiplayer Debug
- [x] Connection status panel
- [x] Latency / RTT panel
- [x] Replication state viewer
- [x] Client/server divergence inspector
- [x] Event tracing
- [x] PLAN_PR_DEBUG_SURFACES_NETWORK_SUPPORT
- [x] BUILD_PR_DEBUG_SURFACES_NETWORK_SUPPORT
- [x] APPLY_PR_DEBUG_SURFACES_NETWORK_SUPPORT

### Track I - Inspectors & Tooling
- [x] Entity inspector
- [x] Component inspector
- [x] State diff viewer
- [x] Timeline debugger
- [x] Event stream viewer

### Track J - Engine Maturity
- [x] Stable debug API
- [x] Plugin system
- [x] External documentation
- [x] Versioned contracts
- [x] Performance benchmarks

---

## 6. Samples Program
- [x] sample numbering normalization completed
- [x] sample formatting alignment completed
- [x] phase grouping normalized
- [x] `samples/shared` boundaries defined and used
- [x] sample index normalized to phase structure
- [x] sample-to-engine dependency cleanup completed
- [x] sample duplicate helper usage reduced
- [x] sample curriculum progression validated

### Sample Phase Tracks
- [x] foundational phases normalized
- [x] tilemap / camera / rendering phases normalized
- [x] tool-linked sample phases normalized
- [x] network concepts / latency / simulation phase normalized

### Dependency-Driven Sample Builds
- [x] 2D camera sample
- [x] tilemap scrolling sample
- [x] collision sample
- [x] enemy behavior sample
- [x] full 2D reference game sample

---

## 7. Phase 13 - Network Concepts, Latency & Simulation

### Track N - Network Sample Foundation
- [x] Sample A - Local Loopback / Fake Network
- [x] Synthetic connection lifecycle
- [x] Synthetic RTT feed
- [x] Synthetic replication feed
- [x] Trace event feed

### Track O - Host / Client Sample
- [x] Sample B - Host / Client Diagnostics
- [x] Host status panel data
- [x] Client status panel data
- [x] Authority / ownership visibility
- [x] Replication snapshot visibility
- [x] Divergence warning surface

### Track P - Divergence / Trace Sample
- [x] Sample C - Divergence / Trace Validation
- [x] Deterministic mismatch scenario
- [x] Event sequencing timeline
- [x] Divergence explanation notes
- [x] Reproduction guide
- [x] Validation checklist

### Track Q - Network Debug Panels
- [x] Connection status panel
- [x] Latency / RTT panel
- [x] Replication state viewer
- [x] Client/server divergence inspector
- [x] Event tracing panel

### Track R - Network Debug Commands
- [x] network.help
- [x] network.status
- [x] network.latency
- [x] network.replication
- [x] network.divergence
- [x] network.trace
- [x] network.sample.*

### Track S - Readiness To Promote
- [x] Sample-backed provider validation
- [x] Sample-backed panel validation
- [x] Operator command validation
- [x] Debug-only gating validation
- [x] Promotion recommendation

### Track T - Server Dashboard
- [x] Server dashboard shell
- [x] Player statistics view
- [x] Latency view
- [x] RX bytes view
- [x] TX bytes view
- [x] Connection/session counts
- [x] Per-player status rows
- [x] Refresh/update strategy
- [x] Debug-only access rules

### Track U - Server Containerization
- [x] Dockerfile for server
- [x] .dockerignore
- [x] Environment variable contract
- [x] Local run command
- [x] Compose-ready service definition
- [x] Port mapping rules
- [x] Health/readiness check
- [x] Logging/output expectations
- [x] Container debug notes

### Recommended Execution Order
- [x] Sample A
- [x] Connection + RTT + tracing basics
- [x] Sample B
- [x] Replication + authority + divergence
- [x] Sample C
- [x] Server dashboard
- [x] Server containerization
- [x] Promotion review

---

## 8. Games Layer
- [x] `games/_template/` created
- [x] game flow pattern standardized (`flow/attract.js`, `flow/intro.js`, `flow/highscore.js`)
- [x] per-game structure normalized
- [x] gameplay/entities/levels/rules/assets boundaries normalized
- [x] current games migrated to target structure
- [x] game-specific asset ownership enforced
- [x] shared-vs-game utility boundaries enforced
- [x] space_invaders normalized
- [x] puckman normalized
- [x] future games follow template-first path

---

## 9. Tools

### Existing Tools
- [x] TileMapEditor normalized
- [x] ParallaxEditor normalized
- [x] VectorMapEditor normalized
- [x] VectorAssetStudio normalized

### New Required Tools (By Dependency)
- [x] 3DMapEditor
- [x] 3DAssetViewer
- [x] 3DCameraPathEditor
- [x] PhysicsSandboxTool
- [x] StateInspectorTool
- [x] ReplayVisualizerTool
- [x] PerformanceProfilerTool
- [x] AssetPipelineTool
- [x] Tile/Model Converter Tool

### Tooling Strategy By Need
- [x] 2D tool stabilization before 3D tool expansion
- [x] content pipeline tools after asset complexity justifies them
- [x] debug tools align with engine/debug maturity

---

## 10. Assets & Data Policy
- [x] shared asset policy defined at planning level
- [x] game asset ownership normalized
- [x] sample asset ownership normalized
- [x] tool demo asset ownership normalized
- [x] promotion criteria for shared assets enforced
- [x] asset duplication reduced
- [x] top-level shared asset strategy finalized if needed

---

## 11. Productization & Distribution

### Track P - Product Samples / Demonstrations
- [x] Asteroids Debug Showcase
- [x] Breakout Debug Showcase

### Track Q - UX Polish
- [x] Debug toggle indicator
- [x] Default preset auto-load
- [x] Open Debug Panel button
- [x] Inline mini help

### Track R - Distribution And Packaging
- [x] Showcase landing page
- [x] Build packaging strategy
- [x] Asset bundling rules

### Track S - Documentation And Adoption
- [x] Debug tour
- [x] Getting started guide
- [x] Example-driven docs

---

## 12. 2D Capability Track
- [x] camera systems stabilized
- [x] tilemap/runtime integration stabilized
- [x] collision patterns stabilized
- [x] enemy/hero/gameplay conventions stabilized
- [x] replay/state integration for 2D games stabilized
- [x] polished 2D reference game path established
- [x] 2D reference game built

---

## 13. 3D Capability Track (Phase 16)

### Phase 16 Description Alignment
- [x] phase-16 description updated in repo docs/index
- [x] phase-16 description kept separate from networking language

---

## 14. Testing & Validation
- [x] `tests/` structure normalized
- [x] unit coverage aligned to engine/shared/games
- [x] integration coverage aligned to state/replay/rendering/tools
- [x] smoke validation aligned to samples/tools/games
- [x] fixtures/helpers organization normalized
- [x] move/refactor validation strategy documented
- [x] post-PR acceptance criteria consistently enforced

---

## 15. Legacy Reduction
- [x] legacy inventory completed
- [x] keep vs migrate vs future-delete decisions recorded
- [x] `legacy class-retention policy marker` policy defined
- [x] `SpriteEditor_old_keep` policy defined
- [x] archived notes policy defined
- [x] imports pointing to legacy paths reduced
- [x] roadmap for eventual legacy retirement defined
- [x] `templates/` folder evaluated, relocated to `tools/templates/`, and root `templates/` removed after validation

---

## 16. Documentation + Planning System
- [x] PR docs structure established
- [x] reports structure established
- [x] templates structure established
- [x] roadmaps folder recognized as tracker space
- [x] master roadmap committed and maintained
- [x] per-component roadmap slices added only when truly needed
- [x] structure normalization roadmap linked to future BUILD lanes
- [x] phase descriptions normalized repo-wide
- [x] naming policy documented

---

## Dependency-Ordered Future Build Sequence

### Active Execution Lanes
- [x] Finish current promotion-gate lane (BUILD => APPLY)
- [x] Apply repo structure normalization implementation plan
- [x] Extract / normalize shared utilities
- [x] Normalize phase-13 network concepts samples

### Next Planning / Normalization Lanes
- [x] Apply master roadmap baseline
- [x] Normalize samples phase structure
- [x] Establish games/_template and normalize games layer
- [x] Normalize tools/shared and tool boundaries
- [x] Normalize assets/data ownership
- [x] Expand testing/validation structure

### Repo Operator + Asset Conversion Scripting Lanes
- [x] Existing games asset folders updated so existing images / vectors / related runtime assets can be transformed into tool-editable `data/` objects, with corresponding project JSON updates
- [x] Add the ability for a PowerShell script to create a new game from template, including a project scaffold for the tools
- [x] Add scripts to prep / update / delete the repo so it can be placed on a website
- [x] Add scripts to switch between Pay-as-you-go and Codex plan modes, and scripts to input API key material and validate it

### Full Real-Network Capability Lane (Required Before 3D Execution)
- [x] real transport/session layer
- [x] authoritative live server runtime
- [x] replication/client application
- [x] playable real multiplayer validation
- [x] server hosting + Docker containerization
- [x] promotion/readiness gate
- [x] include samples for phase 13

### 3D Execution Dependency Gate
- [ ] begin active phase-16 / 3D execution only after the full real-network capability lane is complete

### Later Capability Lanes
- [x] FEATURE: Fullscreen Bezel Overlay System - Render game in full screen with optional bezel artwork layer (static or animated) surrounding the active playfield, preserving aspect ratio and supporting per-game/theme bezel assets without modifying core engine rendering.

### Later Capability Lanes
- [x] Execute 2D capability polish lanes

### Final Cleanup Lane
- [x] Reduce legacy footprint after replacements are proven
- [x] Execute `templates/` relocation and root removal cleanup PR

### Recommended Final Status Summary
- [x] current active execution lanes are 3 / 6 / 8
- [x] next planning lanes are 2 / 5 / 7 / 9 / 10
- [x] later capability lanes are 11 / 12
- [x] final cleanup lane is 13

---

## Immediate Next High-Level Actions
- [x] continue exact-cluster shared extraction until the current lane reaches a stable stop point
- [x] finish active promotion-gate lane enough to remove it from half-active status
- [x] convert repo structure normalization into exact move-map BUILDs with explicit validation
- [x] re-baseline this roadmap after active execution lanes stabilize
- [x] split future implementation into small dependency-ordered PRs

- [x] relocate active template surfaces to `tools/templates/` and remove the empty root `templates/` directory

---

## Deferred Infrastructure
- asset naming normalization (trigger condition: start only when a new non-3D asset lane requires cross-game naming standardization beyond current stable ownership/pipeline conventions)
- manifest discovery (trigger condition: start only when a new non-3D runtime/tool lane requires automatic manifest discovery beyond current explicit manifest wiring)

---

## Recovery / Preserved Content
# MASTER ROADMAP HIGH LEVEL (status updates only)

[x] fullscreen bezel overlay system (low priority, before next game)

## 17. 3D Activation, Validation, and Execution (Phase 16)

### Impact Validation (FIRST - REQUIRED)
- [x] Validate no render loop regressions
- [x] Validate no timing model regressions
- [x] Validate no input system regressions
- [x] Confirm networking/runtime remains stable during 3D activation
- [x] Confirm 2D samples still run correctly after 3D activation work

### 3D Engine Foundation
- [x] 3D scene boot
- [x] 3D render foundation
- [x] 3D transforms
- [x] 3D camera controls
- [x] 3D movement base
- [x] 3D collision base
- [x] 3D physics base
- [x] 3D content loading path

### Track H - 3D Debug Support
- [x] Transform inspector
- [x] BUILD_PR_DEBUG_SURFACES_3D_SUPPORT
- [x] APPLY_PR_DEBUG_SURFACES_3D_SUPPORT
- [x] Camera debug panel
- [x] Render pipeline stages
- [x] Collision overlays
- [x] Scene graph inspector
- [x] Level 17 debug overlay baseline promoted after validation (1708-1713: bottom-right placement, KeyG cycle key, correct stack ordering)
- [x] Level 18 overlay system baseline promoted after validation (input, mission, telemetry integration; no Level 17/18 overlay regressions)

### Sample Phase Tracks
- [x] 3D phase normalized

### Dependency-Driven Sample Builds
- [x] 3D scene boot sample
- [x] 3D camera orbit sample
- [x] 3D movement sample
- [x] 3D collision sample

### Tooling Strategy By Need
- [x] 3D prerequisite samples before advanced 3D tools

### Prerequisite Samples
- [x] 3D Scene Boot Sample
- [x] Camera Orbit Sample
- [x] 3D Movement Sample
- [x] Basic Collision Sample

### Core Sample Track (1601 - 1608)
- [x] 1601 - 3D Cube Explorer
- [x] 1602 - 3D Maze Runner
- [x] 1603 - First Person Walkthrough
- [x] 1604 - 3D Platformer
- [x] 1605 - 3D Driving Sandbox
- [x] 1606 - 3D Physics Playground
- [x] 1607 - 3D Space Shooter
- [x] 1608 - 3D Dungeon Crawler

### Advanced 3D Samples (1609+ EXPANDED VALIDATION TRACK)
- [x] 1609 - Lighting Demo
- [x] 1610 - Hybrid 2D/3D World Sample
- [x] 1611 - Multiplayer Sync Demo
- [x] 1612 - Stress Test (1,000 Objects)
- [x] 1613 - Input Lab
- [x] 1614 - Camera Modes Lab
- [x] 1615 - Entity Composition Demo
- [x] 1616 - World Streaming / Chunk Loader
- [x] 1617 - Large World Streaming Demo
- [x] 1618 - Lighting & Materials Lab
- [x] 1619 - Debug HUD Sample
- [x] 1620 - Mini Game (3D Reference Sample)
- [x] 1621 - AI Navigation Demo

### 3D Capability Requirements
- [x] 3D rendering
- [x] 3D camera
- [x] 3D movement
- [x] 3D physics
- [x] 3D tool support
- [x] 3D debug support

### Later Capability Lanes
- [x] Execute phase-16 / 3D capability lanes (after full real-network capability lane completion)

- [x] Stabilize networking/runtime before 3D

---

## 18. Engine Finalization & Hardening (Deferred Execution)

> Purpose: convert the built system into a clean, stable, production-grade engine after all major capability tracks are complete.  
> This is NOT a scaffolding phase — it is a consolidation + enforcement phase.

### Scope Rules
- additive only (no blind refactors)
- no structural churn without move-map PRs
- all changes must be validation-backed
- no template-driven work

[ ] Some games are actually samples/demos; identify and recommend a `phase-xx` move target.

[ ] Lock APIs
[ ] Clean boundaries
[ ] Document contracts

### Track A — Engine Usage Enforcement
- [ ] verify all `samples/` use engine systems (no local reimplementation)
- [ ] verify all `games/` use engine systems
- [ ] migrate any local logic into engine/shared where appropriate
- [ ] remove sample-specific logic from engine paths

### Track B — Boundary Hardening
- [ ] enforce engine vs shared vs game vs tool boundaries
- [ ] eliminate cross-layer leakage
- [ ] validate dependency direction rules across repo
- [ ] remove accidental coupling

### Track C — Contract Stabilization
- [ ] finalize engine public APIs
- [ ] finalize shared contracts
- [ ] ensure selectors/providers are stable
- [ ] remove unstable or experimental surfaces

### Track D — Codebase Consistency
- [ ] single class per file enforcement
- [ ] remove duplicate helpers
- [ ] normalize naming consistency
- [ ] eliminate import/export anti-patterns

### Track E — CSS & UI Normalization
- [ ] flatten CSS layers
- [ ] enforce shared UI classes
- [ ] remove redundant styles

### Track F — Docs System Cleanup
[ ] Docs organization: classify all `./docs/` into buckets.

[ ] Arrange docs into classification buckets.
[ ] Any doc that is only move/rename/etc. should be deleted (verify content is in the correct doc before deleting).

- [ ] classify all docs into buckets
- [ ] consolidate duplicate docs - consolidate PRs for easier one-stop review, so one capability does not require reading many docs (for example, bezel/background); focus on what the capability does.
- [ ] remove move-only historical docs (after validation)
- [ ] align docs to feature-based structure

### Track G — Repo Hygiene
[ ] Remove imports to export (should not be import x, export x)
[ ] Other than templates (games/samples/tools), remove the .keep file, if the folder is empty, delete
- [ ] remove unnecessary `.keep` files
- [ ] remove empty folders
- [ ] validate folder ownership rules
- [ ] enforce clean repo structure

### Track H — PR Consolidation Strategy
- [ ] bundle related PRs into capability-level units
- [ ] reduce multi-PR fragmentation
- [ ] ensure each PR represents a complete capability

---

## 19. Architecture Maturity & Long-Term Stability (Deferred Execution)

> Purpose: ensure the system is scalable, explainable, and extensible long-term.  
> This phase turns the engine into a platform, not just a project.

### Scope Rules
- no feature creation
- no experimental work
- only stabilization, validation, and extensibility

### Track A — System Integration Validation
- [ ] validate all major systems working together:
  - rendering
  - input
  - physics
  - state/replay
  - networking
  - debug platform
- [ ] verify no hidden coupling
- [ ] verify predictable system interaction

### Track B — Runtime Lifecycle Validation
- [ ] validate boot → run → shutdown lifecycle
- [ ] validate hot reload / reset flows
- [ ] validate error handling paths
- [ ] validate long-running stability

### Track C — Performance & Scaling
- [ ] validate large scene performance
- [ ] validate stress scenarios (1k+ entities)
- [ ] validate memory stability
- [ ] identify bottlenecks

### Track D — Debug & Observability Maturity
- [ ] ensure all systems expose debug data
- [x] ensure providers are complete and consistent
- [x] validate debug panels across systems
- [x] confirm production-safe debug toggling

### Track E — Toolchain Validation
- [ ] verify tools integrate cleanly with engine
- [ ] validate asset pipelines end-to-end
- [ ] validate editor → runtime consistency
- [ ] confirm no tool-specific logic leaks into engine

### Track F — Sample & Game Validation
- [.] Organize/rebuild `samples/` and `games/` as if newly constructed, with proper classes/data in proper folders.
- [.] Simulated code (for example, some network samples) should be converted to real networks, with tests as needed.
- [ ] verify all samples still function correctly
- [ ] verify curriculum progression remains intact
- [ ] validate games follow template strictly
- [ ] confirm no regression across phases

### Track G — Extensibility Readiness
- [x] validate plugin/extension patterns
- [x] validate adding new systems is clean
- [.] validate external integration points
- [.] ensure future phases can build cleanly

### Track H — Final Stability Gate
- [ ] full-repo validation sweep
- [ ] zero regression requirement
- [ ] contract freeze readiness
- [ ] readiness for long-term maintenance mode
