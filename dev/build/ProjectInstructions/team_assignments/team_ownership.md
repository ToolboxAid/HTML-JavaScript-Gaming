# Team Ownership Governance

## Current Four-Team Ownership Model

This section is the current OWNER-approved active ownership alignment.

## Alfa

- Game Hub
- Game Journey
- Idea Board
- Creator workflow
- Creator onboarding
- UX flow

## Bravo

- Audio
- Audio Effects
- Messages
- Emotion Profiles
- TTS Profiles
- Asset Browser
- Vector Art
- MIDI Studio
- Creator content tools

## Charlie

- Repository compliance
- Validation
- Infrastructure
- Runtime
- Storage
- Environment Management
- System Health
- Operations
- Palette / Colors
- Sprites canvas editor MVP
- Objects

Charlie System Health owns:
- Environment Summary
- Database Health
- Storage Health
- Runtime Health
- Health Check History

Charlie Sprites ownership:
- Sprites is a creator tool, not only an asset metadata library.
- Sprites MVP requires canvas/grid editor behavior, width/height controls, Palette/Colors-only color selection, pixel painting, save/load sprite grid data through API/database, and a Product Owner testable workflow.
- Sprites must not own reusable color definitions.

Charlie Palette / Colors ownership:
- Color management
- API/database integration
- Reusable color source of truth
- Palette references for Sprites and Objects
- Product Owner testable workflow

Charlie Objects ownership:
- Object library
- Object editor
- Sprite assignment
- Object properties
- Collision configuration
- Runtime object metadata
- Object API/database contracts

## Delta

- Engine
- Runtime
- Shared JS
- API clients
- Event systems
- Hitboxes
- Performance
- Technical debt remediation
- Runtime test coverage

## Current Four-Team Rule

Alfa, Bravo, Charlie, and Delta are the four active delivery teams for backlog ownership and team start routing.

Each team may pull only from its ownership area unless OWNER explicitly reassigns, splits, or approves cross-team work.

## Current Active Ownership Lanes

OWNER override approved.

The current active ownership lanes are:

- Alfa
- Bravo
- Charlie
- Delta
- Golf
- Owner

Migration note:
Golf is the only active replacement for the retired prior lane.

Clarification:
- The four-team rule remains the current backlog ownership model for Alfa, Bravo, Charlie, and Delta.
- Golf does not receive a standing backlog ownership area in this file.
- Golf work requires OWNER assignment, an active branch, an active draft/open PR, or active release/review/cleanup responsibility.
- Golf work that touches Alfa, Bravo, Charlie, or Delta areas must document the OWNER cross-team decision.
- Historical PR references and branch names for retired non-canonical lanes remain unchanged for traceability.

## Rule

Ownership may only be reassigned by OWNER governance.

## Current Team Assignment Governance

This current rule supersedes any prior permanent discipline ownership assumptions in this file.

## Team Naming

Team names must use the canonical Owner plus military team-name set.

Official active team codes:

- Owner
- Alfa
- Bravo
- Charlie
- Delta
- Golf

Examples:
- Owner
- Alfa
- Bravo
- Charlie
- Delta
- Golf

Use `Alfa` spelling when referring to Alfa.

## Assignment Rule

Work stays with the assigned team until either:

1. Complete

OR

2. OWNER says move it.

Work stays with the assigned team until complete or OWNER says move it.

Only OWNER may reassign work.

## Owner of Record

Once a backlog item is assigned, the assigned team is the owner of record until completion or OWNER reassignment.

## Active Teams

Active teams may change from day to day.

OWNER will identify which teams are available when starting team work.

Project Instructions must not assume a permanent team roster.
