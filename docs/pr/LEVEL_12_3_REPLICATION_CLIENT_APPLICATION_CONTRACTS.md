# LEVEL_12_3_REPLICATION_CLIENT_APPLICATION_CONTRACTS

## Replication Message Contract

`src/engine/network/ReplicationMessageContract.js` defines the authoritative replication envelope:

- `sessionId` non-empty string
- `replicationSequence` non-negative integer
- `authoritativeTick` non-negative integer
- `snapshotType` (`full` or `delta`)
- `snapshot.entities` array
- optional `snapshot.despawned` array
- `sentAtMs` finite number

Validation rejects malformed envelopes with deterministic rejection codes and normalizes accepted envelopes to a canonical shape.

## Client Application Layer

`src/engine/network/ClientReplicationApplicationLayer.js` defines the client-side apply boundary:

- `ingestReplicationEnvelope(envelope)`
- `applyPendingReplication()`
- `getReplicatedStateSnapshot()`
- `getReplicationStatus()`

The layer only updates client replicated cache from validated authoritative envelopes.

## Reconciliation Rules (No Prediction/Rollback)

`src/engine/network/ClientReconciliationStrategy.js` establishes deterministic Level 12.3 rules:

- Apply by ascending `authoritativeTick`, then `replicationSequence`
- Ignore stale lower ticks (`stale_tick`)
- For equal tick, ignore lower/equal sequences (`stale_sequence`)
- Invalid envelopes are ignored with explicit reason (`invalid_envelope`)

These rules keep authoritative application deterministic while prediction/rollback remain out of scope for this level.
