# BUILD PR — Promote asObject / asArray into shared utils

## Purpose
Remove duplication of object/array helpers across engine + shared debug utilities.

## Exact Target Files
- src/shared/utils/objectUtils.js
- src/shared/utils/networkDebugUtils.js
- src/engine/debug/network/shared/networkDebugUtils.js

## Required Code Changes
1. In src/shared/utils/objectUtils.js
   - ensure/export:
     - asObject(value)
     - asArray(value)

2. In src/shared/utils/networkDebugUtils.js
   - remove local asObject / asArray
   - import from objectUtils

3. In src/engine/debug/network/shared/networkDebugUtils.js
   - remove local asObject / asArray
   - import from shared utils

## Constraints
- exact files only
- do not touch asNumber (already handled)
- no repo scan
- no refactor

## Acceptance
- one canonical implementation
- both files import shared
- no duplicates remain
