# REPORT_PR_11_19_SCHEMA_CLEANUP_TOOL_PAYLOADS_AND_PALETTE_CANONICALIZATION

## Summary
This PR cleans up schema SSoT:
- one palette schema at toolbox/schemas/tools/palette-browser.schema.json
- no broad sample wrapper schema for tool payloads
- clearer payload naming instead of config
- generic project/source identity instead of gameId where appropriate

## Target
Tools validate direct strict tool JSON only.
