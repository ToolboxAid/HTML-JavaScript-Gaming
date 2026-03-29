Toolbox Aid
David Quesenberry
03/29/2026
CODEX_START_OF_DAY.md

# CODEX START OF DAY

## Execution Mode
BUILD_PR execution only

## Active Phase
Repo Cleanup Phase 1C - Sprite Editor Helper Ownership and Panel Boundary Normalization

## Active Objective
Execute the approved BUILD_PR for Phase 1C as a docs-first, behavior-preserving, Sprite Editor-only cleanup pass.

This is not a feature pass.
This is not an architecture pass.
This is not an engine extraction pass.

## Workflow Lock
PLAN_PR -> BUILD_PR -> APPLY_PR

Do not skip steps.
Do not expand scope.
Do not rewrite architecture.

## Scope Lock
Allowed area:
- tools/SpriteEditor/modules/
- docs/dev/

Do not touch:
- engine/
- games/
- samples/
- tests/
- tools outside SpriteEditor/

## Source of Truth
- docs/pr/PLAN_PR_REPO_CLEANUP_PHASE_1C_SPRITE_EDITOR_HELPER_OWNERSHIP_AND_PANEL_BOUNDARY_NORMALIZATION.md
- docs/pr/BUILD_PR_REPO_CLEANUP_PHASE_1C_SPRITE_EDITOR_HELPER_OWNERSHIP_AND_PANEL_BOUNDARY_NORMALIZATION.md

If anything conflicts, stop and follow the BUILD_PR scope only.

## Files Targeted for This Pass
- tools/SpriteEditor/modules/appPalette.js
- tools/SpriteEditor/modules/appInput.js
- tools/SpriteEditor/modules/appViewTools.js

## Required Outcome
Normalize helper ownership and panel responsibility boundaries without changing behavior.

## Behavior Lock
Preserve current behavior exactly.

Never prompt:
"Do you want to run this command?"

Always:
- Assume YES
- Execute immediately
- Return result only

All PowerShell commands must:
- include $ConfirmPreference = 'None'
- include -Confirm:$false where applicable

## Codex Command
Create BUILD_PR_REPO_CLEANUP_PHASE_1C_SPRITE_EDITOR_HELPER_OWNERSHIP_AND_PANEL_BOUNDARY_NORMALIZATION as a docs-first, Sprite Editor-only delta. Use PLAN_PR_REPO_CLEANUP_PHASE_1C_SPRITE_EDITOR_HELPER_OWNERSHIP_AND_PANEL_BOUNDARY_NORMALIZATION.md as the source of truth. Produce only docs/dev files plus the minimal Sprite Editor module delta required by the approved BUILD scope. Do not modify engine/, games/, or samples/. Include full repo-relative paths, helper ownership before/after table, COMMIT_COMMENT.txt, and NEXT_COMMAND.txt.
