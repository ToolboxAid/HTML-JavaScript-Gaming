MODEL: GPT-5.4
REASONING: high

COMMAND:
Execute BUILD_PR_NETWORK_SAMPLES_RELOCATION_FROM_GAMES_TO_SAMPLES (v3)

Rules:
- Use EXACT destination path:
  samples/Phase 13 - Network Concepts, Latency & Simulation (1301-1315)/
- Move (not copy)
- Add tiles to samples/index
- Remove entries from games/index.html
- Remove original folders
- Do NOT touch unrelated files
- Fail fast on ambiguity
