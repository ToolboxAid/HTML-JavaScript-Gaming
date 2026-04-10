MODEL: GPT-5.4
REASONING: high

COMMAND:

Create APPLY_PR_NETWORK_SAMPLES_RELOCATION_FROM_GAMES_TO_SAMPLES

Apply the approved relocation exactly as documented in BUILD_PR_NETWORK_SAMPLES_RELOCATION_FROM_GAMES_TO_SAMPLES (v3).

Execution rules:
- Move only:
  - games/network_sample_a
  - games/network_sample_b
  - games/network_sample_c
- Destination only:
  - samples/Phase 13 - Network Concepts, Latency & Simulation (1301-1315)/1316_network_sample_a
  - samples/Phase 13 - Network Concepts, Latency & Simulation (1301-1315)/1317_network_sample_b
  - samples/Phase 13 - Network Concepts, Latency & Simulation (1301-1315)/1318_network_sample_c
- Remove corresponding entries from games/index.html
- Add corresponding entries to samples/index.html
- Preserve behavior and folder contents
- Do not change gameplay, engine code, assets, or unrelated indexes

Validation:
- Confirm samples launch from new locations
- Confirm no duplicate index exposure
- Confirm no broken relative paths
- Confirm tests remain green
- Package only the required apply-ready delta

Output:
- Commit-ready apply bundle
- Keep docs under docs/pr and docs/dev
- Keep reports under docs/dev/reports
- Target zip path:
  HTML-JavaScript-Gaming/tmp/APPLY_PR_NETWORK_SAMPLES_RELOCATION_FROM_GAMES_TO_SAMPLES.zip
