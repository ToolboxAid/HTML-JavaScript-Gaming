# PR_11_188 — Palette Manager v2 (Clean Rebuild)

## Purpose
Rebuild Palette Manager in Tool v2 lane with strict separation from legacy systems.

## Enforced Rules
- Visible name: Palette Manager
- Single file, single class
- No Workspace Manager v1 integration
- No platformShell
- No fallback/default data
- Session-only data model
- Reuse src/engine/theme CSS
- Use existing accordion CSS
- Header must match /index.html pattern

## Data Flow
1. Workspace loads data → writes session
2. Tool reads session via hostContextId
3. Tool renders or shows empty/error state

## Required Logs
[PALETTE_V2_ENTRY]
[SESSION_CONTEXT_READ]
[PALETTE_V2_CONTRACT_LOADED]

## Acceptance
- Loads palette from session
- Renders swatches + name + count
- Shows empty/error when missing
- No legacy coupling
