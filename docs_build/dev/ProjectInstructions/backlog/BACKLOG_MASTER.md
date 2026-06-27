# BACKLOG_MASTER

## Backlog Item Tracking Standard

Every active team owns an active backlog when it has assigned work.

Each backlog item must track:

- Name
- Description
- Current completion percentage
- Remaining work
- Blocking dependencies

Completion percentages are updated at SOD, after each accepted PR, and at EOD.

The backlog is the authoritative source for determining the next PRs.

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
  - MVP requires canvas/grid editor behavior, width/height controls, Palette/Colors-only reusable colors, color selection from Palette/Colors, pixel painting, save/load sprite grid data through the API/database, and Product Owner manual validation.
  - Category is removed from Sprites MVP planning.
- [ ] Bravo - Animation Studio V2
- [ ] Bravo - Palette Manager
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

- [ ] Alfa - Objects
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
  - NATO team naming installed.
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

- [x] OWNER - Repository hygiene governance complete

  Notes:
  - Open PR, draft PR, local branch, and remote branch review requirements verified.
  - Recommendation-only hygiene audit process verified.
  - Branch deletion and PR closure remain prohibited without explicit owner approval.

## Cancelled / Not Doing

### Environment Isolation & Developer Experience

Status: CANCELLED / NOT DOING

Items removed from backlog:
- Multi-port workspace framework
- Alpha/Beta/User isolation framework
- Runtime port management initiative

Replacement governance:
- System Health remains one page per deployed environment.
- Each deployment actively checks only itself.
- Environment Summary, Database Health, Storage Health, Runtime Health, and Health Check History are Team Charlie System Health ownership.
- Environment governance follows the approved GFS infrastructure and System Health v1 documentation.

## Four-Team Backlog Alignment

Current OWNER clarification:
- The backlog alignment below preserves the current Alfa, Bravo, Charlie, and Delta ownership model.
- Team Gamma is retired. Team Golf is the replacement active ownership lane.
- Team Golf has no standing backlog ownership area in this file unless OWNER assigns one.
- Golf work may be OWNER-assigned, branch-backed, PR-backed, release, review packet, or cleanup work and must not silently replace Alfa, Bravo, Charlie, or Delta ownership.
- Historical Gamma PR references and branch names are not renamed by this clarification.

### Team Alfa

- [ ] Alfa - Game Hub polish
- [ ] Alfa - Game Journey completion tracking
- [ ] Alfa - Journey progress calculations
- [ ] Alfa - Creator onboarding flow
- [ ] Alfa - Game Hub image integration

### Team Bravo

- [ ] Bravo - Audio tool improvements
- [ ] Bravo - Audio Effects tool
- [ ] Bravo - Messages tool
- [ ] Bravo - Emotion Profiles
- [ ] Bravo - TTS Profiles
- [ ] Bravo - Asset Browser enhancements
- [ ] Bravo - Vector Art improvements
- [ ] Bravo - MIDI Studio improvements

### Team Charlie

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

### Team Delta

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
