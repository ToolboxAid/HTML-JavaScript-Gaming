# BUILD_PR_LEVEL_11_104_SCHEMA_FILENAME_CANONICALIZATION_AND_ARRAY_RULE_RESTORE

## Purpose
Canonicalize schema filenames, align all JSON references to their schemas, and restore/enforce the compact primitive-array formatting rule.

## Scope
- docs-first
- no implementation code
- smallest scoped contract cleanup before schema lock
- no runtime feature expansion
- no schema loosening

## Required Changes

### 1. Canonical schema filenames

Rename schema files and update every reference:

- `3d-json-payload.schema.json`
  - remove `-normalizer`
  - canonical filename:
    - `3d-json-payload.schema.json`

- `asset-pipeline.schema.json`
  - remove `-tool`
  - canonical filename:
    - `asset-pipeline.schema.json`

### 2. Update all schema references

Update all `$ref`, manifest references, validation scripts, docs, and sample/game/tool JSON references to use the canonical schema filenames.

Required examples:

- `./tools/3d-json-payload.schema.json`
  - becomes:
    - `./tools/3d-json-payload.schema.json`

- `./tools/asset-pipeline.schema.json`
  - becomes:
    - `./tools/asset-pipeline.schema.json`

### 3. Align all JSON files to their schemas

Codex must validate and fix JSON files against the strict schemas.

Fix:
- invalid keys
- stale schema references
- stale tool ids
- missing required fields
- unknown properties
- schema/name mismatches

Do not:
- loosen schemas
- add alias fields
- keep transitional duplicates
- add fallback data
- add runtime implementation code

### 4. Restore compact primitive-array formatting rule

Restore this mandatory Project Instructions rule if missing or weakened.

Primitive arrays must remain compact-grouped.

Valid:

```json
[
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
],
```

Invalid:

```json
[
  1,
  1,
  1,
  1
],
```

Apply to:
- numbers
- strings
- booleans

Do not force compacting:
- arrays of objects
- nested arrays
- complex structures

### 5. Validation reports

Codex must write:

- `docs/dev/reports/schema_filename_canonicalization_11_104.txt`
- `docs/dev/reports/json_schema_alignment_11_104.txt`
- `docs/dev/reports/array_formatting_rule_11_104.txt`

## Validation

Run targeted validation only.

Required checks:
- all JSON parses
- all strict schemas validate
- no old schema filenames remain
- no primitive arrays are expanded one-value-per-line
- no `palette` or `palette-browser` tool alias remains from prior cleanup
- `palette-browser` remains canonical

## Full Samples Smoke Test

Skipped.

Reason:
- this PR is schema/reference/format validation focused
- no broad sample loader/framework behavior change is requested
- full samples smoke test takes approximately 20 minutes

## Acceptance

- canonical schema filenames are used everywhere
- JSON files align to schema
- compact primitive-array formatting rule is restored in `PROJECT_INSTRUCTIONS.md`
- compact primitive-array formatting remains applied across repo JSON
- validation report shows zero targeted schema failures or lists exact remaining failures without schema loosening
