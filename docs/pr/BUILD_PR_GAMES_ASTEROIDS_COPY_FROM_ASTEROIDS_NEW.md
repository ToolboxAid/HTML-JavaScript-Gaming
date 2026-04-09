# BUILD PR — Asteroids Copy From asteroids_new

## Purpose
Copy verified implementation from games/asteroids_new into games/Asteroids.

## Scope (STRICT)
- Copy ALL files from:
  games/asteroids_new/**
- Into:
  games/Asteroids/**

## Target Paths (EXACT)
- Source: games/asteroids_new/**
- Destination: games/Asteroids/**

## Allowed Operations
- Copy files
- Create folders as needed under games/Asteroids

## Explicit Non-Goals
- DO NOT modify games/asteroids_new
- DO NOT delete games/asteroids_new
- DO NOT rename files
- DO NOT skip files
- DO NOT merge with existing files (destination is already empty)

## Critical Direction Rule
- Copy direction is ONE WAY ONLY:
  FROM games/asteroids_new
  TO   games/Asteroids

- NEVER copy from games/Asteroids into games/asteroids_new

## Fail-Fast Conditions
- If destination is NOT empty → STOP
- If any ambiguity in file mapping → STOP

## Acceptance Criteria
- games/Asteroids is an exact mirror of games/asteroids_new
- File count matches
- No extra files exist

## Validation Steps
1. Compare file trees
2. Confirm identical structure and files

## Output Requirement
<project folder>/tmp/BUILD_PR_GAMES_ASTEROIDS_COPY_FROM_ASTEROIDS_NEW_delta.zip
