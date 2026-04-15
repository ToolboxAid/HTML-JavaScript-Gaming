# BUILD_PR_LEVEL_12_2_AUTHORITATIVE_SERVER_RUNTIME

## Purpose
Implement the first authoritative server runtime slice on top of Level 12.1 transport/session contracts with no engine API breakage.

## Scope
Primary target files:
- `src/engine/network/AuthoritativeServerRuntime.js`
- `src/engine/network/AuthoritativeInputIngestionContract.js`
- `src/engine/network/index.js`
- `tests/final/MultiplayerNetworkingStack.test.mjs`
- `docs/pr/LEVEL_12_2_AUTHORITATIVE_SERVER_RUNTIME_CONTRACTS.md`

Allowed nearby reads:
- `src/engine/network/TransportContract.js`
- `src/engine/network/SessionLifecycleContract.js`
- `src/engine/network/HandshakeSimulator.js`
- `src/engine/network/HostServerBootstrap.js`
- `docs/pr/LEVEL_12_1_REAL_NETWORK_FOUNDATION_CONTRACTS.md`

## Required implementation
- Add an authoritative server runtime contract with an isolated tick loop that can run independently of gameplay code.
- Add a client input ingestion contract that validates and normalizes input envelopes before queueing.
- Enforce server-owned state boundaries so only server runtime code mutates authoritative state snapshots.
- Keep handshake simulation compatible and testable with Level 12.1 foundations.
- Export new runtime/contract symbols additively from `src/engine/network/index.js` only.
- Extend `tests/final/MultiplayerNetworkingStack.test.mjs` with focused assertions for:
  - runtime loop start/step/stop behavior
  - input ingestion acceptance and rejection paths
  - server ownership boundary protection
  - existing handshake simulation still passing

## Acceptance criteria
- Server runtime contract documented and implemented.
- Input ingestion contract documented and implemented.
- Authoritative ownership boundaries are enforced by runtime behavior and tests.
- No existing engine network exports are removed or renamed.
- Existing handshake simulation remains green.

## Validation
Run only:
- `node --check src/engine/network/AuthoritativeServerRuntime.js`
- `node --check src/engine/network/AuthoritativeInputIngestionContract.js`
- `node --input-type=module -e "import('./tests/final/MultiplayerNetworkingStack.test.mjs').then(async ({ run }) => { await run(); console.log('PASS MultiplayerNetworkingStack'); })"`
- `node --input-type=module -e "import('./tests/production/EnginePublicBarrelImports.test.mjs').then(async ({ run }) => { await run(); console.log('PASS EnginePublicBarrelImports'); })"`

## Non-goals
- no replication implementation
- no gameplay coupling
- no UI/debug expansion
- no engine core API redesign
- no repo-wide cleanup or unrelated refactor

## Working tree rule
If the tree is already dirty, ignore unrelated files and modify only the scoped files for this PR purpose.
