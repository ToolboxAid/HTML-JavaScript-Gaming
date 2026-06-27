# PR 11.24 — Sample 1902 Workspace Manager Only Entry

## Purpose
Make sample 1902 expose only the intended Workspace Manager launch path.

## Problem
Sample 1902 currently shows the legacy "Tool Roundtrip Links" section with direct links to every workspace-supported tool.

## Required Change
Remove or hide the sample-owned direct tool roundtrip link section from sample 1902.

The visible sample page must show only one launch action:

Open with Workspace Manager

## Scope
- Target sample 1902 only.
- Do not modify tool implementations.
- Do not change workspace payload schema.
- Do not change Workspace Manager behavior.
- Do not add replacement direct tool links.
- Do not touch start_of_day folders.

## Acceptance
- Opening sample 1902 shows only "Open with Workspace Manager" as the tool launch action.
- No "Tool Roundtrip Links" heading is visible.
- No direct tool links are visible.
- Workspace Manager still opens sample 1902 payload.
- Runtime smoke for sample 1902 and tools passes.
