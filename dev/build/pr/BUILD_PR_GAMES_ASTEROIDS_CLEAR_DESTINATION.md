# BUILD PR — Asteroids Clear Destination

## Purpose
Prepare `games/Asteroids` for canonical replacement by removing ALL existing files.

## Scope (STRICT)
- Delete ALL files and folders under:
  games/Asteroids/**

## Target Files (EXACT)
- Entire directory:
  games/Asteroids/**

## Allowed Operations
- Delete files
- Delete subfolders
- Leave empty folder in place

## Explicit Non-Goals
- DO NOT touch games/asteroids_new
- DO NOT move files
- DO NOT copy files
- DO NOT modify any other directory

## Fail-Fast Conditions
- If games/Asteroids does not exist → STOP
- If deletion would affect any path outside games/Asteroids → STOP

## Acceptance Criteria
- games/Asteroids exists
- games/Asteroids is empty

## Validation Steps
1. Inspect games/Asteroids
2. Confirm no files remain

## Output Requirement
<project folder>/tmp/BUILD_PR_GAMES_ASTEROIDS_CLEAR_DESTINATION_delta.zip
