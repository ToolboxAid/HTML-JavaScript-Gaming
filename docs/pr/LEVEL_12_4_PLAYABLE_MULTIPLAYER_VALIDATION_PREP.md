# LEVEL_12_4_PLAYABLE_MULTIPLAYER_VALIDATION_PREP

## Goal
Prepare a docs-first, implementation-ready plan for one minimal playable real-multiplayer validation slice, without broadening scope and without any 3D work.

## Validation Slice Definition (Single Scenario)

Scenario key: `multiplayer.validation.slice.one`

Minimal flow:
1. Start authoritative server runtime
2. Establish client session and active handshake
3. Send one validated client action to server (`move` input)
4. Server emits one authoritative replication update
5. Client applies update and reflects synchronized state
6. Execute disconnect and cleanup

## Startup / Shutdown Contract

Startup success conditions:
- server runtime phase is `running`
- handshake reaches active on host + client
- replication apply status advances to new authoritative tick

Shutdown success conditions:
- session transitions to disconnected
- pending input/replication queues drain to zero
- no stale runtime state leaks into next run

## Deterministic Acceptance Checks

- Connection: `connected`/`active` state achieved in defined order
- Session: lifecycle transitions valid and complete
- Replication: client `lastAppliedTick` increases after server update
- Playability: one shared action produces same observable authoritative result on both sides
- Cleanup: stop/disconnect leaves runtime in deterministic terminal state

## Failure-Mode Checklist Targets

- handshake does not reach active
- server ingest rejects valid action unexpectedly
- replication envelope rejected unexpectedly
- client apply ignores non-stale authoritative update
- disconnect leaves pending queues or active runtime phase

## Scope Guardrails

- one validation slice only
- no new gameplay systems
- no debug/tool expansion unless required by this exact validation
- no prediction/rollback additions
- no Phase 16 / 3D work

## Roadmap Marker Rule

`docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md` may be updated by status markers only (`[ ]`, `[.]`, `[x]`) and only where validation evidence exists.
