# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: low

1. Update resolveAcceptedAssetKindsForTool:
   - remove aliases
   - use canonical mapping only

2. Replace all asset kinds in repo:
   - normalize to canonical names

3. Remove:
   - "*"
   - duplicate kinds per tool
   - alias values

4. Validate:
   - tools match schema
   - samples use canonical kinds
   - no unknown kinds exist

5. Report:
   docs/dev/reports/asset_kind_canonicalization_11_106.txt
