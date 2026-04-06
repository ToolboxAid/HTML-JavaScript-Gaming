# NETWORK_SAMPLES_PLAN

## Purpose
Track the staged network sample journey for debug surface support using a strict checklist process.

## Status Legend
- [ ] Todo
- [.] In Progress
- [x] Complete

---

# TRACK N — NETWORK SAMPLE FOUNDATION

- [ ] Sample A — Local Loopback / Fake Network
- [ ] Synthetic connection lifecycle
- [ ] Synthetic RTT feed
- [ ] Synthetic replication feed
- [ ] Trace event feed

---

# TRACK O — HOST / CLIENT SAMPLE

- [ ] Sample B — Host / Client Diagnostics
- [ ] Host status panel data
- [ ] Client status panel data
- [ ] Authority / ownership visibility
- [ ] Replication snapshot visibility
- [ ] Divergence warning surface

---

# TRACK P — DIVERGENCE / TRACE SAMPLE

- [ ] Sample C — Divergence / Trace Validation
- [ ] Deterministic mismatch scenario
- [ ] Event sequencing timeline
- [ ] Divergence explanation notes
- [ ] Reproduction guide
- [ ] Validation checklist

---

# TRACK Q — NETWORK DEBUG PANELS

- [ ] Connection status panel
- [ ] Latency / RTT panel
- [ ] Replication state viewer
- [ ] Client/server divergence inspector
- [ ] Event tracing panel

---

# TRACK R — NETWORK DEBUG COMMANDS

- [ ] network.help
- [ ] network.status
- [ ] network.connections
- [ ] network.latency
- [ ] network.replication
- [ ] network.divergence
- [ ] network.trace
- [ ] network.sample.*

---

# TRACK S — READINESS TO PROMOTE

- [ ] Sample-backed provider validation
- [ ] Sample-backed panel validation
- [ ] Operator command validation
- [ ] Debug-only gating validation
- [ ] Promotion recommendation

---

# TRACK T — SERVER DASHBOARD

- [ ] Server dashboard shell
- [ ] Player statistics view
- [ ] Latency view
- [ ] RX bytes view
- [ ] TX bytes view
- [ ] Connection/session counts
- [ ] Per-player status rows
- [ ] Refresh/update strategy
- [ ] Debug-only access rules

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
