# BUILD_PR_LEVEL_11_125_ENFORCE_FILE_WRITE_AND_BLOCK_NOOP

## Purpose
Hard-stop Codex from producing no-op runs. This PR enforces REQUIRED file changes with verification.

## Core Rule

If expected changes are not applied to real files → execution FAILS.

## REQUIRED FILE MODIFICATIONS

Codex MUST modify these files:

1. src/shared/schemas/workspace.manifest.schema.json
   - REMOVE any palette payload structure
   - KEEP ONLY $ref to palette-browser schema

2. src/shared/schemas/tools/palette-browser.schema.json
   - REMOVE:
     - oneOf
     - $defs.toolPayload
     - wrapper payload
     - tool field
   - KEEP ONLY palette payload structure

## MANDATORY VERIFICATION STEPS

Codex MUST:

1. Read file BEFORE change
2. Modify file
3. Save file
4. Re-read file AFTER change
5. Compare BEFORE vs AFTER
6. Confirm difference

## FAILURE CONDITIONS

FAIL PR if:
- no file changed
- diff is empty
- file content unchanged

## REQUIRED REPORT CONTENT

docs_build/dev/reports/enforced_write_11_125.txt MUST include:

- file path
- before snippet
- after snippet
- diff summary
- confirmation write succeeded

## EXECUTION MODE

This is NOT optional.
This is NOT advisory.
This is REQUIRED WRITE.

## Acceptance

- files physically changed
- palette removed from workspace schema
- palette schema simplified
- diff evidence present
