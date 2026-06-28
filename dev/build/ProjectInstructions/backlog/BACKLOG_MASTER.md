# BACKLOG_MASTER

## Backlog Item Tracking Standard

Canonical backlog tracking owner: `dev/build/ProjectInstructions/addendums/team_backlog_sod_eod_standard.md`.

This file is the authoritative source for assigned product work.

This document is updated as work status changes, including Owner assignment, reprioritization, completion, deferral, accepted PRs, SOD review, and EOD review.

`BACKLOG_MASTER.md` is now the canonical team/product-area assignment and status source. Future backlog changes must update this structure directly.

Each product area must include status and percent complete.

Every active team owns an active backlog when it has assigned work.

Backlog entries in this file follow the canonical field list, including:

- Name
- Description
- Product area
- Status
- Current completion percentage
- Active PR, when one exists
- Next milestone
- Remaining work
- Blocking dependencies
- Owning team
- Source or reference

Completion percentages are updated at SOD, after every accepted PR, and at EOD.

The backlog is the authoritative source for determining the next logical PRs.

## Owner Assignments

### Repository Architecture Simplification

- Team: Owner
- Product Area: Repository Architecture Simplification
- Status: Active
- Percent Complete: 20%
- Active PR: PR_26180_OWNER_007-www-route-root-compatibility
- Next Milestone: Move browser-served application to `www/`
- Source / Reference: `dev/build/ProjectInstructions/repository/repository_layout_architecture_plan.md`; `dev/build/ProjectInstructions/repository/www_migration_map.md`

## Game Journey MVP

### Idea

33% Complete — Dream, brainstorm, and explore early game concepts

- [x] Alfa - Idea Board
- [ ] Alfa - Game Concept Notes
- [ ] Alfa - Creator Learning

### Design

17% Complete — Shape the game's story, structure, and systems

- [x] Alfa - Game Hub
- [ ] Alfa - Game Design
- [ ] Alfa - Game Configuration
- [ ] Alfa - Game Crew
- [ ] Alfa - Tags
- [ ] Bravo - Messages

### Graphics

0% Complete — Create the visual look of your game

- [ ] Bravo - Asset Studio V2
- [ ] Charlie - Sprites canvas editor MVP
  - Sprites is a creator tool, not only an asset metadata library.
  - 5% Complete.
  - Remaining work: canvas/grid editor, width/height controls, Palette/Colors-only color selection, pixel painting, save/load sprite grid data through API/database, Product Owner testable workflow, and remove Category from Sprites planning.
  - Category is removed from Sprites MVP planning.
- [ ] Bravo - Animation Studio V2
- [ ] Charlie - Palette / Colors
  - 40% Complete.
  - Remaining work: color management, API/database integration, reusable color source of truth, Palette references for Sprites and Objects, and Product Owner testable workflow.
- [ ] Bravo - Video Studio

### Audio

0% Complete — Build sounds, music, and voices

- [ ] Bravo - Audio Studio V2
- [ ] Bravo - Audio Effects
- [ ] Bravo - MIDI Studio V2
- [ ] Bravo - Messages
- [ ] Bravo - Text To Speech
- [ ] Bravo - Voice Profiles

### Objects

0% Complete — Create the things players interact with

- [ ] Charlie - Objects
  - 0% Complete.
  - Objects includes object library, object editor, Sprite assignment, object properties, collision configuration, runtime object metadata, and Object API/database contracts.
  - Remaining work: object library, object editor, Sprite assignment, object properties, collision configuration, runtime object metadata, Object API/database contracts, and Product Owner testable workflow.
- [ ] Alfa - Characters
- [ ] Alfa - Object Behaviors

### Worlds

0% Complete — Build levels, maps, and places to explore

- [ ] Alfa - Worlds
- [ ] Alfa - Environment Settings
- [ ] Alfa - Level Layouts

### Interface

0% Complete — Design menus, HUDs, and player screens

- [ ] Alfa - Interface Layouts
- [ ] Alfa - Fonts
- [ ] Alfa - Languages

### Controls

0% Complete — Define how players interact with your game

- [ ] Alfa - Controls
- [ ] Alfa - Input Mapping
- [ ] Delta - Hitboxes

### Rules

0% Complete — Create gameplay behavior and events

- [ ] Alfa - Events
- [ ] Alfa - Rules
- [ ] Alfa - Custom Extensions

### Progression

0% Complete — Build rewards, unlocks, and advancement

