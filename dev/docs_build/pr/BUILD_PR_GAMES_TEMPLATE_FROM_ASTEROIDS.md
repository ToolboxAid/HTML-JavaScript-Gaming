# BUILD PR — Games Template From Asteroids

## Purpose
Create games/_template based on the canonical structure of games/Asteroids.

## Scope (STRICT)
- Copy STRUCTURE ONLY from:
  games/Asteroids/**
- Into:
  games/_template/**

## Target Paths (EXACT)
- Source: games/Asteroids/**
- Destination: games/_template/**

## Allowed Operations
- Copy folder structure
- Copy minimal files required to define structure

## Required Adjustments
- Remove game-specific assets (images, sounds, levels)
- Replace game-specific logic with placeholders where obvious
- Keep flow structure intact

## Explicit Non-Goals
- DO NOT modify games/Asteroids
- DO NOT introduce new architecture
- DO NOT refactor engine/shared
- DO NOT over-generalize

## Fail-Fast Conditions
- If unclear what is structural vs game-specific → STOP
- If more than minimal edits required → STOP

## Acceptance Criteria
- games/_template exists
- Structure matches Asteroids layout
- No game-specific assets included
- Flow files present (attract, game, etc. if applicable)

## Validation Steps
1. Compare folder structure
2. Confirm no assets copied
3. Confirm template is clean and reusable

## Output Requirement
<project folder>/tmp/BUILD_PR_GAMES_TEMPLATE_FROM_ASTEROIDS_delta.zip
