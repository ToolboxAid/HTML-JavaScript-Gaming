# PR_26180_OWNER_002 Product Backlog Discovery Report

Generated: 2026-06-28

## Executive Summary

The repository currently has an authoritative active product backlog:

`dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md`

That file explicitly states that the backlog is the authoritative source for determining the next logical PRs. Active Project Instructions reinforce that decision through:

- `dev/build/ProjectInstructions/addendums/team_backlog_sod_eod_standard.md`
- `dev/build/ProjectInstructions/addendums/build_path_sync.md`
- `dev/build/ProjectInstructions/addendums/status_model.md`
- `dev/build/ProjectInstructions/team_assignments/team_ownership.md`
- `dev/build/ProjectInstructions/TEAM_START_COMMANDS.md`

Before the governance reorganization, the backlog function existed mainly as roadmap documents under the old `docs_build/dev/roadmaps/` structure. Those files still exist under:

`dev/archive/legacy-docs-build/roadmaps/`

The old roadmaps were not deleted. They were archived. However, some detailed product and platform planning in those roadmaps has not been fully merged into the active `BACKLOG_MASTER.md`. No information appears physically lost from the repository, but some roadmap detail is no longer active backlog material unless Owner intentionally recovers it.

Recommended strategy: keep `BACKLOG_MASTER.md` as the single active backlog and run a follow-up governance PR to merge still-relevant planning details from archived roadmaps, database planning files, and tool UAT documents into `BACKLOG_MASTER.md` or linked subordinate backlog sections. Do not create a competing `PROJECT_BACKLOG.md`.

## Determinations

1. Did a canonical backlog previously exist?
   - Yes. Before the reorganization, roadmap-style canonical planning existed under `docs_build/dev/roadmaps/`, now archived under `dev/archive/legacy-docs-build/roadmaps/`.

2. What file(s) contained it?
   - `MASTER_ROADMAP_ENGINE.md`
   - `MASTER_ROADMAP_FEATURES.md`
   - `MASTER_ROADMAP_TOOLS.md`
   - `MIDI_STUDIO_V2_ROADMAP.md`
   - `POST_MIGRATION_PLATFORM_ROADMAP.md`
   - `MASTER_ROADMAP_SAMPLES2TOOLS.md`
   - `MASTER_ROADMAP_STYLE.md`
   - `MASTER_ROADMAP_RECOVERY.md`
   - Level 8 roadmap append/update files
   - `phases.txt`

3. Is it still present?
   - Yes. The files are present in `dev/archive/legacy-docs-build/roadmaps/`.

4. Was it renamed?
   - Not as a direct file rename. The active source-of-truth role was replaced by `dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md`, while legacy roadmaps were archived.

5. Was it split into multiple files?
   - Yes. Current backlog governance is split across active backlog, team ownership, team assignment, status model, and Build Path sync documents.

6. Was it accidentally abandoned during repository reorganization?
   - Partially. The active backlog was preserved as `BACKLOG_MASTER.md`, but some detailed roadmap content is only archived and not fully represented in the active backlog.

7. What currently serves as the backlog?
   - `dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md`

8. What information appears to have been lost, if any?
   - No tracked files appear lost. Potentially stranded details include the old tool rebuild sequence, detailed MIDI Studio V2 remaining work, platform roadmap phases, and old engine/toolchain roadmap status details.

## Candidate Backlog Documents

