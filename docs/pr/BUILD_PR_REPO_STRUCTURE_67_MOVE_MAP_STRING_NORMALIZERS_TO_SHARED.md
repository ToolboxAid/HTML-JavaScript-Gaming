# BUILD PR — Repo Structure Move Map (String Normalizers to Shared)

## Purpose
Continue shared/tools boundary enforcement by consolidating remaining string normalization helpers into the shared string utils layer.

## Exact Target Files
- src/engine/debug/inspectors/shared/inspectorUtils.js
- src/shared/utils/stringUtils.js

## Required Code Changes
1. In src/shared/utils/stringUtils.js
   - add/export any remaining normalization helpers found in inspectorUtils (trimSafe, normalizeWhitespace, etc.)

2. In src/engine/debug/inspectors/shared/inspectorUtils.js
   - remove local implementations of those helpers
   - import from shared string utils instead

## Constraints
- exact files only
- no other tools touched in this PR
- no behavior changes
- no refactor

## Acceptance Criteria
- string normalization helpers live only in shared utils
- inspectorUtils delegates to shared
