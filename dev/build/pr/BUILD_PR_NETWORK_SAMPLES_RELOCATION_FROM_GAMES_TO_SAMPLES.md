# BUILD PR — Network Samples Relocation From Games To Samples (v3 CORRECTED PATH)

## Purpose
Move network samples from games → samples using the correct Phase 13 directory,
update samples index, and remove from games index.

## CORRECT DESTINATION (REQUIRED)
All network samples MUST be placed under:

samples/Phase 13 - Network Concepts, Latency & Simulation (1301-1315)/

## Exact Mapping
- games/network_sample_a →
  samples/Phase 13 - Network Concepts, Latency & Simulation (1301-1315)/1316-network-sample-a/

- games/network_sample_b →
  samples/Phase 13 - Network Concepts, Latency & Simulation (1301-1315)/1317-network-sample-b/

- games/network_sample_c →
  samples/Phase 13 - Network Concepts, Latency & Simulation (1301-1315)/1318-network-sample-c/

## Required Steps

1. MOVE (not copy)
   Move all files/folders from:
   - games/network_sample_a
   - games/network_sample_b
   - games/network_sample_c

   into the corrected Phase 13 path above.

2. PRESERVE BEHAVIOR
   - Fix only relative paths required due to relocation
   - Do NOT refactor logic

3. UPDATE samples/index
   Add tiles for:
   - 1316 — Network Sample A
   - 1317 — Network Sample B
   - 1318 — Network Sample C

   Each tile must launch the correct relocated entrypoint.

4. UPDATE games/index.html
   - REMOVE all references to:
     - network_sample_a
     - network_sample_b
     - network_sample_c

5. CLEANUP
   - Remove original folders:
     - games/network_sample_a
     - games/network_sample_b
     - games/network_sample_c

## Rules
- Do NOT modify other games
- Do NOT change template
- Do NOT refactor engine/shared
- Fail fast if pathing is unclear

## Acceptance Criteria
- All three samples exist in corrected Phase 13 directory
- samples/index tiles work (1316–1318)
- games/index.html no longer references network samples
- Original folders removed
- Behavior preserved

## Output
<project folder>/tmp/BUILD_PR_NETWORK_SAMPLES_RELOCATION_FROM_GAMES_TO_SAMPLES_delta.zip
