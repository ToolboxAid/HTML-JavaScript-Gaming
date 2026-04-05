# Debug Surfaces Big Picture Roadmap (Checklist)

## Purpose

Track progress toward a reusable debug surface platform across games, tools, samples, and playable builds.

---

# North Star

- [.] Build a reusable debug surface platform (console + overlay + panels + providers + commands + persistence)
- [ ] Enable cross-project adoption (games, tools, samples)
- [ ] Support final playable builds with proper gating
- [ ] Avoid engine core pollution

---

# Big Picture Architecture

## Engine Core (Minimal)

- [ ] Define debug interfaces
- [ ] Define registration contracts
- [ ] Define lifecycle hooks
- [ ] Define environment/debug gating
- [ ] Keep UI and debug policy OUT of core

## Engine Debug (Reusable Platform)

- [ ] Extract console host
- [ ] Extract overlay host
- [ ] Extract panel registry
- [ ] Extract provider system
- [ ] Extract operator command layer
- [ ] Extract persistence system
- [ ] Define debug bootstrap/composition

## Project Layer (Games / Tools / Samples)

- [ ] Define panel registration pattern
- [ ] Define provider registration pattern
- [ ] Define command registration pattern
- [ ] Define scene integration pattern
- [ ] Define presets/defaults pattern

---

# Platform Consumers

## 2D Games
- [ ] Scene/debug panels
- [ ] Entity/collision panels
- [ ] Render layer panels
- [ ] Camera/debug state panels

## 3D Games
- [ ] Transform/camera panels
- [ ] Scene graph inspection
- [ ] Render pass diagnostics
- [ ] Material/shader inspection
- [ ] Lighting/debug panels
- [ ] Physics/debug volume panels

## Networked / Multiplayer
- [ ] Connection/session panels
- [ ] Latency/ping panels
- [ ] Replication diagnostics
- [ ] Prediction/rollback visibility
- [ ] Authority/ownership panels
- [ ] Desync detection panels

## Tools / Editors
- [ ] Tool state panels
- [ ] Selection panels
- [ ] Asset pipeline diagnostics
- [ ] Validation panels

## Samples / Learning
- [ ] Simple integration examples
- [ ] Example panels/providers/commands
- [ ] Low-friction setup

## Final Playable Builds
- [ ] Debug gating
- [ ] Operator-only access
- [ ] Safe runtime enablement

---

# Journey Overview

## Phase 0 — Surfaces
- [x] Dev Console
- [x] Debug Overlay

## Phase 1 — Boundary
- [x] Console vs overlay separation
- [x] Allowed interaction rules
- [x] Prohibited coupling rules

## Phase 2 — Overlay Structure
- [x] Panel registry
- [x] Panel identity
- [x] Deterministic ordering
- [ ] Panel lifecycle hooks

## Phase 3 — Data Flow
- [x] Data providers
- [x] Read-only snapshots
- [ ] Snapshot contract formalization

## Phase 4 — Operator Control
- [x] overlay.* command namespace
- [x] Public API-only interaction
- [ ] Output standardization

## Phase 5 — Persistence
- [x] Panel persistence
- [ ] Versioned persistence model
- [ ] Reset/migration handling

## Phase 6 — Promotion Planning
- [ ] Ownership model (core vs debug vs project)
- [ ] Migration boundaries
- [ ] Extraction plan from tools/dev

## Phase 7 — Engine-Debug Extraction
- [ ] Create engine-debug layer
- [ ] Move console host
- [ ] Move overlay host
- [ ] Move registry/providers/persistence
- [ ] Define debug bootstrap

## Phase 8 — Core Contracts
- [ ] Minimal debug interfaces
- [ ] Registration APIs
- [ ] Lifecycle hooks
- [ ] Debug gating hooks

## Phase 9 — Integration Patterns
- [ ] Game integration pattern
- [ ] Tool integration pattern
- [ ] Sample integration pattern

---

# Consumer Expansion Tracks

## 2D Integration
- [ ] Harden 2D usage
- [ ] Validate workflows

## Tools Integration
- [ ] Tool adoption
- [ ] Editor workflows

## Samples
- [ ] Learning samples
- [ ] Reference implementations

## Final Build Support
- [ ] Debug enablement rules
- [ ] Feature flags
- [ ] Safe operator access

## 3D Support
- [ ] 3D providers
- [ ] Transform panels
- [ ] Render diagnostics
- [ ] Physics visualization

## Network Support
- [ ] Network providers
- [ ] Replication panels
- [ ] Rollback/prediction views
- [ ] Desync diagnostics

---

# Platform Expansion

## Standard Library
- [ ] Common panels
- [ ] Common providers
- [ ] Common commands

## Presets / Layouts
- [ ] Gameplay preset
- [ ] Rendering preset
- [ ] AI preset
- [ ] QA preset
- [ ] Tool preset

## Advanced Inspection
- [ ] Entity inspector
- [ ] Scene explorer
- [ ] Runtime drill-down
- [ ] Diagnostics summary panels

---

# Stabilization

- [ ] Architecture documentation
- [ ] Integration documentation
- [ ] Extension documentation
- [ ] Ownership model finalized

---

# Recommended Planning Order

## Track A — Foundation
- [x] Console + Overlay
- [x] Boundary
- [x] Panel Registry
- [x] Data Providers
- [x] Operator Commands
- [x] Persistence

## Track B — Promotion Planning
- [ ] Promotion plan
- [ ] Ownership mapping
- [ ] Migration strategy

## Track C — Platform Extraction
- [ ] Engine-debug layer
- [ ] Core contracts
- [ ] Integration patterns

## Track D — Consumer Expansion
- [ ] 2D stabilization
- [ ] Tools integration
- [ ] Sample integration
- [ ] Final build gating
- [ ] 3D support
- [ ] Network support

## Track E — Platform Expansion
- [ ] Standard panels/providers
- [ ] Presets/layouts
- [ ] Advanced inspectors
- [ ] Cross-project reuse

## Track F — Stabilization
- [ ] Documentation
- [ ] Extension model
- [ ] Maintenance strategy

---

# Immediate Next Step

- [ ] PLAN_PR_DEBUG_SURFACES_PROMOTION

---

# Long-Term Outcome

- [ ] Clean engine core
- [ ] Reusable debug platform
- [ ] Cross-project adoption
- [ ] 2D + 3D + network support
- [ ] Safe final-build debug capability