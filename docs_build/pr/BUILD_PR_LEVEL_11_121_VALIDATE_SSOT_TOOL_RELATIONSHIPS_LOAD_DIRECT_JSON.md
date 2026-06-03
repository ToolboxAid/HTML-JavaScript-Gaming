# BUILD_PR_LEVEL_11_121_VALIDATE_SSOT_TOOL_RELATIONSHIPS_LOAD_DIRECT_JSON

## Purpose
Now that `toolbox/index.html` and `samples/index.html` counts match, validate that every SSoT sample/tool relationship actually loads direct JSON through the target tool.

## Scope
- testable validation/cleanup PR
- direct JSON contract enforcement
- schema-only validation enforcement
- no schema lock yet
- no fallback/default/preset data
- no second sample/tool relationship source
- no broad unrelated refactor

## Starting Point

PR 11.120 reconciled counts:
- tools hub relationship count matches samples hub Open Tool link count
- `samples/metadata/samples.index.metadata.json` is the relationship SSoT

## Required Rule

Every relationship in the SSoT must be real:

sample/tool relationship -> explicit JSON input -> matching schema -> tool renders

If that chain fails:
- fix deterministic JSON/schema/path issues
- otherwise remove the relationship from the SSoT
- do not create fake data
- do not fallback to defaults
- do not normalize/transform/convert runtime data

## Required Validation Loop

For each SSoT relationship:

1. Identify sample id.
2. Identify tool id.
3. Identify explicit JSON input path.
4. Identify schema path.
5. Confirm JSON file exists.
6. Confirm JSON parses.
7. Confirm JSON validates against schema.
8. Confirm tool receives JSON as-is.
9. Confirm invalid/missing input would show visible schema/file/parse error.

## Repair Rules

### Auto-fix when deterministic
Codex may fix:
- wrong path casing
- stale schema filename
- stale canonical tool name
- extra invalid fields
- compact primitive-array formatting
- wrong property name where schema intent is obvious
- stale launcher metadata pointing to correct existing JSON

### Remove relationship when non-fixable
Remove from SSoT when:
- input JSON does not exist
- required real data is missing
- tool cannot render the data without defaults
- relationship is unrelated to the sample
- multiple interpretations exist

## Required Reports

Codex must write populated reports:

- `docs_build/dev/reports/ssot_relationship_load_validation_11_121.txt`
- `docs_build/dev/reports/relationships_fixed_11_121.txt`
- `docs_build/dev/reports/relationships_removed_11_121.txt`
- `docs_build/dev/reports/relationships_working_11_121.txt`
- `docs_build/dev/reports/validation_after_11_121.txt`

Reports must include:
- every relationship checked
- sample id
- tool id
- JSON input path
- schema path
- result
- fix applied or removal reason
- final count

## Validation

Targeted validation only.

Required:
- changed JSON parses
- SSoT metadata validates
- sample hub count still matches SSoT
- tools hub count still matches SSoT
- every remaining relationship has explicit valid JSON input
- no known-bad removed links return
- no second active source is introduced

## Full Samples Smoke Test

Skipped.

Reason:
- targeted relationship/input validation
- full samples smoke test takes approximately 20 minutes

## Acceptance

- every remaining sample/tool SSoT relationship has explicit valid JSON input
- broken relationships are fixed or removed
- hub counts still match after cleanup
- no fake/default/preset data is introduced
- direct JSON/schema-only path is preserved
