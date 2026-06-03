# BUILD PR — Games Template From Asteroids (Index Shell Fix)

## Purpose
Create games/_template based on games/Asteroids, with a REQUIRED standardized index.html shell.

## Scope (STRICT)
- Copy STRUCTURE from:
  games/Asteroids/**
- Into:
  games/_template/**
- Replace index.html with a template shell

## Target Paths (EXACT)
- Source: games/Asteroids/**
- Destination: games/_template/index.html

## REQUIRED index.html Behavior
The template index.html MUST:
- Render a canvas element
- Display visible text:

  Game Template
  Replace this entrypoint with your game-specific shell.

- Not include Asteroids-specific logic
- Not auto-load Asteroids code

## Allowed Operations
- Copy structure
- Replace index.html content
- Remove assets

## Explicit Non-Goals
- DO NOT modify games/Asteroids
- DO NOT include game-specific assets
- DO NOT include game-specific logic

## Fail-Fast Conditions
- If index.html cannot be safely replaced → STOP
- If structure unclear → STOP

## Acceptance Criteria
- games/_template exists
- index.html shows canvas + template message
- No Asteroids logic present
- No assets copied

## Validation Steps
1. Open games/_template/index.html
2. Confirm:
   - canvas renders
   - message visible
   - no game runs

## Output Requirement
<project folder>/tmp/BUILD_PR_GAMES_TEMPLATE_FROM_ASTEROIDS_V2_INDEX_SHELL_delta.zip
