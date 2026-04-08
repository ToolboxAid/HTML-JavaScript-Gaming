# MASTER ROADMAP — HIGH LEVEL (v6 ADDITIVE) — UPDATED

## Status Key
- [x] complete
- [.] in progress
- [ ] planned

---

## 1. Repo Structure Normalization
- [.] target structure defined at high level
- [.] `src/engine` target established
- [.] `src/shared` target established
- [.] `games/` target established
- [.] `games/_template/` target established
- [.] `tools/shared` target established
- [.] phase-based `samples/` grouping target established
- [.] dependency direction rules defined
- [.] shared asset promotion rules defined
- [.] network samples classified as sample-phase content
- [ ] current folder inventory mapped to target homes
- [ ] move-map defined for root `engine/` -> `src/engine/`
- [x] duplicate-helper migration map defined
- [ ] ambiguous-name rename map defined
- [ ] legacy migration map defined
- [ ] implementation PRs executed
- [x] imports normalized after moves
- [ ] post-move validation complete

---

## 3. Shared Foundation (`src/shared`)
- [x] core shared extraction pipeline executed
- [x] enforcement guard in place
- [x] numbers utilities consolidated
- [x] objects utilities consolidated
- [.] arrays utilities consolidated
- [.] strings utilities consolidated
- [ ] ids utilities consolidated
- [ ] shared math layer consolidated
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

---

## 6. Samples Program
- [.] sample numbering normalization completed
- [.] sample formatting alignment completed
- [ ] phase grouping normalized
- [ ] `samples/shared` boundaries defined and used
- [ ] sample index normalized to phase structure
- [ ] sample-to-engine dependency cleanup completed
- [x] sample duplicate helper usage reduced
- [ ] sample curriculum progression validated

---

## 7. Phase 13 — Network Concepts

### Track Q — Network Debug Panels
- [x] Connection status panel
- [.] Latency / RTT panel
- [ ] Replication state viewer
- [x] Client/server divergence inspector
- [x] Event tracing panel

### Track R — Network Debug Commands
- [ ] network.help
- [x] network.status
- [x] network.latency
- [.] network.replication
- [x] network.divergence
- [x] network.trace
- [.] network.sample.*

---

## Dependency-Ordered Future Build Sequence
- [ ] Finish current promotion-gate lane (BUILD → APPLY)
- [ ] Apply master roadmap baseline
- [ ] Apply repo structure normalization implementation plan
- [.] Extract / normalize shared utilities
- [ ] Normalize samples phase structure
- [ ] Normalize phase-13 network concepts samples
- [ ] Establish games/_template and normalize games layer
- [ ] Normalize tools/shared and tool boundaries
- [ ] Normalize assets/data ownership
- [ ] Expand testing/validation structure
- [ ] Execute 2D capability polish lanes
- [ ] Execute phase-16 / 3D capability lanes
- [ ] Reduce legacy footprint after replacements are proven
