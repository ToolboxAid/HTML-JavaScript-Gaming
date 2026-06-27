# LEVEL_12_4_PLAYABLE_MULTIPLAYER_VALIDATION_CHECKLIST

## Minimal Playable Slice Checklist

- [x] server runtime starts in `running` phase
- [x] client connects and session reaches `active`
- [x] one minimal shared action (`move`) is accepted by server input ingestion
- [x] authoritative state updates on server side after action
- [x] authoritative snapshot is replicated to client
- [x] client applies replicated snapshot with no ignore on primary update
- [x] synchronized observable state matches on host/client for validation entity
- [x] disconnect path reaches `disconnected` on both sides
- [x] server stop/cleanup completes with no pending input queue residue
- [x] client replication layer ends with no pending envelopes

## Repeatable Validation Commands

- `node --input-type=module -e "import('./tests/final/MultiplayerNetworkingStack.test.mjs').then(async ({ run }) => { await run(); console.log('PASS MultiplayerNetworkingStack'); })"`
- `node --input-type=module -e "import('./tests/production/EnginePublicBarrelImports.test.mjs').then(async ({ run }) => { await run(); console.log('PASS EnginePublicBarrelImports'); })"`
