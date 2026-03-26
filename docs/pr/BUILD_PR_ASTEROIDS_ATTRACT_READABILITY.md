Toolbox Aid
David Quesenberry
03/25/2026

# BUILD_PR — Asteroids Attract Readability Micro-PR

## Goal
Improve readability of attract-mode text by adding a subtle dim panel behind text elements without affecting gameplay visuals.

## Scope
- add low-opacity dark panel behind attract text blocks
- apply only when attract mode is active
- limit to:
  - title text
  - high-score table
  - demo instructions
- do NOT affect gameplay objects (ship, asteroids, saucer)

## Implementation Notes
- use CanvasRenderer rectangle with low alpha (e.g., 0.2–0.35)
- panel should size dynamically to text bounds
- no borders, no gradients, no heavy styling
- preserve vector arcade aesthetic

## Non-Goals
- no gameplay changes
- no layout redesign
- no engine changes

## Acceptance Criteria
- text is clearly readable over gameplay/demo visuals
- panel is subtle and not distracting
- no impact to gameplay rendering
- no console errors

## Commit Comment
Improve Asteroids attract text readability with subtle dim panel

## Codex Command
MODEL: GPT-5.4-codex
REASONING: low
COMMAND: BUILD_PR_ASTEROIDS_ATTRACT_READABILITY