- [ ] Alfa - Game Journey
- [ ] Alfa - Achievements
- [ ] Alfa - Saved Data

### Play Test

0% Complete — Test, debug, and improve your game

- [ ] Alfa - Game Testing
- [ ] Alfa - Debug
- [ ] Alfa - Performance

### Publish

0% Complete — Prepare and release your game

- [ ] Bravo - Publish
- [ ] Bravo - Build Game
- [ ] Bravo - Platform Settings
- [ ] Bravo - Game Migration

### Share

0% Complete — Grow your audience and community

- [ ] Bravo - Marketplace
- [ ] Bravo - Community
- [ ] Bravo - Ratings
- [ ] Bravo - Cloud

# Governance

100% Complete — Maintain project rules, team workflow, and Codex execution control

- [x] OWNER - Governance system production-ready for multi-team Codex workflow

  Notes:
  - ProjectInstructions root installed.
  - Preservation and archive governance installed.
  - Backlog governance installed.
  - Team assignment governance installed.
  - Canonical Owner/Alfa/Bravo/Charlie/Delta/Golf team naming installed.
  - OWNER override governance installed.
  - Branch persistence governance installed.
  - Day Work / EOD Merge governance installed.
  - Active Team Registry installed.
  - Build Path synchronization rules installed.
  - Tile overlay status rules installed.
  - Deprecation workflow installed.
  - Team start commands installed.

- [x] OWNER - Governance hygiene initiative complete

  Notes:
  - Workstream Hygiene governance verified.
  - PI Closeout governance verified.
  - GitHub Hygiene Audit governance verified.
  - EOD Workstream Closeout governance verified.
  - GitHub-authoritative workstream enforcement verified through push, local/origin sync, and GitHub hygiene review requirements.

- [x] OWNER - Multi-team workflow governance complete

  Notes:
  - Sequential Codex Queue governance verified through the all-team sequential PR execution model.
  - OWNER merge approval and EOD merge governance verified.
  - Team ownership governance verified through the authoritative ownership map.

- [x] Alfa - Team-aware local dev bootstrap runtime complete

  Notes:
  - Completion reference: PR #250 / `PR_26171_ALFA_009-team-aware-bootstrap`.
  - `npm run dev:bootstrap` is the primary team-aware local bootstrap command.
  - `npm run dev:local-api` remains as the legacy API alias.
  - `npm run dev:api` supports API-only startup.
  - `npm run dev:web` supports web-only startup.
  - `dev/bootstrap/start-dev.mjs` owns bootstrap orchestration.
  - `dev/bootstrap/team-port-config.mjs` owns team port resolution.
  - Team-aware `--team` runtime support is implemented.
  - Bootstrap orchestration, browser launch reporting, and port resolution are implemented.
  - Verified command: `npm run dev:bootstrap -- --team bravo`.
  - Observed verified output includes:
    - `GameFoundry team-aware dev bootstrap`
    - `Mode: bootstrap`
    - `Team: bravo`
    - `Web URL: http://127.0.0.1:5520`
    - `API URL: http://127.0.0.1:5521/api`
    - `Browser launch: http://127.0.0.1:5520/index.html`
    - `Supported teams: owner, alfa, bravo, charlie, delta, echo, foxtrot, golf, hotel`
  - Do not assign team-aware dev bootstrap, `dev:bootstrap`, team-port config, browser launch, bootstrap orchestration, or port resolution as remaining backlog work unless OWNER opens a new enhancement request.

- [x] OWNER - Repository hygiene governance complete

  Notes:
  - Open PR, draft PR, local branch, and remote branch review requirements verified.
  - Recommendation-only hygiene audit process verified.
  - Branch deletion and PR closure remain prohibited without explicit owner approval.

## Cancelled / Not Doing

### Environment Isolation & Developer Experience

Status: CANCELLED / NOT DOING

Items removed from backlog:
- Alfa/Beta/User isolation framework

Replacement governance:
- Multi-port workspace framework and runtime port management are no longer cancelled/not doing; they are implemented by the team-aware local dev bootstrap runtime item above.
- System Health remains one page per deployed environment.
- Each deployment actively checks only itself.
- Environment Summary, Database Health, Storage Health, Runtime Health, and Health Check History are Charlie System Health ownership.
- Environment governance follows the approved GFS infrastructure and System Health v1 documentation.

## Four-Team Backlog Alignment

