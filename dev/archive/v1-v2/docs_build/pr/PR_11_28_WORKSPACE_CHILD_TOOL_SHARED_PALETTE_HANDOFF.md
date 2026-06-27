# PR 11.28 — Workspace Child Tool Shared Palette Handoff

## Purpose
Fix the remaining Workspace Manager launch defect from the known-good `4dc2b0f` baseline: payload-backed tools can now be clicked, but opening Vector Map reports that its palette is missing.

## Current State
- Workspace Manager displays the full sample 1902 workspace.
- Palette Browser and Vector Map are enabled.
- Other tools remain grayed out.
- Opening Vector Map fails because the child tool launch does not receive or resolve the shared workspace palette.

## Required Change
Make Workspace Manager child tool launches carry or resolve the shared palette payload from the same embedded workspace manifest that is already loaded for sample 1902.

## Scope
- Keep `4dc2b0f` as the baseline.
- Preserve full workspace display.
- Preserve embedded payload status labels.
- Do not reapply failed PR 11.23/11.25 palette-only logic.
- Do not add hardcoded palette data.
- Do not add hidden/default fallback samples.
- Do not require external asset files.
- Do not touch start_of_day folders.
- Keep the fix surgical.

## Key Rule
A workspace tool launch must receive the payload it depends on from the explicit sample-owned workspace JSON.

For palette-dependent tools:
- shared palette data may come from `manifest.tools.palette-browser`
- tool-specific payload may come from `manifest.tools[toolId]`
- launch should provide both when the tool requires palette context

## Investigation Targets
- child tool launch URL/context builder
- scoped preset/payload handoff
- palette readiness detection
- tool dependency resolution
- disabled-state logic for tools that are grayed out because shared palette is not being handed off

## Acceptance
- Opening Vector Map from Workspace Manager no longer says palette is missing.
- Vector Map opens with the sample 1902 shared palette context.
- Payload-backed tools that depend on the shared palette are enabled/openable when palette payload exists.
- Workspace Manager still shows full workspace, not palette-only.
- No tool is enabled using fake/hidden fallback data.
- Smoke test passes.
