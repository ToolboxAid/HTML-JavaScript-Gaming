# Apply Validation Spec

## Required Validation
1. Import checks pass for:
   - old_games/network_sample_c/main.js
   - old_games/network_sample_c/game/FakeDivergenceTraceNetworkModel.js
   - old_games/network_sample_c/game/NetworkSampleCScene.js
   - old_games/network_sample_c/game/StateTimelineBuffer.js
   - old_games/network_sample_c/game/ReconciliationLayerAdapter.js
   - old_games/network_sample_c/debug/networkSampleCDebug.js

2. Smoke validation confirms:
   - rewind prep status becomes `ready` under divergence
   - replay executes successfully
   - replayed frame count is greater than zero when divergence exists
   - timeline buffer remains bounded after replay
   - timeline snapshots after anchor frame are replaced by replayed results

3. Manual validation in sample page:
   - `W` refreshes rewind-prep state
   - `X` executes rewind replay
   - debug panel shows replay status and timeline state
