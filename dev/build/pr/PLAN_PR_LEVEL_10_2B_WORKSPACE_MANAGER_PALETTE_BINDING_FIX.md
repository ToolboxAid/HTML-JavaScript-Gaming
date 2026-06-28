# PLAN_PR_LEVEL_10_2B_WORKSPACE_MANAGER_PALETTE_BINDING_FIX

## Purpose
Fix Workspace Manager shared palette binding for game manifests.

## Problem
Workspace Manager can load a game workspace without diagnostic, but still show:

`Shared Palette: No shared palette selected`

even when the game manifest contains palette data.

## Scope
- Bind Workspace Manager shared palette from the game manifest singleton palette tool section.
- Keep direct game launch unchanged.
- Use the Level 10.2A asset presence test to validate.
- No start_of_day changes.
