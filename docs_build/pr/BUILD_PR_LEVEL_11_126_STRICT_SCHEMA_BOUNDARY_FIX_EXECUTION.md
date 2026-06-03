# BUILD_PR_LEVEL_11_126_STRICT_SCHEMA_BOUNDARY_FIX_EXECUTION

## Purpose
Apply STRICT SCOPE execution to perform the previously failing schema boundary fix with enforced file-level control.

## Scope
- testable PR
- STRICT SCOPE enforced
- no drift
- no extra changes
- only schema boundary correction

## STRICT SCOPE

### ALLOWED FILES

- tools/schemas/workspace.manifest.schema.json
- tools/schemas/tools/palette-browser.schema.json

### ALLOWED CHANGES

#### workspace.manifest.schema.json
- REMOVE any palette payload structure (swatches, palette fields)
- KEEP ONLY $ref to palette-browser.schema.json

#### palette-browser.schema.json
- REMOVE:
  - oneOf
  - $defs.toolPayload
  - wrapper payload
  - tool field
- KEEP ONLY direct palette payload structure

## FORBIDDEN

- no other file changes
- no refactors
- no formatting changes outside these files
- no new files
- no cleanup outside scope

## VALIDATION

Codex MUST:

1. Modify ONLY allowed files
2. Run:
   git diff --name-only
3. Confirm ONLY allowed files changed
4. If any other file appears → revert it

## REQUIRED OUTPUT

- list of changed files
- confirmation scope respected
- diff summary

## FAILURE CONDITIONS

FAIL if:
- no file changes
- files outside scope changed
- schema still contains palette payload in workspace
