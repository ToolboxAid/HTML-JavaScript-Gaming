# BUILD_PR_PROJECT_TOOL_INTEGRATION

## Purpose
Unify project-level data across tools so assets, maps, and scenes can be shared consistently.

## Goals
- single project model
- shared asset references
- cross-tool compatibility

## Scope
- project schema normalization
- asset reference alignment
- adapter layer for tools

## Out of Scope
- tool UI redesign
- rendering changes
- deep editor refactors

## Strategy
- leverage tools/shared/projectSystem
- align asset paths and IDs
- minimal adapters per tool

## Validation
- npm run test:launch-smoke -- --tools
- open project across multiple tools
- no console errors
