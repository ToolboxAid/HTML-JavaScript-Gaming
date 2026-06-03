# BUILD_PR_SHARED_EXTRACTION_20_GUARD_SCRIPT_WIRING_PACKAGE_JSON

## Purpose
Wire the existing shared-extraction guard into package.json for easy execution.

## Single PR Purpose
Add a single script entry to package.json to run:
tools/dev/checkSharedExtractionGuard.mjs

## Exact Files Allowed
1. package.json (only if it exists AND already has a scripts section)

Do not edit any other file.

## Fail-Fast Gate
Before editing:
1. Confirm package.json exists
2. Confirm it has a "scripts" section
3. Confirm tools/dev/checkSharedExtractionGuard.mjs exists

If any condition fails:
- stop
- report blocker
- no changes
- no ZIP

## Exact Change

Add ONLY if missing:

"check:shared-extraction-guard": "node tools/dev/checkSharedExtractionGuard.mjs"

Rules:
- do not reorder file
- do not reformat entire file
- do not modify other scripts

## Hard Constraints
- one file only
- no source edits
- no config beyond script
- no new files
- no logic changes

## Validation Checklist
1. Only package.json changed
2. Script exists and is correct
3. No other script modified
4. Guard runs manually via npm script

## Non-Goals
- no CI wiring
- no lint changes
- no repo-wide changes
