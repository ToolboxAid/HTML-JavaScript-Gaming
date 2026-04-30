# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: medium

## PR
BUILD_PR_LEVEL_11_114_ENFORCE_JSON_FIX_ON_FAILURE

## Execute

1. Continue from PR 11.113

2. For each validation failure:
   classify:
   - FIXABLE
   - NON-FIXABLE

3. FIXABLE:
   - apply fix directly in JSON
   - revalidate
   - confirm schema passes

4. NON-FIXABLE:
   - record blocker with:
     file
     field
     reason
     required action

5. Auto-fix:
   - schema mismatches
   - invalid keys
   - naming issues
   - extra fields
   - array formatting
   - canonical names

6. DO NOT:
   - invent missing data
   - use defaults
   - use presets
   - normalize at runtime

7. Validate:
   - JSON parses
   - schema passes after fix

8. Reports:
   docs/dev/reports/fixes_applied_11_114.txt
   docs/dev/reports/fix_blockers_11_114.txt

9. Output ZIP:
   tmp/PR_11_114_ENFORCE_JSON_FIX_ON_FAILURE.zip
