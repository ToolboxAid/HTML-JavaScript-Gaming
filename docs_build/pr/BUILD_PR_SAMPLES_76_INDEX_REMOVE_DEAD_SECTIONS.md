# BUILD PR — Samples Index Remove Empty/Dead Sections

## Purpose
Remove any empty sections or headers in samples/index.html introduced during prior grouping/sorting, keeping only sections that contain links.

## Exact Target Files
- samples/index.html

## Required Code Changes
- remove headers/sections with no links beneath them
- keep all existing links unchanged
- do not add new sections

## Constraints
- exact file only
- no file creation
- no path changes
- no link changes

## Acceptance Criteria
- no empty sections remain
- all links still resolve
