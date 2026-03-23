Toolbox Aid
David Quesenberry
03/23/2026
README.md

# PLAN_PR — Engine Boundary Cleanup Step 2 (Static Global Reduction)

## Purpose
Define the next surgical PR after Step 1 adapter seams.

## Goal
Reduce the remaining architecture risk caused by shared static/global engine state.

## Primary Targets
- `engine/core/canvasUtils.js`
- `engine/core/fullscreen.js`
- `engine/core/performanceMonitor.js`
- `engine/core/timer.js`
- `engine/events/eventBus.js`

## Constraints
- No gameplay changes
- No broad rewrite
- No scene/system redesign in this step
- No engine API churn beyond justified seams
- Planning/audit only in this PR

## Expected Outcome
Codex classifies global/static ownership debt, identifies which pieces should become injected services vs remain utilities, and proposes the smallest safe BUILD_PR order.