Current OWNER clarification:
- The backlog alignment below preserves the current Alfa, Bravo, Charlie, and Delta ownership model.
- Golf is the only active replacement for the retired prior lane.
- Golf has no standing backlog ownership area in this file unless OWNER assigns one.
- Golf work may be OWNER-assigned, branch-backed, PR-backed, release, review packet, or cleanup work and must not silently replace Alfa, Bravo, Charlie, or Delta ownership.
- Historical PR references and branch names for retired non-canonical lanes are not renamed by this clarification.

### Alfa

- [ ] Alfa - Game Hub polish
- [ ] Alfa - Game Journey completion tracking
- [ ] Alfa - Journey progress calculations
- [ ] Alfa - Creator onboarding flow
- [ ] Alfa - Game Hub image integration

### Bravo

- [ ] Bravo - Audio tool improvements
- [ ] Bravo - Audio Effects tool
- [ ] Bravo - Messages tool
- [ ] Bravo - Emotion Profiles
- [ ] Bravo - TTS Profiles
- [ ] Bravo - Asset Browser enhancements
- [ ] Bravo - Vector Art improvements
- [ ] Bravo - MIDI Studio improvements

### Charlie

- Active ownership: Runtime, System Health, Environment Management, Palette / Colors, Sprites, Objects.
- Runtime: 100% Complete.
- System Health: 100% Complete.
- Environment Management: 100% Complete.
- Palette / Colors: 40% Complete.
- Sprites: 5% Complete.
- Objects: 0% Complete.
- [ ] Charlie - Guardrail hardening
- [ ] Charlie - Browser validation hardening
- [ ] Charlie - Remaining test relocation audit
- [ ] Charlie - Compliance baseline freeze
- [x] Charlie - System Health v1 complete
  - Completion reference: GitHub PR #158.
  - Completed slices:
    - [x] CHARLIE_012 Runtime Health
    - [x] CHARLIE_013 Service Health Dashboard
    - [x] CHARLIE_014 Configuration Summary
    - [x] CHARLIE_015 Manual Health Actions
    - [x] CHARLIE_016 Scheduled Health Monitoring Foundation
    - [x] CHARLIE_017 Health Notifications Foundation
    - [x] CHARLIE_018 Health API Contract Cleanup
    - [x] CHARLIE_019 Environment Capabilities
    - [x] CHARLIE_020 Admin API Registry
    - [x] CHARLIE_021 Runtime Feature Flags
    - [x] CHARLIE_022 Admin Health Test Suite
    - [x] CHARLIE_023 System Health Documentation
    - [x] CHARLIE_024 Operational Documentation
  - Future enhancements only:
    - scheduler execution engine
    - outbound notifications
    - external alert delivery
    - provider telemetry
    - charts and metrics
    - log viewer
    - operational automation
    - observability integrations
- [ ] Charlie - Infrastructure dashboard
- [ ] Charlie - Environment validation
- [ ] Charlie - Palette / Colors
  - Current completion percentage: 40%.
  - Remaining work: color management, API/database integration, reusable color source of truth, Palette references for Sprites and Objects, and Product Owner testable workflow.
- [ ] Charlie - Sprites canvas editor MVP
  - Current completion percentage: 5%.
  - Scope: canvas/grid editor, width/height controls, Palette/Colors-only color selection, pixel painting, save/load sprite grid data through API/database, Product Owner testable workflow, and remove Category from Sprites planning.
- [ ] Charlie - Objects
  - Current completion percentage: 0%.
  - Scope: object library, object editor, Sprite assignment, object properties, collision configuration, runtime object metadata, Object API/database contracts, and Product Owner testable workflow.

### Delta

- [x] Delta - Shared JS consolidation
  - Completion reference: PR_26175_DELTA_002_Shared_Runtime_Consolidation.
- [x] Delta - API client consolidation
  - Completed by PR_26175_DELTA_003_API_Client_Standardization.
- [x] Delta - Runtime performance audit
  - Completion reference: PR_26175_DELTA_001_Runtime_Performance_Optimization.
- [x] Delta - Engine test coverage improvements
  - Completed by PR_26175_DELTA_004_Runtime_Test_Expansion.
- [x] Delta - Event system audit
  - Completed by PR_26175_DELTA_005_Runtime_Technical_Debt_Cleanup.
- [ ] Delta - Controls runtime framework audit
- [ ] Delta - Hitboxes
- [ ] Delta - Object runtime framework audit
- [ ] Delta - World runtime framework audit
