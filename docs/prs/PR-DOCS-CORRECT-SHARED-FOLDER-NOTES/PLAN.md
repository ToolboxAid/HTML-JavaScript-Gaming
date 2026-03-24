Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Docs Correction for `samples/_shared/`

## Goal
Correct docs to reflect the real state of the repo:

- `baseLayout.css` was relocated to `samples/_shared/baseLayout.css`
- `samples/_shared/` still exists intentionally
- `_shared` is still used for sample-owned JavaScript helpers and bootstrap support

## Required Documentation Corrections

### 1. Correct the CSS relocation wording
Ensure docs say the move was:
- `/samples/_shared/baseLayout.css`
- to `/samples/_shared/baseLayout.css`

### 2. Clarify `_shared` is still valid
Docs must not imply `_shared` was removed or is now unnecessary.

They should explicitly note that `samples/_shared/` still contains sample-owned support files such as:
- `lateSampleBootstrap.js`
- `platformerHelpers.js`

### 3. Clarify ownership boundary
The docs should state:
- shared **layout CSS** now lives under `engine/ui/`
- shared **sample helper JS** may still live under `samples/_shared/`
- `_shared` is still the correct place for sample-only support code that is not engine-owned

## Acceptance Criteria
- docs no longer imply `_shared` is empty or removable
- docs correctly describe the CSS move
- docs correctly preserve the sample-owned helper boundary
