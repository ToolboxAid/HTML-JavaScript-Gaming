# PR_26140_073 Engine Network Index Barrel Removal

## Scope
- Removed only the targeted `src/engine/network/index.js` barrel.
- Replaced active imports from the network barrel with direct canonical imports.
- Import-only edits were made where required.
- Did not change schemas.
- Did not touch sample JSON.
- Did not remove sample/game entry `index.js` files.
- Did not remove `src/engine/core/index.js`.
- Did not run PR_26140_074 until this PR validated.

## Target Barrel
- Deleted: `src/engine/network/index.js`

## Direct Import Updates
- `samples/phase-13/1301/NetworkingLayerScene.js`
- `samples/phase-13/1302/StateSyncReplicationScene.js`
- `samples/phase-13/1304/ClientPredictionReconciliationScene.js`
- `samples/phase-13/1305/SerializationSystemScene.js`
- `samples/phase-13/1306/NetworkDebugOverlayScene.js`
- `samples/phase-13/1307/RemoteEntityInterpolationScene.js`
- `samples/phase-13/1308/LobbySessionSystemScene.js`
- `samples/phase-13/1310/HostServerBootstrapScene.js`
- `samples/phase-13/1311/InterestManagementScene.js`
- `samples/phase-13/1312/LagPacketLossSimulationScene.js`
- `samples/phase-13/1314/ChatPresenceLayerScene.js`
- `samples/phase-13/1315/RollbackReplayDiagnosticsScene.js`
- `samples/phase-13/1319/server/realNetworkServer.mjs`
- `tests/final/MultiplayerNetworkingStack.test.mjs`

## Validation
- PASS: `node --check` for the 14 PR73 changed JS/MJS files.
- PASS: direct import target validation for the 14 PR73 changed JS/MJS files.
- PASS: no active references to `engine/network/index.js` remain in repo-owned JS/MJS outside reports/results.
- PASS: `src/engine/network/index.js` no longer exists.
- PASS: `node --input-type=module -e "const m = await import('./tests/final/MultiplayerNetworkingStack.test.mjs'); await m.run(); console.log('PASS MultiplayerNetworkingStack');"`
- PASS: `npm run test:workspace-v2`
  - 59 passed.

## Not Run
- Full samples smoke test was not run.

## Delta ZIP
- `tmp/PR_26140_073-remove-engine-network-index-barrels_delta.zip`
