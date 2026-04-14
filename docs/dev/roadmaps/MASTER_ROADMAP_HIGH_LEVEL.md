# MASTER ROADMAP - HIGH LEVEL (v7 ADDITIVE)

## Status Key
- [x] complete
- [.] in progress
- [ ] planned

## Rules
- repo structure work is now constrained to exact move-map BUILDs only
- remaining structure normalization should avoid broad folder churn until active shared extraction and promotion-gate work stabilize

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
- [ ] core bootstrapping normalized
- [ ] scene management normalized
- [ ] rendering layer normalized
- [ ] input layer normalized
- [ ] physics layer normalized
- [ ] audio layer normalized
- [ ] systems layer normalized
- [ ] engine-level contracts documented
- [ ] engine public boundaries clarified
- [ ] timing/frame services stabilized
- [ ] event routing stabilized
- [ ] camera integration stabilized

### 2D Engine Capability
- [ ] 2D scene boot
- [ ] 2D render loop
- [ ] 2D camera
- [ ] 2D tilemap integration
- [ ] 2D collision patterns
- [ ] 2D gameplay hooks

### 3D Engine Foundation
- [ ] 3D scene boot
- [ ] 3D render foundation
- [ ] 3D transforms
- [ ] 3D camera controls
- [ ] 3D movement base
- [ ] 3D collision base
- [ ] 3D physics base
- [ ] 3D content loading path

---

## 3. Shared Foundation (`src/shared`)
- [x] core shared extraction pipeline executed
- [x] enforcement guard in place
- [x] numbers utilities consolidated
- [x] objects utilities consolidated
- [.] arrays utilities consolidated
- [.] strings utilities consolidated
- [ ] ids utilities consolidated
- [.] shared math layer consolidated
- [ ] shared state guards consolidated
- [ ] shared state normalization consolidated
- [ ] shared selectors consolidated
- [ ] shared contracts consolidated
- [ ] shared io/data/types stabilized

### Duplicate / Rename Focus
- [x] `asFiniteNumber` unified
- [x] `asPositiveInteger` unified
- [x] `isPlainObject` unified
- [.] `getState` variants bucketed by domain
- [ ] `getSimulationState` naming established where needed
- [ ] `getReplayState` naming established where needed
- [ ] `getEditorState` naming established where needed
- [ ] sample/tool/runtime duplicates classified before move

### Recent Consolidation Checkpoint
- [x] vector-domain `toFiniteNumber` promoted into `src/shared/math/numberNormalization.js`
- [x] vector-domain `roundNumber` promoted into `src/shared/math/numberNormalization.js`
- [x] state/sample `toFiniteNumber` consumers migrated to shared math
- [x] duplicated `asNumber` consumers migrated to shared math
- [x] Asteroids numeric sanitizers promoted into shared math
- [x] duplicated `asObject` / `asArray` consumers moved to shared utils
- [.] shared math is now a real active layer and should continue by exact-cluster extraction only
- [ ] remaining number/string/id helpers still need exact-cluster normalization

---

## 4. State, Replay, Timeline, Authoritative Flow
- [x] authoritative state direction established
- [x] authoritative score/objective slices exist
- [x] promotion-gate lane active
- [x] final promotion gate implemented and applied
- [x] authoritative/passive handoff finalized
- [ ] replay/timeline boundaries normalized
- [.] state contracts extracted/confirmed
- [x] public selectors stabilized
- [x] observability for promotion/handoff completed
- [x] long-run validation completed
- [x] rollback safety / abort logic completed

### Subcomponents
- [.] state contracts
- [.] authoritative state slices
- [ ] replay model
- [ ] timeline orchestration
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
- [.] Latency / RTT panel
- [ ] Replication state viewer
- [x] Client/server divergence inspector
- [.] Event tracing
- [.] PLAN_PR_DEBUG_SURFACES_NETWORK_SUPPORT
- [ ] BUILD_PR_DEBUG_SURFACES_NETWORK_SUPPORT
- [x] APPLY_PR_DEBUG_SURFACES_NETWORK_SUPPORT

