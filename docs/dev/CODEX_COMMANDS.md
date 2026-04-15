MODEL: GPT-5.4
REASONING: high
COMMAND:
Implement BUILD_PR_LEVEL_12_10_REAL_NETWORK_SAMPLE_AND_DASHBOARD exactly as defined.

Required outcomes:
- add a real sample launcher entry to samples/index.html for sample 1319
- create samples/phase-13/1319/ as the canonical real-network sample
- create a runnable real server path for 1319
- create a live dashboard surface backed by real session/runtime data
- keep the sample minimal and testable
- do not use simulation-only networking as the primary path

Target files:
- samples/index.html
- samples/phase-13/1319/index.html
- samples/phase-13/1319/main.js
- samples/phase-13/1319/game/RealNetworkLaunchScene.js
- samples/phase-13/1319/server/realNetworkServer.mjs
- samples/phase-13/1319/server/realNetworkDashboard.mjs
- samples/phase-13/1319/server/README.md
- samples/phase-13/1319/server/docker-compose.yml
- src/engine/network/index.js only if additive exports are required

Run real validation:
1. samples/index.html shows a working 1319 entry
2. real server boots
3. sample 1319 connects to the real server
4. two clients can join
5. authoritative state updates are visible across clients
6. disconnect/reconnect works
7. dashboard shows players, sessions, RTT, RX, TX, and live per-player updates
8. focused network + 2D regression smoke passes

Update docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md by changing status markers only.
Do not modify roadmap wording, structure, add content, or delete content.
