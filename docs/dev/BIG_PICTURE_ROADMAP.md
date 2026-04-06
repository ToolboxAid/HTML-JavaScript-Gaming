⚠️ RULE:
This file is a status tracker only.
ONLY modify bracket states [ ] [.] [x].
Do NOT change structure or wording.

---

# Debug Platform & Ecosystem Roadmap

## Status Legend
- [ ] Todo
- [.] In Progress
- [x] Complete

---

# TRACK A — DEBUG FOUNDATION (COMPLETE)

- [x] Dev Console (input + command execution)
- [x] Debug Overlay (visual panels)
- [x] Console ↔ Overlay Boundary
- [x] Panel Registry
- [x] Data Providers (read-only model)
- [x] Operator Commands (control surface)
- [x] Panel Persistence

---

# TRACK B — PROMOTION TO ENGINE LAYER

- [x] PLAN_PR_DEBUG_SURFACES_PROMOTION
- [x] BUILD_PR_DEBUG_SURFACES_PROMOTION
- [x] APPLY_PR_DEBUG_SURFACES_PROMOTION

---

# TRACK C — STANDARD DEBUG LIBRARY

- [x] PLAN_PR_DEBUG_SURFACES_STANDARD_LIBRARY
- [x] BUILD_PR_DEBUG_SURFACES_STANDARD_LIBRARY
- [x] APPLY_PR_DEBUG_SURFACES_STANDARD_LIBRARY

---

# TRACK D — DEBUG PRESETS

- [x] PLAN_PR_DEBUG_SURFACES_PRESETS
- [x] BUILD_PR_DEBUG_SURFACES_PRESETS
- [x] APPLY_PR_DEBUG_SURFACES_PRESETS

---

# TRACK E — ADVANCED DEBUG UX

- [x] PLAN_PR_DEBUG_SURFACES_ADVANCED_UX
- [x] BUILD_PR_DEBUG_SURFACES_ADVANCED_UX
- [x] APPLY_PR_DEBUG_SURFACES_ADVANCED_UX

---

# TRACK F — GAME INTEGRATION

- [x] PLAN_PR_DEBUG_SURFACES_GAME_INTEGRATION
- [x] BUILD_PR_DEBUG_SURFACES_GAME_INTEGRATION
- [x] APPLY_PR_DEBUG_SURFACES_GAME_INTEGRATION
- [x] Sample game uses full debug platform
- [x] Toggle debug in production-safe mode
- [x] Performance-safe overlays
- [x] Build-time debug flags

---

# TRACK G — NETWORK / MULTIPLAYER DEBUG

- [.] Connection status panel
- [ ] Latency / RTT panel
- [ ] Replication state viewer
- [ ] Client/server divergence inspector
- [ ] Event tracing
- [x] PLAN_PR_DEBUG_SURFACES_NETWORK_SUPPORT
- [.] BUILD_PR_DEBUG_SURFACES_NETWORK_SUPPORT
- [x] APPLY_PR_DEBUG_SURFACES_NETWORK_SUPPORT

---

# TRACK H — 3D DEBUG SUPPORT

- [.] Transform inspector
- [x] BUILD_PR_DEBUG_SURFACES_3D_SUPPORT
- [x] APPLY_PR_DEBUG_SURFACES_3D_SUPPORT
- [ ] Camera debug panel
- [ ] Render pipeline stages
- [ ] Collision overlays
- [ ] Scene graph inspector

---

# TRACK I — INSPECTORS & TOOLING

- [x] Entity inspector
- [x] Component inspector
- [x] State diff viewer
- [x] Timeline debugger
- [x] Event stream viewer

---

# TRACK J — ENGINE MATURITY

- [x] Stable debug API
- [x] Plugin system
- [x] External documentation
- [x] Versioned contracts
- [x] Performance benchmarks

---

# END STATE

A complete system:

- Engine Core → minimal contracts
- Engine Debug → reusable platform
- Standard Library → shared baseline
- Presets → usability layer
- Extensions → 3D, network, inspectors