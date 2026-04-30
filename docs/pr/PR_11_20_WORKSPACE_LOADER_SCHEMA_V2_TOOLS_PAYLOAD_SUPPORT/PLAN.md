# PLAN_PR_11_20_WORKSPACE_LOADER_SCHEMA_V2_TOOLS_PAYLOAD_SUPPORT

## Purpose
Update the Workspace loader/runtime to consume the corrected strict Workspace manifest schema where all tool payloads live under `tools`.

## Problem
Sample 1902 now contains a schema-shaped `tools` object with many tool payloads, but Workspace still shows only Palette. This means the Workspace UI/loader is still using an older contract, likely reading:
- top-level palettes
- old config/payload branches
- old sample tool-payload wrappers
- a hardcoded Palette-only fallback
- or filtering only one recognized tool

## Scope
- Workspace loader/runtime only.
- Sample 1902 validation only.
- Do not rebuild all tools.
- Do not modify other samples.
- Do not modify start_of_day folders.

## Acceptance
- Workspace reads `sample.1902.workspace-all-tools.json` using the new schema:
  - top-level workspace metadata
  - `tools` object
  - one entry per supported tool id
  - `tools.palette-browser` / `tools.palette-browser` handled correctly per schema decision
- Workspace tool list is built from `Object.keys(manifest.tools)` filtered through registry-supported ids.
- Workspace no longer shows only Palette when valid tool payloads exist.
- Unknown tool ids fail or are reported clearly.
- Invalid tool payloads fail validation clearly.
- Sample 1902 opens Workspace with all valid supported tools.
