# BUILD_PR_TOOL_HOST_STATE_HANDOFF

## Purpose
Enable optional state handoff between tools within the Tool Host so workflows can span multiple tools without reload.

## Goals
- shared project context
- controlled state passing between tools
- no tight coupling between tools

## Scope
- shared state container
- handoff interface (getState / setState)
- minimal adapter layer

## Out of Scope
- persistent storage redesign
- editor state rewrites
- UI changes

## Strategy
- introduce shared context object
- pass into init(container, config, context)
- tools opt-in only

## Validation
- npm run test:launch-smoke -- --tools
- switch tools and pass simple state
- no console errors