| Path | Purpose | Current status | Recommendation |
| --- | --- | --- | --- |
| `dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md` | Active team/product backlog and next-PR source of truth | Active SSoT | Keep |
| `dev/build/ProjectInstructions/addendums/team_backlog_sod_eod_standard.md` | Defines backlog tracking fields, SOD/EOD update rules, and authority of backlog over reports | Active governance | Keep |
| `dev/build/ProjectInstructions/addendums/build_path_sync.md` | Syncs Build Path and Game Journey tile status to backlog status | Active governance | Keep |
| `dev/build/ProjectInstructions/addendums/status_model.md` | Defines status markers and tile overlay/status rules | Active governance | Keep |
| `dev/build/ProjectInstructions/team_assignments/team_ownership.md` | Maps product areas to active teams | Active governance | Keep |
| `dev/build/ProjectInstructions/TEAM_START_COMMANDS.md` | Tells teams to pull items from `BACKLOG_MASTER.md` | Active workflow | Keep, but avoid duplicating backlog content |
| `dev/archive/legacy-docs-build/roadmaps/README.md` | Former roadmap folder README that still calls the folder active | Archived but stale wording | Replace or archive-only note in future cleanup |
| `dev/archive/legacy-docs-build/roadmaps/MASTER_ROADMAP_ENGINE.md` | Former high-level engine/runtime/toolchain roadmap | Archived historical roadmap | Merge any still-relevant open items, then keep archived |
| `dev/archive/legacy-docs-build/roadmaps/MASTER_ROADMAP_FEATURES.md` | Former feature roadmap with System Health closeout and future enhancements | Archived historical roadmap | Merge desired future enhancements, then keep archived |
| `dev/archive/legacy-docs-build/roadmaps/MASTER_ROADMAP_TOOLS.md` | Former core tool rebuild sequence | Archived historical roadmap | Merge useful tool rebuild sequence into active backlog |
| `dev/archive/legacy-docs-build/roadmaps/MIDI_STUDIO_V2_ROADMAP.md` | Detailed MIDI Studio V2 work list | Archived product roadmap | Merge into Bravo MIDI backlog item if still desired |
| `dev/archive/legacy-docs-build/roadmaps/POST_MIGRATION_PLATFORM_ROADMAP.md` | Platform phases for identity, projects, assets, manifests, publishing, community, marketplace | Archived planning roadmap | Merge strategic phases into active Owner/product backlog |
| `dev/archive/legacy-docs-build/roadmaps/MASTER_ROADMAP_SAMPLES2TOOLS.md` | Former Samples2Tools roadmap, mostly complete | Archived historical roadmap | Keep archived |
| `dev/archive/legacy-docs-build/roadmaps/MASTER_ROADMAP_STYLE.md` | Former style/theme roadmap | Archived historical roadmap | Keep archived unless Theme V2 backlog needs recovery |
| `dev/archive/legacy-docs-build/roadmaps/MASTER_ROADMAP_RECOVERY.md` | Recovery lane closeout | Archived historical roadmap | Keep archived |
| `dev/build/database/ddl/tool-planning.sql` | Database model for tool planning | Active database planning material | Keep as schema support, not backlog SSoT |
| `dev/build/database/dml/tool-planning.sql` | Tool planning DML support | Active database planning material | Keep as data-layer support, not backlog SSoT |
| `dev/build/database/seed/tool-planning.json` | Tool planning seed data | Active seed/reference material | Keep as data-layer support, not backlog SSoT |
| `dev/build/tools/*/uat.md` | Per-tool UAT plans | Active tool reference material | Keep and link from backlog items where relevant |
| `dev/build/operations/ROADMAP_GUARDRAILS.md` | Old roadmap guardrails using obsolete `docs_build/dev/roadmaps/` paths | Stale active-path wording | Replace with pointer to current backlog governance |
| `dev/build/operations/ROADMAP_RULES.md` | Evidence-backed roadmap status rules | Stale roadmap-era governance | Merge useful rules into backlog governance |
| `dev/build/operations/paths.md` | Old path constants for roadmap location | Stale path documentation | Archive or replace |

## Product Areas Found

