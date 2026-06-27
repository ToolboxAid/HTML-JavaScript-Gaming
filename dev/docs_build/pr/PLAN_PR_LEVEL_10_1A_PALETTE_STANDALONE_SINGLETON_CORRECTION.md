# PLAN_PR_LEVEL_10_1A_PALETTE_STANDALONE_SINGLETON_CORRECTION

## Purpose
Correct palette ownership after Level 10.1.

## Corrections
1. Palette is a standalone tool/data concept.
2. Palette must not live under `primitive-skin-editor`.
3. Only one palette is allowed per game/workspace.
4. The manifest field should be root-level `palette`.
5. Tools consume the single shared palette; they do not own their own palettes.

## Scope
- Move any `tools["primitive-skin-editor"].palettes` data to root `palette`.
- Merge duplicate palettes into one.
- Ensure one palette per game manifest.
- Update tool input alignment documentation.
- No separate palette JSON files.

## Non-Goals
- No runtime rewrite beyond manifest read-path fix if required.
- No validators.
- No `start_of_day` changes.
