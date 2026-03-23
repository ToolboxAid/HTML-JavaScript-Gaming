Toolbox Aid
David Quesenberry
03/23/2026
README.md

# BUILD_PR — Docs Correction for `samples/_shared/`

## Purpose
Correct documentation so it reflects the current repo accurately after the `sampleLayout.css` move.

## What changed in reality
- `sampleLayout.css` moved out of `samples/_shared/`
- `samples/_shared/` still remains valid because it still contains:
  - `lateSampleBootstrap.js`
  - `platformerHelpers.js`

## Goal
Update the docs so they do not imply `_shared` is empty or removable.
