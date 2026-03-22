Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_119.md

# PLAN_PR — Sample119 - Localization System

## Capability
Localization System

## Goal
Add a reusable localization system so text/content can be switched by language through data-driven engine-owned paths.

## Engine Scope
- Add engine-owned localization loading and lookup support
- Keep language content data-driven and separate from sample logic
- Allow UI/text retrieval without hardcoded string assumptions

## Sample Scope
- Demonstrate visible language switching or localized text usage in samples/Sample119/
- Show proof that content comes from localization data paths
- Follow Sample01 structure exactly

## Acceptance Targets
- Localized content resolves correctly
- Localization support is reusable and engine-owned
- No duplicated string-switching logic lives in sample scene code

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
