# BUILD_PR_LEVEL_8_28_MANIFEST_SSOT_IMPLEMENTATION_ASTEROIDS_FIRST

## Objective
Use Asteroids as the first complete manifest SSoT pattern.

## Current Known Issues
From Level 8.26 audit:
- `games/Asteroids/assets/images/bezel.stretch.override.json` is unreferenced.
- `games/Asteroids/assets/palettes/hud.json` is unreferenced.
- `games/Asteroids/assets/palettes/asteroids-classic.palette.json` is referenced.
- Asteroids has both:
  - `assets/workspace.asset-catalog.json`
  - `assets/tools.manifest.json`

## Target
Create/normalize:

```text
games/Asteroids/game.manifest.json
```

This becomes the Asteroids SSoT.

## Manifest Must Own
- game id/name/version
- tools entries
- palettes
- skins / HUD palette references
- vector assets
- sprite assets
- tilemap assets
- parallax assets
- bezel/overlay/layout overrides
- legacy catalog lineage references only if needed

## HUD Rule
If `hud.json` is color data:
- convert it to palette-schema compatible data OR merge into `asteroids-classic.palette.json`
- preferred path for this PR:
  - create `games/Asteroids/assets/palettes/asteroids-hud.palette.json`
  - preserve original intent
  - wire it in manifest under palettes and primitive skin/HUD usage
- do not leave `hud.json` as untyped loose color data

## Bezel Rule
Wire:

```text
games/Asteroids/assets/images/bezel.stretch.override.json
```

into manifest under overrides/layout/bezel section.

## Legacy Catalog Rule
Do not delete:
- `games/Asteroids/assets/workspace.asset-catalog.json`
- `games/Asteroids/assets/tools.manifest.json`

In this PR, mark them as legacy/derived in report only.

## Required Report
Create:

```text
docs/dev/reports/level_8_28_asteroids_manifest_ssot_report.md
```

Report must include:
- source files read
- assets migrated/wired
- HUD conversion decision
- unreferenced Asteroids JSON after migration
- whether old catalogs can become derived/deprecated
- runtime/start_of_day unchanged check

## Roadmap Movement
Update `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` status only:
- advance Asteroids SSoT example item `[ ] -> [.]` or `[.] -> [x]`
- advance code asset extraction item if 8.27 result supports it
- no roadmap text rewrite

## Acceptance
- `games/Asteroids/game.manifest.json` exists.
- Asteroids bezel override is referenced by the game manifest.
- Asteroids HUD color data is no longer loose/untyped.
- Asteroids main palette is referenced by the game manifest.
- Asteroids legacy catalogs remain intact.
- Report exists.
- No validators added.
- No `start_of_day` changes.
