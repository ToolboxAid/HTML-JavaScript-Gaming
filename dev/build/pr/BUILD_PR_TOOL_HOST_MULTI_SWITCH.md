# BUILD_PR_TOOL_HOST_MULTI_SWITCH

## Purpose
Extend Tool Host foundation to support switching between multiple tools dynamically within the same session.

## Goals
- switch tools without page reload
- clean mount/unmount lifecycle
- preserve state isolation between tools

## Scope
- host switch controller
- tool selection UI (minimal)
- lifecycle enforcement

## Out of Scope
- styling/theme changes
- editor state persistence between tools
- deep UI redesign

## Strategy
- reuse host foundation
- add tool selector
- ensure destroy() always called before next init()

## Validation
- npm run test:launch-smoke -- --tools
- switch between at least 3 tools without errors
