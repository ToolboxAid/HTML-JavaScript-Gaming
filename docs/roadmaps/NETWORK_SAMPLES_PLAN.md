# NETWORK_SAMPLES_PLAN

## Purpose
Track the staged network sample journey for debug surface support using a strict checklist process.

## Status Legend
- [ ] Todo
- [.] In Progress
- [x] Complete

## Phase Alignment
- Phase 13 - Network Concepts, Latency & Simulation (1301-1315)

---

# TRACK N — NETWORK SAMPLE FOUNDATION

- [x] Sample A — Local Loopback / Fake Network
- [x] Synthetic connection lifecycle
- [x] Synthetic RTT feed
- [x] Synthetic replication feed
- [x] Trace event feed

---

# TRACK O — HOST / CLIENT SAMPLE

- [x] Sample B — Host / Client Diagnostics
- [x] Host status panel data
- [x] Client status panel data
- [x] Authority / ownership visibility
- [x] Replication snapshot visibility
- [x] Divergence warning surface

---

# TRACK P — DIVERGENCE / TRACE SAMPLE

- [x] Sample C — Divergence / Trace Validation
- [x] Deterministic mismatch scenario
- [x] Event sequencing timeline
- [x] Divergence explanation notes
- [x] Reproduction guide
- [x] Validation checklist

---

# TRACK Q — NETWORK DEBUG PANELS

- [x] Connection status panel
- [.] Latency / RTT panel
- [ ] Replication state viewer
- [x] Client/server divergence inspector
- [.] Event tracing panel

---

# TRACK R — NETWORK DEBUG COMMANDS

- [ ] network.help
- [x] network.status
- [x] network.latency
- [ ] network.replication
- [x] network.divergence
- [x] network.trace
- [ ] network.sample.*

---

# TRACK S — READINESS TO PROMOTE

- [.] Sample-backed provider validation
- [.] Sample-backed panel validation
- [.] Operator command validation
- [ ] Debug-only gating validation
- [ ] Promotion recommendation

---

# TRACK T — SERVER DASHBOARD

- [.] Server dashboard shell
- [.] Player statistics view
- [.] Latency view
- [.] RX bytes view
- [.] TX bytes view
- [.] Connection/session counts
- [.] Per-player status rows
- [.] Refresh/update strategy
- [.] Debug-only access rules

---

# TRACK U — SERVER CONTAINERIZATION

- [ ] Dockerfile for server
- [ ] .dockerignore
- [ ] Environment variable contract
- [ ] Local run command
- [ ] Compose-ready service definition
- [ ] Port mapping rules
- [ ] Health/readiness check
- [ ] Logging/output expectations
- [ ] Container debug notes

## Recommended Execution Order
1. Sample A
2. Connection + RTT + tracing basics
3. Sample B
4. Replication + authority + divergence
5. Sample C
6. Server dashboard
7. Server containerization
8. Promotion review
