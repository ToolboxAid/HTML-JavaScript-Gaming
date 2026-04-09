# BUILD PR — Samples Index Link Validation Cleanup

## Purpose
Perform a safe cleanup of samples/index.html by removing or correcting any broken or duplicate links.

## Exact Target Files
- samples/index.html

## Required Code Changes
- remove duplicate links if present
- remove or fix any links that do not resolve
- do not add new links
- do not change structure beyond minimal cleanup

## Constraints
- exact file only
- no file creation
- no file moves
- no refactor

## Acceptance Criteria
- all links in index resolve
- no duplicates remain
