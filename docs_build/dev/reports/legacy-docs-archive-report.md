# Legacy Docs Archive Report

Date: 2026-06-26
Branch: PR_26177_OWNER_007-project-instructions-single-source-eod-lock
Status: PASS

## Files Moved

Moved verified old/superseded DoD material:

- `docs_build/dev/dod/tool_ui_readiness_dod.md` -> `archive/docs_build/dev/dod/tool_ui_readiness_dod.md`

Moved verified old/superseded roadmap material:

- `docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` -> `archive/docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE.md`
- `docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE_LEVEL_8_APPEND.md` -> `archive/docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE_LEVEL_8_APPEND.md`
- `docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE_LEVEL_8_UPDATE.md` -> `archive/docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE_LEVEL_8_UPDATE.md`
- `docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE_LEVEL_8_UPDATE_8_19.md` -> `archive/docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE_LEVEL_8_UPDATE_8_19.md`
- `docs_build/dev/roadmaps/MASTER_ROADMAP_RECOVERY.md` -> `archive/docs_build/dev/roadmaps/MASTER_ROADMAP_RECOVERY.md`
- `docs_build/dev/roadmaps/MASTER_ROADMAP_SAMPLES2TOOLS.md` -> `archive/docs_build/dev/roadmaps/MASTER_ROADMAP_SAMPLES2TOOLS.md`
- `docs_build/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` -> `archive/docs_build/dev/roadmaps/MASTER_ROADMAP_TOOLS.md`
- `docs_build/dev/roadmaps/MIDI_STUDIO_V2_ROADMAP.md` -> `archive/docs_build/dev/roadmaps/MIDI_STUDIO_V2_ROADMAP.md`
- `docs_build/dev/roadmaps/phases.txt` -> `archive/docs_build/dev/roadmaps/phases.txt`
- `docs_build/dev/roadmaps/README.md` -> `archive/docs_build/dev/roadmaps/README.md`

## Folders Removed

- `docs_build/dev/dod/` removed because it was empty after the move.
- `docs_build/dev/roadmaps/` not removed because unlisted roadmap files remain there.

## Verification Notes

- PASS: Existing repository root `archive/` was used.
- PASS: No `docs_build/dev/archive/` folder was created.
- PASS: No new `docs_build/dev/ProjectInstructions/archive/` path was created.
- PASS: Active archive guidance now points to `archive/docs_build/dev/ProjectInstructions/history/`.
- PASS: Active governance remains only in `docs_build/dev/ProjectInstructions/`.

## Superseded Status

The moved files are treated as legacy/superseded because current active governance is under `docs_build/dev/ProjectInstructions/`; current backlog, workflow, status, environment, tool MVP, no-mock repository, and preservation rules are indexed from that folder.
