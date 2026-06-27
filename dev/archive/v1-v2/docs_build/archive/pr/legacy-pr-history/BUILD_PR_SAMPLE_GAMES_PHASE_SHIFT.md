Toolbox Aid
David Quesenberry
03/31/2026
BUILD_PR_SAMPLE_GAMES_PHASE_SHIFT.md

### BUILD_PR
Docs-only bundle for Phase 12 Sample Games insertion and subsequent sample phase shift.

### Goal
Insert a new folder and index section for:
- samples/Phase 12 - Sample Games/

Shift later sample phases by +1 so numbering remains continuous:
- current Phase 12 - Network Concepts, Latency & Simulation (1201-1215) -> Phase 13 - Network Concepts, Latency & Simulation (1301-1315)
- current Phase 13 - Editor + Automation + Trust + Pipeline (1301-1318) -> Phase 14 - Editor + Automation + Trust + Pipeline (1401-1418)
- current Phase 14 - Advanced Systems (1401-1406) -> Phase 15 - Advanced Systems (1501-1506)

### Required repo changes for Codex
- Create the new Phase 12 Sample Games folder under samples/
- Rename the later phase folders to the new phase numbers and ranges
- Update samples/index.html so the folder list and visual ordering match the new folder structure exactly
- Add the new Phase 12 Sample Games section between Phase 11 and the shifted Phase 13 section

### Constraints
- No engine changes
- No tool changes
- No sample logic changes
- No unrelated edits
- Preserve existing repo structure exactly
- Delta-only output

### Validation target
After execution, the repo should show:
- Phase 11 - Release + Deployment
- Phase 12 - Sample Games
- Phase 13 - Network Concepts, Latency & Simulation
- Phase 14 - Editor + Automation + Trust + Pipeline
- Phase 15 - Advanced Systems

### Output contract
Codex must produce a repo-structured delta ZIP at:
- <project folder>/tmp/BUILD_PR_SAMPLE_GAMES_PHASE_SHIFT_delta.zip
