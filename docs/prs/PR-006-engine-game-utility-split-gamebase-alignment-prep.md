# PR-006: engine/game utility split and GameBase alignment prep

## Title

engine/game: prepare utility split and GameBase-aligned boundary cleanup

## Scope

This PR performs a preparation pass only.

Primary source files:
- `engine/game/gameObjectUtils.js`
- `engine/game/gameUtils.js`

Support files:
- `CODEX_COMMANDS.md`
- `COMMIT_COMMENT.txt`
- `NEXT_COMMAND.md`

## Why this boundary is next

After narrowing registry/system, lifecycle ownership, and collision facade exposure, the next safest step is utility-boundary preparation.

This repo still contains mixed utility responsibilities that appear to split into:
- transitional/internal object utility support
- gameplay-facing convenience helpers
- future GameBase-aligned public surface candidates

## What changed

### gameObjectUtils.js
- clarified as a transitional mixed utility surface
- documented likely extraction seams around validation, metadata, and object ID helpers
- retained current shape as a compatibility surface

### gameUtils.js
- clarified as a gameplay-facing utility surface
- documented likely GameBase-aligned seams around player selection and player swap helpers
- retained current shape as a compatibility surface

## What did not change

- no imports changed
- no exports changed
- no logic changed
- no file moves
- no renames
- no public API changes

## Compatibility

This PR is compatibility-preserving and comment/documentation-only.

## Deferred to later PRs

- first real utility split candidate
- GameBase-aligned public/internal boundary tightening
- any actual relocation or renaming of utility code
