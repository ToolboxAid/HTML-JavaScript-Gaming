# APPLY_PR: Network Samples Relocation from `games/` to `samples/Phase 13`

## Purpose
Apply the approved relocation outcome for Network Samples A/B/C in Phase 13 using the required underscore destination names.

## Input
- `BUILD_PR_NETWORK_SAMPLES_RELOCATION_FROM_GAMES_TO_SAMPLES (v3)`

## Required Destination
- `samples/Phase 13 - Network Concepts, Latency & Simulation (1301-1315)/1316_network_sample_a`
- `samples/Phase 13 - Network Concepts, Latency & Simulation (1301-1315)/1317_network_sample_b`
- `samples/Phase 13 - Network Concepts, Latency & Simulation (1301-1315)/1318_network_sample_c`

## Applied Changes
1. Normalized Phase 13 sample folder names from hyphen to underscore:
   - `1316-network-sample-a` -> `1316_network_sample_a`
   - `1317-network-sample-b` -> `1317_network_sample_b`
   - `1318-network-sample-c` -> `1318_network_sample_c`
2. Updated `samples/index.html` links for 1316-1318 to the underscore destinations.
3. Confirmed `games/index.html` has no network sample entries (no additional edit required).
4. Fixed one cross-sample import path in `1317_network_sample_b` that still referenced the old `1316-network-sample-a` folder name.
5. Preserved gameplay/sample internals and assets.

## Validation
- Destination folders exist and launch entrypoints are present:
  - each relocated sample contains `index.html` and `main.js`
- No duplicate index exposure:
  - `games/index.html` contains no `network_sample_*` entries
  - `samples/index.html` contains one tile each for 1316/1317/1318
- Relative launch paths resolve (`index.html` -> `./main.js` in all three samples)
- Test status:
  - `pretest` guard passes after baseline path normalization
  - full `npm test` is blocked in this environment (`node v20.8.1` lacks `node:module` export `registerHooks`)

## Scope Guard
- No gameplay code changes
- No engine/shared runtime behavior changes
- No unrelated index changes