### Track H - 3D Debug Support
- [.] Transform inspector
- [x] BUILD_PR_DEBUG_SURFACES_3D_SUPPORT
- [x] APPLY_PR_DEBUG_SURFACES_3D_SUPPORT
- [ ] Camera debug panel
- [ ] Render pipeline stages
- [ ] Collision overlays
- [ ] Scene graph inspector

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
- [.] phase grouping normalized
- [ ] `samples/shared` boundaries defined and used
- [x] sample index normalized to phase structure
- [ ] sample-to-engine dependency cleanup completed
- [x] sample duplicate helper usage reduced
- [.] sample curriculum progression validated

### Sample Phase Tracks
- [ ] foundational phases normalized
- [ ] tilemap / camera / rendering phases normalized
- [ ] tool-linked sample phases normalized
- [ ] network concepts / latency / simulation phase normalized
- [ ] 3D phase normalized

### Dependency-Driven Sample Builds
- [ ] 2D camera sample
- [ ] tilemap scrolling sample
- [ ] collision sample
- [ ] enemy behavior sample
- [ ] full 2D reference game sample
- [ ] 3D scene boot sample
- [ ] 3D camera orbit sample
- [ ] 3D movement sample
- [ ] 3D collision sample

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
- [.] Latency / RTT panel
- [ ] Replication state viewer
- [x] Client/server divergence inspector
- [x] Event tracing panel

### Track R - Network Debug Commands
- [ ] network.help
- [x] network.status
- [x] network.latency
- [.] network.replication
- [x] network.divergence
- [x] network.trace
- [.] network.sample.*

### Track S - Readiness To Promote
- [.] Sample-backed provider validation
- [.] Sample-backed panel validation
- [.] Operator command validation
- [ ] Debug-only gating validation
- [ ] Promotion recommendation

### Track T - Server Dashboard
- [ ] Server dashboard shell
- [ ] Player statistics view
- [ ] Latency view
- [ ] RX bytes view
- [ ] TX bytes view
- [ ] Connection/session counts
- [ ] Per-player status rows
- [ ] Refresh/update strategy
- [ ] Debug-only access rules

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
- [ ] Server dashboard
- [x] Server containerization
- [ ] Promotion review

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
- [ ] TileMapEditor normalized
- [ ] ParallaxEditor normalized
- [ ] VectorMapEditor normalized
- [ ] VectorAssetStudio normalized

### New Required Tools (By Dependency)
- [ ] 3DMapEditor
- [ ] 3DAssetViewer
- [ ] 3DCameraPathEditor
- [ ] PhysicsSandboxTool
- [.] StateInspectorTool
- [.] ReplayVisualizerTool
- [.] PerformanceProfilerTool
- [.] AssetPipelineTool
- [.] Tile/Model Converter Tool

### Tooling Strategy By Need
- [ ] 2D tool stabilization before 3D tool expansion
- [ ] 3D prerequisite samples before advanced 3D tools
- [x] content pipeline tools after asset complexity justifies them
- [x] debug tools align with engine/debug maturity
- [ ] no standalone showcase-only tool tracks

### Recent Tool Shell Notes
- [.] tools header accordion added to reduce vertical real-estate usage
- [.] tool-shell UI compaction is useful but does not replace tool-boundary normalization work
- [ ] any follow-up tool UI cleanup should remain subordinate to shared-boundary and data-contract work

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
- [ ] camera systems stabilized
- [ ] tilemap/runtime integration stabilized
- [ ] collision patterns stabilized
- [ ] enemy/hero/gameplay conventions stabilized
- [ ] replay/state integration for 2D games stabilized
- [ ] polished 2D reference game path established
- [ ] 2D reference game built

---

## 13. 3D Capability Track (Phase 16)

### Phase 16 Description Alignment
- [ ] phase-16 description updated in repo docs/index
- [ ] phase-16 description kept separate from networking language

### Prerequisite Samples
- [ ] 3D Scene Boot Sample
- [ ] Camera Orbit Sample
- [ ] 3D Movement Sample
- [ ] Basic Collision Sample

### Core Sample Track (1601 - 1608)
- [ ] 1601 - 3D Cube Explorer
- [ ] 1602 - 3D Maze Runner
- [ ] 1603 - First Person Walkthrough
- [ ] 1604 - 3D Platformer
- [ ] 1605 - 3D Driving Sandbox
- [ ] 1606 - 3D Physics Playground
- [ ] 1607 - 3D Space Shooter
- [ ] 1608 - 3D Dungeon Crawler

