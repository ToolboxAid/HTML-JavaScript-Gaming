Toolbox Aid
David Quesenberry
03/25/2026
BUILD_PR_SPACE_DUEL_VECTOR_SHAPES.md

# BUILD_PR — Space Duel Vector Shape Accuracy Pass

## Goal
Replace placeholder geometry with arcade-accurate vector-style shapes based on reference while preserving gameplay logic.

## Scope
- replace placeholder shapes with vector line geometry
- no fills, line-based rendering only
- preserve gameplay, physics, scoring, input

## Rendering Rules
- use CanvasRenderer only
- rotate + translate points at render time
- store shapes as line segments

## Acceptance Criteria
- shapes visually match arcade reference style
- no gameplay regressions
- no console errors

## Commit Comment
Replace Space Duel placeholder shapes with arcade-accurate vector geometry and rendering

## Codex Command
MODEL: GPT-5.4-codex
REASONING: medium
COMMAND: BUILD_PR_SPACE_DUEL_VECTOR_SHAPES
