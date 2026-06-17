# Project Packages

## Decision

`.gfsp` is the Game Foundry Studio Project package extension.

Game Foundry Studio project packages use an internal ZIP-based package format. The `.gfsp` extension identifies the package as a Game Foundry Studio Project while preserving the operational advantages of a ZIP container for export, import, validation, and inspection.

## Package Metadata Contract

The runtime package scaffold writes these required internal files:

- `metadata/package.json`
- `project/project.json`
- `assets/asset-references.json`

`metadata/package.json` owns the package identity and must include:

- `packageType`: `Game Foundry Studio Project`
- `extension`: `.gfsp`
- `contractVersion`
- `filename`
- `filenameFormat`
- `createdAt`
- `project.projectKey`
- `project.name`
- `requiredFiles`

`project/project.json` owns the exported Project Workspace project record. It must carry the API-owned project key, local record id, display name, owner key, and status.

`assets/asset-references.json` owns storage references only. Asset binary/object bytes stay in configured project asset storage and are referenced by storage object keys; package metadata must not include storage secrets or browser-owned product data.

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
