# BUILD_PR_LEVEL_19_9_RENAME_PACMAN_TO_PACMAN

## Purpose
Correct naming inconsistency: replace all references to "Pacman" with "Pacman".

## Scope
- Single purpose PR
- Naming + documentation correction only
- No gameplay or logic changes

## Required Changes
1. Search entire repo for:
   "Pacman"

2. Replace with:
   "Pacman"

3. Include:
   - sample names
   - file names
   - folder names
   - documentation
   - comments
   - UI labels

4. If file/folder rename occurs:
   - update all references/imports accordingly

## Constraints
- Do NOT change gameplay logic
- Do NOT modify unrelated files
- Preserve repo structure

## Validation
- Run:
  - node ./scripts/run-node-tests.mjs
- Ensure:
  - no broken imports
  - no missing assets

## Acceptance
- Zero "Pacman" references remain
- All references consistently use "Pacman"
