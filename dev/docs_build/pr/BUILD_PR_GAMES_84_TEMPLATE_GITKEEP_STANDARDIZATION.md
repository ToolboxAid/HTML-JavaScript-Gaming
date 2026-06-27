# BUILD PR — Games Template GitKeep Standardization

## Purpose
Ensure all template folders are committed to GitHub by using .gitkeep files (not .keep or empty dirs).

## Exact Target Files
- games/_template/entities/.gitkeep
- games/_template/systems/.gitkeep
- games/_template/levels/.gitkeep
- games/_template/assets/.gitkeep
- games/_template/ui/.gitkeep
- games/_template/config/.gitkeep

## Required Code Changes
- ensure .gitkeep exists in each folder
- remove any existing .keep files (replace with .gitkeep)

## Constraints
- exact files only
- no folder changes
- no logic changes

## Acceptance Criteria
- folders show in Git
- no .keep files remain
