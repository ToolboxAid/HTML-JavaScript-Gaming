# BUILD_PR_LEVEL_12_4_PLAYABLE_MULTIPLAYER_VALIDATION

## Purpose
Execute one minimal playable real-multiplayer validation slice on top of completed Level 12.1, 12.2, and 12.3 network layers.

## Scope
Primary target files:
- `tests/final/MultiplayerNetworkingStack.test.mjs`
- `docs/pr/LEVEL_12_4_PLAYABLE_MULTIPLAYER_VALIDATION_CHECKLIST.md`
- `docs/pr/LEVEL_12_4_PLAYABLE_MULTIPLAYER_VALIDATION_FAILURE_MODES.md`
- `docs/pr/APPLY_PR_LEVEL_12_4_PLAYABLE_MULTIPLAYER_VALIDATION.md`

Allowed nearby reads:
- `src/engine/network/LoopbackTransport.js`
- `src/engine/network/HandshakeSimulator.js`
- `src/engine/network/AuthoritativeServerRuntime.js`
- `src/engine/network/ClientReplicationApplicationLayer.js`
- `docs/pr/LEVEL_12_3_REPLICATION_CLIENT_APPLICATION_CONTRACTS.md`

## Required implementation
- Add one validation-only multiplayer scenario proving end-to-end flow in a single deterministic slice:
  - server starts
  - client connects and session reaches active state
  - authoritative state is replicated to client
  - one minimal shared action is observable on both sides
  - disconnect and cleanup complete without residue
- Keep scenario narrow and reusable; no feature expansion beyond validation.
- Produce repeatable validation checklist and failure-mode checklist docs.
- Record APPLY summary focused on validation evidence only.

## Acceptance criteria
- Real session startup and shutdown are validated in one repeatable slice.
- Live replication is observed at client for the chosen action.
- Validation and failure modes are documented and reproducible.
- Scope remains one playable validation slice only.
- No 3D work is introduced.

## Validation
Run only:
- `node --input-type=module -e "import('./tests/final/MultiplayerNetworkingStack.test.mjs').then(async ({ run }) => { await run(); console.log('PASS MultiplayerNetworkingStack'); })"`
- `node --input-type=module -e "import('./tests/production/EnginePublicBarrelImports.test.mjs').then(async ({ run }) => { await run(); console.log('PASS EnginePublicBarrelImports'); })"`

## Non-goals
- no gameplay expansion beyond the one validation action
- no prediction/rollback lane work
- no debug platform expansion unless strictly required to validate the slice
- no tool expansion
- no 3D/Phase 16 work
- no roadmap wording or structure edits

## Working tree rule
If the tree is already dirty, ignore unrelated files and modify only the scoped files for this PR purpose.
