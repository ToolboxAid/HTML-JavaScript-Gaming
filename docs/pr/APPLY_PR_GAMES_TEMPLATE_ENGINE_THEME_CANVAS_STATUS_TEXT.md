# APPLY PR — Games Template Engine Theme Canvas Status Text

## Purpose
Formally accept `games/_template` as the reusable game template baseline.

## Summary
The template has been validated as:
- structurally clean
- non-playable
- aligned to the standard engine/theme shell baseline
- rendering required status text on the canvas

## Accepted State
`games/_template` now provides:
- minimal reusable game directory skeleton
- standard shell/theme baseline
- visible canvas
- canvas-rendered status text:
  - `HTML Says`
  - `Template Status`
  - `This template intentionally does not boot gameplay.`

## Acceptance Criteria (Met)
- `_template` structure is correct
- no Asteroids gameplay is present
- no Asteroids asset/theme bleed remains
- shell/theme baseline is aligned
- canvas is visible
- required status text renders on canvas
- no gameplay boots
- no console errors reported

## Non-Goals
- no additional code changes
- no template expansion
- no game migration in this PR
- no engine refactor

## Result
`games/_template` is accepted as the standard starting point for future game migrations.
