# BUILD_PR_LEVEL_11_124_FORCE_SCHEMA_FILE_CHANGES_NOT_DOCS

## Purpose
Fix the repeated issue: Codex is not making real code/schema changes.

This PR FORCES actual file modifications, not just reports.

## Core Rule

If a schema is wrong → MODIFY THE FILE

Not:
- describe it
- report it
- suggest it

## Required Hard Changes

### 1. workspace.manifest.schema.json

REMOVE palette payload structure completely.

ONLY allow:
- $ref to palette-browser.schema.json

### 2. palette-browser.schema.json

MUST:
- accept ONLY palette payload JSON
- REMOVE:
  - oneOf
  - wrapper payload
  - toolPayload
  - tool field
  - nested payload

### 3. Validate enforcement

Codex MUST:
- modify files
- show diff in report
- confirm file changed on disk

## Mandatory Execution Rule

Before finishing:

1. List files modified
2. Show before/after snippets
3. Confirm write occurred

If no files modified → FAIL PR

## Reports

- docs/dev/reports/forced_changes_11_124.txt
- docs/dev/reports/file_diff_11_124.txt

## Acceptance

- schema files actually changed
- palette no longer exists inside workspace schema
- palette schema is payload-only
