# PLAN_PR_LEVEL_9_7_REMOVE_INTERNAL_REFERENCES_AND_INLINE_DATA

## Purpose
Finish the Asteroids manifest model by removing internal manifest references and keeping actual data directly under owning tool sections.

## Problem
Asteroids now has only one JSON file, but `game.manifest.json` still behaves like a pointer system:

- `assetCatalog`
- `runtimeSource`
- internal `#tools/...` paths
- `source.path` pointing back into the same manifest
- lineage references to inlined files/tool domains

## Target
`game.manifest.json` must be the actual data source, not a reference-to-reference map.

## Scope
- Asteroids only.
- Remove internal references from `games/Asteroids/game.manifest.json`.
- Keep actual JSON data directly in owning tool sections.
- Simplify Asteroids loader/runtime references as needed.
- Advance roadmap status only.

## Non-Goals
- No all-games rollout yet.
- No workspace schema embedded data.
- No validators.
- No `start_of_day` changes.
