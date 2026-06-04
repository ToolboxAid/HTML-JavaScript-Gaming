# PLAN_PR_11_12_REBUILD_SAMPLE_1902_WORKSPACE_ALL_TOOLS

## Purpose
Rebuild sample 1902 as a clean Workspace all-tools integration sample.

## Problem
PR 11.11 produced a noisy/incorrect 1902 sample:
- separate `sample.1902.palette.json` exists, but there should be no palette sidecar for this sample
- workspace payload contains duplicated palette sections
- Workspace loads Palette as the only valid tool
- sample page links standalone tools instead of validating Workspace orchestration
- sample payload contains too much unrelated mixed data and duplicate config/payload sections

## Scope
- Sample 1902 only
- Workspace all-tools integration only
- Remove palette sidecar file and duplicate palette ownership
- Rebuild sample 1902 JSON as one clean workspace manifest/payload
- Make sample page launch Workspace as the primary target
- Include every active workspace-supported tool with explicit JSON-backed data
- Do not modify standalone tool samples
- Do not modify start_of_day folders

## Acceptance
- No `sample.1902.palette.json`
- No duplicated top-level `palette`, `config.palette`, and `payload.palette` ownership
- Workspace opens with all active tools available, not only Palette
- Sample page primary action opens Workspace, not standalone tool links
- Tool-specific data is grouped clearly per tool
- All colors/palettes/styles are inside the single 1902 workspace JSON payload
- Report documents included/excluded tools and why
