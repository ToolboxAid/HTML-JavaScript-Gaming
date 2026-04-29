# PLAN_PR_11_22_WORKSPACE_MANAGER_EMBEDDED_PAYLOAD_ASSET_STATUS_FIX

## Purpose
Fix Workspace Manager asset/status labels so tools with embedded JSON payloads under `manifest.tools[toolId].payload` are marked as having data instead of `Asset: none`.

## Current Result
Workspace now lists the tools, but most show:
- `Asset: none`

Example:
- Vector Map Editor -> Asset: none
- Sprite Editor -> Asset: none
- Tilemap Studio -> Asset: none
- Vector Asset Studio -> Asset: none
- 3D Asset Viewer -> Asset: none

Palette shows correctly:
- Palette Browser / Manager -> Palette: Sample 1902 Workspace Palette

## Diagnosis
Tool presence is now working, but Workspace Manager asset/status display still checks old asset-pointer locations instead of embedded tool payloads.

## Scope
- Workspace Manager asset/status detection only.
- Sample 1902 validation only.
- No schema loosening.
- No data rebuild unless a field naming mismatch is found.
- Do not modify other samples.
- Do not modify start_of_day folders.

## Acceptance
- Tools with valid embedded payloads no longer show `Asset: none`.
- Workspace Manager derives the displayed asset/document label from each tool payload.
- Tools without asset/document concepts may still show `N/A`.
- Palette remains displayed as Palette.
- Sample 1902 Workspace Manager shows meaningful data labels for all payload-backed tools.
