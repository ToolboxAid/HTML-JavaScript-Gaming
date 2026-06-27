# BUILD PR — Asteroids New Full Existing Subfolder Copy (Testable)

## Purpose
Create a fully testable asteroids_new by copying ALL existing subfolders and files from games/Asteroids into games/asteroids_new.

## Source Scope (MUST EXIST ONLY)
Copy entire directory trees if present:
- games/Asteroids/game/
- games/Asteroids/debug/
- games/Asteroids/entities/
- games/Asteroids/flow/ (only if exists)
- any other existing subfolders under games/Asteroids/

## Destination
Mirror structure into:
- games/asteroids_new/

## Rules
- COPY EVERYTHING that exists under games/Asteroids/*
- DO NOT require files that do not exist
- DO NOT skip subfolders
- DO NOT modify source files
- DO NOT partially copy folders

## Required Changes
- After copy, update ONLY:
  - games/asteroids_new/index.js
  - any files that break due to import paths

- Fix imports minimally so the copied structure runs inside asteroids_new

## Constraints
- no deletes
- no refactors
- no guessing missing files
- full subfolder integrity required

## Validation
- asteroids_new mirrors all existing Asteroids subfolders
- no missing imports inside asteroids_new
- original Asteroids untouched
- asteroids_new is runnable or near-runnable (smoke testable)

## Acceptance
- Full subfolder parity achieved
- No partial copies
- Import graph resolves inside asteroids_new