| Product area | Documentation evidence |
| --- | --- |
| Objects | `BACKLOG_MASTER.md`, `team_ownership.md`, `dev/build/database/ddl/objects.sql`, `dev/build/database/seed/objects.json`, Objects tool pages/reports |
| Sprites | `BACKLOG_MASTER.md`, `team_ownership.md`, `dev/build/database/seed/guest/sprites.json`, Sprites tool pages/reports, legacy tool roadmaps |
| Messages | `BACKLOG_MASTER.md`, `team_ownership.md`, `dev/build/database/ddl/messages.sql`, `dev/build/database/dml/messages.sql`, `dev/build/database/seed/messages.json` |
| MIDI | `BACKLOG_MASTER.md`, `team_ownership.md`, `MIDI_STUDIO_V2_ROADMAP.md`, MIDI tool page/reports |
| Audio | `BACKLOG_MASTER.md`, `team_ownership.md`, `MIDI_STUDIO_V2_ROADMAP.md`, `dev/build/database/seed/guest/audio.json`, Audio tool pages/reports |
| Palette | `BACKLOG_MASTER.md`, `team_ownership.md`, palette database docs/seeds, Palette Manager UAT, legacy engine/tool roadmap references |
| Tags | `BACKLOG_MASTER.md`, `dev/build/database/ddl/tags.sql`, `dev/build/database/dml/tags.sql`, `dev/build/database/seed/tags.json` |
| Controls | `BACKLOG_MASTER.md`, `team_ownership.md`, `dev/build/database/ddl/controls.sql`, Controls reports/tool pages |
| Worlds | `BACKLOG_MASTER.md`, `dev/build/database/seed/guest/worlds.json`, Worlds pages/reports |
| Rules | `BACKLOG_MASTER.md` lists Alfa Rules; runtime/game-rule reports provide historical implementation evidence |
| Journey | `BACKLOG_MASTER.md`, `build_path_sync.md`, `status_model.md`, `dev/build/database/ddl/game-journey.sql`, DML/seed files |
| Game Hub | `BACKLOG_MASTER.md`, `team_ownership.md`, `dev/build/database/ddl/game-workspace.sql`, DML/seed files |
| Learning | `BACKLOG_MASTER.md`, `learn/` pages, `dev/build/database/seed/guest/learn.json` |
| Publish | `BACKLOG_MASTER.md`, publish standards/contracts, `toolbox/publish/`, `learn/publish/`, `POST_MIGRATION_PLATFORM_ROADMAP.md` |
| Marketplace | `BACKLOG_MASTER.md`, marketplace standards/contracts, `marketplace/`, `toolbox/marketplace/`, `POST_MIGRATION_PLATFORM_ROADMAP.md` |
| Assets | `BACKLOG_MASTER.md`, asset DDL/seed docs, Asset Manager UAT, asset standards/contracts, asset reports |

Additional areas found in active backlog or supporting docs:

- Idea Board
- Game Concept Notes
- Creator Learning
- Game Design
- Game Configuration
- Game Crew
- Characters
- Object Behaviors
- Environment Settings
- Level Layouts
- Interface Layouts
- Fonts
- Languages
- Input Mapping
- Hitboxes
- Events
- Custom Extensions
- Achievements
- Saved Data
- Game Testing
- Debug
- Performance
- Build Game
- Platform Settings
- Game Migration
- Community
- Ratings
- Cloud

## Recommendation

Use this authoritative backlog strategy:

Merge existing planning documents into the current `BACKLOG_MASTER.md` model.

Do not create a new `PROJECT_BACKLOG.md` because `BACKLOG_MASTER.md` is already named by active Project Instructions as the source of truth. A new competing backlog file would create another governance surface.

Recommended follow-up PR:

`PR_26180_OWNER_003-backlog-recovery-and-roadmap-merge`

Suggested scope:

1. Keep `BACKLOG_MASTER.md` as the active backlog SSoT.
2. Audit archived roadmaps for still-relevant unchecked or in-progress items.
3. Merge selected details from:
   - `MASTER_ROADMAP_TOOLS.md`
   - `MIDI_STUDIO_V2_ROADMAP.md`
   - `POST_MIGRATION_PLATFORM_ROADMAP.md`
   - relevant `MASTER_ROADMAP_ENGINE.md` open items
4. Add links from active backlog items to per-tool UAT docs where useful.
5. Mark stale active operations docs that still mention `docs_build/dev/roadmaps/` as superseded or archive-only.
6. Preserve archived roadmaps as historical reference, not active backlog authority.

## Scope Confirmation

- Runtime files modified: No
- UI files modified: No
- API files modified: No
- Database files modified: No
- Implementation code modified: No
- Governance report files only: Yes

