# BUILD_PR_ROADMAP_ADD_FULL_NETWORK_CAPABILITY_BEFORE_3D

## Purpose
Update the master roadmap so full real-network capability is explicitly completed before Phase 16 / 3D execution begins.

## Intent
The repo already has strong network simulation, diagnostics, promotion-readiness work, and server containerization foundations.
This PR adds the remaining **real multiplayer capability** as an explicit roadmap lane and makes it a prerequisite before moving on to 3D execution.

## Required roadmap update

### A. Add a new non-3D lane before 3D execution
Add a new roadmap section or dependency lane for:

## Real Network Capability Completion (Pre-3D Gate)

This lane should cover the missing real-network runtime capability needed to move from simulated/synthetic multiplayer to real hosted multiplayer.

Include the following items:

### Transport + Session Layer
- [ ] real client/server transport selected and implemented
- [ ] connection/session lifecycle for live clients implemented
- [ ] message serialization/deserialization contract defined
- [ ] reconnect/disconnect handling defined

### Authoritative Live Server Runtime
- [ ] authoritative live server tick loop implemented
- [ ] client input intake path implemented
- [ ] server-side authoritative state mutation path implemented
- [ ] live replication output path implemented

### Replication + Client Application
- [ ] state snapshot and/or delta replication contract finalized
- [ ] client replication apply path implemented
- [ ] interpolation/reconciliation strategy defined and implemented at minimum viable level
- [ ] divergence handling validated against live transport

### Playable Real Multiplayer Validation
- [ ] one real multiplayer sample runs over actual network transport
- [ ] real host/client session validated end-to-end
- [ ] live latency behavior validated
- [ ] live replication behavior validated
- [ ] debug surfaces integrated with live transport path

### Server Hosting + Containerization
- [ ] server runtime packaged for hosted deployment
- [ ] Docker container to host the multiplayer server finalized
- [ ] environment/runtime configuration documented
- [ ] health/readiness contract validated in hosted mode
- [ ] hosted server launch/run workflow documented

### Promotion / Readiness Gate
- [ ] real multiplayer path validated as stable enough for future game use
- [ ] roadmap explicitly marks real network capability complete before 3D execution begins

### B. Add dependency ordering
Update roadmap sequencing so:
- full real-network capability is completed before active 3D execution starts
- 3D remains deferred until the real-network lane is closed or explicitly waived

### C. Preserve existing completed work
Do not rewrite or disturb already-complete network/debug/container items.
This PR is additive and sequencing-focused.

## Constraints
- roadmap update only
- no code changes
- no text deletion
- additive update preferred
- status-only elsewhere

## Validation
Codex must report:
- where the new network-capability lane was inserted
- how 3D sequencing was updated
- confirmation that existing completed network items were preserved

## Packaging
`<project folder>/tmp/BUILD_PR_ROADMAP_ADD_FULL_NETWORK_CAPABILITY_BEFORE_3D.zip`