### Advanced 3D Samples
- [ ] 1610 - Lighting Demo
- [ ] 1611 - AI Navigation Demo
- [ ] 1612 - Large World Streaming Demo

### 3D Capability Requirements
- [ ] 3D rendering
- [ ] 3D camera
- [ ] 3D movement
- [ ] 3D physics
- [ ] 3D tool support
- [ ] 3D debug support

---

## 14. Testing & Validation
- [.] `tests/` structure normalized
- [.] unit coverage aligned to engine/shared/games
- [.] integration coverage aligned to state/replay/rendering/tools
- [x] smoke validation aligned to samples/tools/games
- [.] fixtures/helpers organization normalized
- [x] move/refactor validation strategy documented
- [x] post-PR acceptance criteria consistently enforced

---

## 15. Legacy Reduction
- [.] legacy inventory completed
- [.] keep vs migrate vs future-delete decisions recorded
- [ ] `legacy class-retention policy marker` policy defined
- [.] `SpriteEditor_old_keep` policy defined
- [ ] archived notes policy defined
- [x] imports pointing to legacy paths reduced
- [.] roadmap for eventual legacy retirement defined
- [x] `templates/` folder evaluated, relocated to `tools/templates/`, and root `templates/` removed after validation

---

## 16. Documentation + Planning System
- [x] PR docs structure established
- [x] reports structure established
- [x] templates structure established
- [x] roadmaps folder recognized as tracker space
- [x] master roadmap committed and maintained
- [ ] per-component roadmap slices added only when truly needed
- [ ] structure normalization roadmap linked to future BUILD lanes
- [ ] phase descriptions normalized repo-wide
- [x] naming policy documented

---

## Dependency-Ordered Future Build Sequence

### Active Execution Lanes
- [x] Finish current promotion-gate lane (BUILD => APPLY)
- [.] Apply repo structure normalization implementation plan
- [.] Extract / normalize shared utilities
- [.] Normalize phase-13 network concepts samples

### Next Planning / Normalization Lanes
- [ ] Apply master roadmap baseline
- [ ] Normalize samples phase structure
- [x] Establish games/_template and normalize games layer
- [x] Normalize tools/shared and tool boundaries
- [x] Normalize assets/data ownership
- [x] Expand testing/validation structure

### Repo Operator + Asset Conversion Scripting Lanes
- [.] Existing games asset folders updated so existing images / vectors / related runtime assets can be transformed into tool-editable `data/` objects, with corresponding project JSON updates
- [x] Add the ability for a PowerShell script to create a new game from template, including a project scaffold for the tools
- [x] Add scripts to prep / update / delete the repo so it can be placed on a website
- [x] Add scripts to switch between Pay-as-you-go and Codex plan modes, and scripts to input API key material and validate it

### Later Capability Lanes
- [.] FEATURE: Fullscreen Bezel Overlay System - Render game in full screen with optional bezel artwork layer (static or animated) surrounding the active playfield, preserving aspect ratio and supporting per-game/theme bezel assets without modifying core engine rendering.

### Later Capability Lanes
- [.] Execute 2D capability polish lanes
- [ ] Execute phase-16 / 3D capability lanes

### Final Cleanup Lane
- [ ] Reduce legacy footprint after replacements are proven
- [x] Execute `templates/` relocation and root removal cleanup PR

### Recommended Final Status Summary
- [ ] current active execution lanes are 3 / 6 / 8
- [ ] next planning lanes are 2 / 5 / 7 / 9 / 10
- [ ] later capability lanes are 11 / 12
- [ ] final cleanup lane is 13

---

## Immediate Next High-Level Actions
- [.] continue exact-cluster shared extraction until the current lane reaches a stable stop point
- [x] finish active promotion-gate lane enough to remove it from half-active status
- [.] convert repo structure normalization into exact move-map BUILDs with explicit validation
- [x] re-baseline this roadmap after active execution lanes stabilize
- [x] split future implementation into small dependency-ordered PRs
- [ ] avoid broad repo-wide cleanup passes until the active lanes above are materially further along

- [x] relocate active template surfaces to `tools/templates/` and remove the empty root `templates/` directory

---

## Recovery / Preserved Content
# MASTER ROADMAP HIGH LEVEL (status updates only)

[.] asset naming normalization
[.] manifest discovery
[x] fullscreen bezel overlay system (low priority, before next game)
