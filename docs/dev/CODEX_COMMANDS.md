Toolbox Aid
David Quesenberry
03/31/2026
CODEX_COMMANDS.md

MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_SAMPLE_GAMES_PHASE_SHIFT as a docs-first repo-structured delta bundle only. Do not add implementation logic beyond the repo changes required for the approved sample-folder reorganization. Follow PLAN_PR -> BUILD_PR -> APPLY_PR. Preserve exact repo-relative structure. Delta only.

Use the current sample structure from the existing repo state and apply these repo changes:

1) CREATE NEW PHASE
- Create folder:
  samples/Phase 12 - Sample Games/

2) SHIFT LATER PHASE FOLDERS UP BY +1
- Rename:
  samples/Phase 12 - Network Concepts, Latency & Simulation (1201-1215)/
  to
  samples/Phase 13 - Network Concepts, Latency & Simulation (1301-1315)/

- Rename:
  samples/Phase 13 - Editor + Automation + Trust + Pipeline (1301-1318)/
  to
  samples/Phase 14 - Editor + Automation + Trust + Pipeline (1401-1418)/

- Rename:
  samples/Phase 14 - Advanced Systems (1401-1406)/
  to
  samples/Phase 15 - Advanced Systems (1501-1506)/

3) UPDATE INDEX
- Update:
  samples/index.html
- Insert a new folder-list entry and visual section for:
  Phase 12 - Sample Games
- Place it between:
  Phase 11 - Release + Deployment
  and
  Phase 13 - Network Concepts, Latency & Simulation
- Update all visible phase labels and folder references so they match the shifted names exactly

4) VALIDATE
- No duplicate phase numbers
- No missing phase numbers from 01 through 15
- samples/index.html matches folder names exactly
- No unrelated files changed
- No engine, tool, or sample logic changes

5) OUTPUT ZIP (MANDATORY)
- Create repo-structured delta ZIP containing only changed/added files
- Write output to:
  <project folder>/tmp/BUILD_PR_SAMPLE_GAMES_PHASE_SHIFT_delta.zip
