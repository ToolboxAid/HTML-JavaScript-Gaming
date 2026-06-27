# PR_26155_036 Toolbox Progress Foundation

## Summary

Added the static progress foundation fields used by Toolbox wireframe views:
- `requiredForTestable`
- `requiredForPublish`
- `requires`
- `status`
- `progressChecklist`

Progress and Build Path remain wireframe-only.

## Implementation Notes

- Added `requires` support to Toolbox Progress view cards.
- Added static dependency requirements for the core flow:
  - Game Design requires Project Workspace.
  - Game Configuration requires Game Design.
  - Build Game requires Game Configuration.
  - Game Testing requires Build Game.
  - Publish requires Game Testing.
  - Marketplace, Community, Languages, and Cloud require Publish.
- Added `requires` fields to `toolbox/toolRegistry.js`.
- Kept the existing `tools-page-accordions.js` renderer in place.
- Did not add DB, auth, persistence, or runtime save/load behavior.

## Intentional Ordering

Build Path is intentionally dependency ordered rather than alphabetically sorted. This is allowed by the navigation/list governance exception for workflow paths, Build Path, and dependency paths.

Project Progress and Publishing Progress are intentionally progress ordered rather than alphabetically sorted.

## Manual Test Notes

- Progress view cards show `requiredForTestable`, `requiredForPublish`, and `requires`.
- Build Path still uses existing tool tiles and existing grouped path sections.
- Progress and Build Path are not represented as tool cards or extra accordion/card sections.

## Validation Notes

- `node scripts/validate-active-tools-surface.mjs` passed.
- `npm run test:workspace-v2` passed: 3 Playwright tests.
- `git diff --check` passed.

## Theme V2 Gap Findings

None. No CSS was added or modified.
