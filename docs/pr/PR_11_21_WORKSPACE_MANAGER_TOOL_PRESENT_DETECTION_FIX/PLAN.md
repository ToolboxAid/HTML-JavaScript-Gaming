# PLAN_PR_11_21_WORKSPACE_MANAGER_TOOL_PRESENT_DETECTION_FIX

## Purpose
Fix Workspace Manager so it flags tools as present when their payload exists under the strict `manifest.tools` schema.

## Problem
Sample 1902 assets/tool payloads appear to load, but Workspace Manager does not recognize most tools as present. Workspace still behaves as if only Palette is valid/present.

Likely cause:
- Workspace Manager presence detection still checks old locations/keys:
  - top-level palettes
  - games[].tools
  - activeWorkspaceTools
  - legacy config/payload paths
  - old sample tool-payload wrappers
- It is not using `manifest.tools[toolId]` as the source for presence.

## Scope
- Workspace Manager/tool presence detection only.
- Sample 1902 validation only.
- No schema rebuild.
- No data rebuild unless only a key mismatch is confirmed.
- Do not modify other samples.
- Do not modify start_of_day folders.

## Acceptance
- Workspace Manager marks a tool present when `manifest.tools[toolId]` exists and validates.
- Workspace Manager handles the singular palette mapping correctly:
  - `manifest.tools.palette-browser` maps to Palette Browser UI/presence if that is the schema contract.
- Sample 1902 shows all present valid tools, not only Palette.
- Tool absence is reported only when the tool key is missing or invalid.
- Report lists loaded keys, present keys, missing keys, and invalid keys.
