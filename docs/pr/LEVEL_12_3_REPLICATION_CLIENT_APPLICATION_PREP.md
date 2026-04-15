# LEVEL_12_3_REPLICATION_CLIENT_APPLICATION_PREP

## Goal
Prepare an implementation-ready plan for Level 12.3 client replication/application so APPLY can execute in one pass with additive network APIs only.

## Replication Message Contract (Planned)

Server-to-client replication envelope:

- `sessionId` string
- `replicationSequence` non-negative integer
- `authoritativeTick` non-negative integer
- `snapshotType` string (`full` or `delta`)
- `snapshot` plain object payload
- `sentAtMs` finite number

Contract behavior:

- reject malformed envelopes deterministically
- reject envelopes with server-owned field mutation attempts in client metadata payloads
- normalize accepted envelopes to a canonical read-safe shape

## Client Application Model (Planned)

`ClientReplicationApplicationLayer` should expose:

- `ingestReplicationEnvelope(envelope)`
- `applyPendingReplication()`
- `getReplicatedStateSnapshot()`
- `getReplicationStatus()`

State ownership:

- authoritative source is server replication envelope only
- client layer owns local replicated cache + apply metadata
- gameplay systems remain consumers, not writers, in Level 12.3 scope

## Reconciliation / Update Strategy (Planned)

Level 12.3 reconciliation is authoritative-first with no prediction/rollback:

- apply newest valid authoritative envelope in deterministic order
- ignore stale envelopes (`authoritativeTick` lower than last applied tick)
- for equal tick, apply highest `replicationSequence` only
- persist reasons for ignored envelopes (`stale_tick`, `stale_sequence`, `invalid_envelope`)

## API Compatibility Guardrails

- no removal/rename of existing exports in `src/engine/network/index.js`
- new exports are additive only
- preserve Level 12.1 handshake simulation behavior
- preserve Level 12.2 server runtime/input-ingestion behavior

## Validation Focus for APPLY

- replication envelope validation passes for valid/invalid cases
- client apply path updates state correctly for ordered envelopes
- stale/out-of-order envelopes are rejected deterministically
- existing multiplayer networking stack tests remain green
- public engine barrel import test remains green
