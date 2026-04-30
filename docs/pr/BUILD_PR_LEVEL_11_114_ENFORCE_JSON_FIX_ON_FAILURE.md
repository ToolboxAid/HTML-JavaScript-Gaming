# BUILD_PR_LEVEL_11_114_ENFORCE_JSON_FIX_ON_FAILURE

## Purpose
Force Codex to actively FIX invalid JSON/schema/tool-input issues instead of only reporting them when safe to do so.

## Scope
- continues repair-or-report enforcement
- prioritizes FIX over REPORT when possible
- still no schema lock
- still direct JSON contract
- still schema-only validation

## Core Rule

If JSON is wrong AND fix is deterministic → FIX IT

Only report when:
- missing required data that cannot be inferred
- ambiguity exists
- external decision required

## Required Behavior

For every failure:

1. Detect failure
2. Classify:
   - fixable (structure, naming, schema mismatch)
   - non-fixable (missing data, ambiguous intent)

3. If FIXABLE:
   - correct JSON to match schema
   - correct field names
   - remove invalid fields
   - align to canonical names
   - revalidate

4. If NOT FIXABLE:
   - report exact blocker
   - include file + field + reason

## Fixable Examples

Codex MUST auto-fix:

- wrong property names
- wrong tool ids
- wrong asset kinds
- schema filename mismatches
- expanded primitive arrays → compact
- invalid extra properties → remove
- incorrect casing
- legacy naming

## Non-Fixable Examples

Codex must REPORT:

- missing required asset data
- missing external file
- unclear intent (multiple valid interpretations)

## Validation

- all fixes must pass schema validation
- no fallback/default introduced
- no normalization layer reintroduced

## Reports

- docs/dev/reports/fixes_applied_11_114.txt
- docs/dev/reports/fix_blockers_11_114.txt

Reports MUST include:
- file
- change made
- before/after
- validation result

## Acceptance

- repo actively improves (not just reports)
- JSON moves toward fully valid state
- blockers are only true blockers
