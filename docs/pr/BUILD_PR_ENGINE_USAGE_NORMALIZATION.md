Toolbox Aid
David Quesenberry
03/25/2026
BUILD_PR_ENGINE_USAGE_NORMALIZATION.md

# BUILD_PR — Engine Usage Normalization

## Scope
- Audit all samples and games for actual engine usage
- Update samples/index.html and games/index.html to reflect ONLY used engine classes
- Remove outdated/unused entries (e.g., GamepadInputAdapter if not used)
- Standardize ordering of engine classes

## Canonical Order
- core / Engine
- render / CanvasRenderer
- input / InputService
- scenes / Scene
- theme / Theme (if used)
- additional classes ONLY if used (e.g., ActionInputService, Camera2D, SpriteAtlas)

## Rules
- Docs must reflect reality, not intent
- No speculative or future-facing entries
- No engine code changes in this PR
- Keep PR surgical (docs + index updates only)

## Acceptance Criteria
- Every sample/game lists only the engine classes it imports/uses
- Ordering is consistent across all entries
- No references to unused adapters/modules
- No console or runtime impact (docs-only change)

## Commit Comment
Normalize engine usage listings across samples and games to reflect actual usage

## Codex Command
MODEL: GPT-5.4-codex
REASONING: low
COMMAND: BUILD_PR_ENGINE_USAGE_NORMALIZATION
