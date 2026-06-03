# PLAN_PR_10_7_UNIFIED_TOOL_UX_CONTRACT

## Purpose
Define a single, enforced UI/UX + state contract across all tools to eliminate one-off behavior before tool-level UAT fixes.

## Scope (STRICT)
- Define shared UI layout regions
- Define shared state lifecycle (init → load → select → ready)
- Define selection rules (auto-select first item)
- Define control enablement rules
- Define empty-state UX (no silent data)
- Define workspace embedding contract
- No implementation code
- No data changes

## Affected Tools
- Asset Browser
- Sprite Editor
- Tilemap Studio
- Vector Asset Studio
- Vector Map Editor

## Non-Goals
- No feature additions
- No data schema changes
- No rendering changes

## Acceptance
- All tools follow same layout zones
- All tools follow same selection + enablement rules
- All tools show consistent empty state
- All tools operate correctly inside Workspace container
