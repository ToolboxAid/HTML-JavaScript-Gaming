# BUILD_PR_LEVEL_12_3_REPLICATION_CLIENT_APPLICATION

## Purpose
Implement the Level 12.3 client replication and authoritative application layer on top of the Level 12.1/12.2 network foundation with no engine API breakage.

## Scope
Primary target files:
- `src/engine/network/ReplicationMessageContract.js`
- `src/engine/network/ClientReplicationApplicationLayer.js`
- `src/engine/network/ClientReconciliationStrategy.js`
- `src/engine/network/index.js`
- `tests/final/MultiplayerNetworkingStack.test.mjs`
- `docs/pr/LEVEL_12_3_REPLICATION_CLIENT_APPLICATION_CONTRACTS.md`

Allowed nearby reads:
- `src/engine/network/StateReplication.js`
- `src/engine/network/AuthoritativeServerRuntime.js`
- `src/engine/network/AuthoritativeInputIngestionContract.js`
- `src/engine/network/HandshakeSimulator.js`
- `docs/pr/LEVEL_12_1_REAL_NETWORK_FOUNDATION_CONTRACTS.md`

## Required implementation
- Define a replication message contract for server-to-client authoritative snapshots.
- Implement a client-side application layer that:
  - accepts validated replication envelopes
  - applies authoritative snapshots into client-owned replicated state
  - rejects stale/out-of-order updates deterministically
- Implement a reconciliation/update strategy for Level 12.3 without prediction/rollback:
  - authoritative-first apply
  - stale snapshot ignore rules
  - deterministic metadata updates (`lastAppliedTick`, `appliedSequence`)
- Export new symbols additively from `src/engine/network/index.js` only.
- Extend `tests/final/MultiplayerNetworkingStack.test.mjs` to validate:
  - replication envelope validation
  - client authoritative apply behavior
  - stale update rejection
  - existing handshake and server-runtime coverage still passing

## Acceptance criteria
- Replication contract documented and implemented.
- Client application model defined and implemented.
- Reconciliation rules established and enforced by tests.
- No existing engine network exports are removed or renamed.
- Existing Level 12.1 and 12.2 networking tests remain green.

## Validation
Run only:
- `node --check src/engine/network/ReplicationMessageContract.js`
- `node --check src/engine/network/ClientReplicationApplicationLayer.js`
- `node --check src/engine/network/ClientReconciliationStrategy.js`
- `node --input-type=module -e "import('./tests/final/MultiplayerNetworkingStack.test.mjs').then(async ({ run }) => { await run(); console.log('PASS MultiplayerNetworkingStack'); })"`
- `node --input-type=module -e "import('./tests/production/EnginePublicBarrelImports.test.mjs').then(async ({ run }) => { await run(); console.log('PASS EnginePublicBarrelImports'); })"`

## Non-goals
- no client prediction implementation
- no rollback implementation
- no gameplay-specific coupling
- no UI/debug expansion
- no engine core API redesign
- no repo-wide cleanup or unrelated refactor

## Working tree rule
If the tree is already dirty, ignore unrelated files and modify only the scoped files for this PR purpose.
