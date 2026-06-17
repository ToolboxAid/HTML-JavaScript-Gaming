# Project Packages

## Decision

`.gfsp` is the Game Foundry Studio Project package extension.

Game Foundry Studio project packages use an internal ZIP-based package format. The `.gfsp` extension identifies the package as a Game Foundry Studio Project while preserving the operational advantages of a ZIP container for export, import, validation, and inspection.

## Filename Format

Project package filenames use:

`<ProjectNameWithoutSpaces>-<YYJJJ>-<sequence>.gfsp`

Example:

`KingOfTheIceberg-26168-001.gfsp`

Rules:

- `ProjectNameWithoutSpaces` removes spaces from the project display name.
- `YYJJJ` uses the two-digit year plus Julian day.
- `sequence` is a three-digit package sequence for that project/day.
- The filename is metadata for operators and review; package contents remain authoritative for project identity.

## Promotion Terms

Project promotion language uses package operations:

- Export Project Package
- Import Project Package
- Validate Project Package

Promotion planning should describe which project package is exported, imported, or validated and which environment lane is involved. Browser surfaces must not perform destructive promotion behavior without an explicit reviewed runtime contract.

## Notes

These notes are Codex decision notes only. They are intentionally kept under `docs_build/codex/decisions/` and must not be promoted into root, `src/`, `assets/`, `toolbox/`, `games/`, or runtime paths.
