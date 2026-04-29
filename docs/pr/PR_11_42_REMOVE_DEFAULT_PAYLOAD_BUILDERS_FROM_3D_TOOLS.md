# PR 11.42 — Remove buildDefaultPayload from 3D Tools

## Purpose
Remove silent default payload generation from three 3D tools so they follow the explicit JSON/input contract.

## Problem
The following tools contain `buildDefaultPayload` logic:
- 3D Asset Viewer
- 3D Camera Path Editor
- 3D JSON Payload Normalizer

This can make tools appear to work from fabricated default data instead of explicit sample/user JSON.

## Required Change
Remove `buildDefaultPayload` usage from these tools.

## Target Tools
- 3D Asset Viewer
- 3D Camera Path Editor
- 3D JSON Payload Normalizer

## Required Behavior
When no valid payload/input is provided:
- show a safe empty state
- explain that explicit JSON/input is required
- do not auto-create hidden/default sample data
- do not fabricate geometry/cameras/scenes

## Scope
- Only remove default payload generation from the listed tools.
- Do not change unrelated tools.
- Do not change sample 1902 workspace behavior except where these tools now report explicit-input status correctly.
- Do not add fallback JSON.
- Do not touch start_of_day folders.

## Acceptance
- No `buildDefaultPayload` remains in the three listed tools.
- Tools with explicit sample/user JSON still load.
- Tools without input show safe empty state.
- Runtime smoke passes.
