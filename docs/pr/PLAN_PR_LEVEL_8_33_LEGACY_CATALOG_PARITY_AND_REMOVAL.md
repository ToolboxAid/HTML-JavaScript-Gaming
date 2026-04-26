# PLAN_PR_LEVEL_8_33_LEGACY_CATALOG_PARITY_AND_REMOVAL

## Purpose
After direct launch fix and Asteroids cleanup, safely remove legacy catalogs only where parity with game.manifest.json is proven.

## Scope
- Compare game.manifest.json vs:
  - workspace.asset-catalog.json
  - tools.manifest.json
- Remove legacy catalogs only when:
  - no runtime dependency
  - no data loss
- Advance roadmap status only

## Non-Goals
- No unsafe deletions
- No runtime rewrite
- No validators
- No start_of_day changes
