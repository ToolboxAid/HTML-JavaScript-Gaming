# BUILD_PR_LEVEL_8_19_SAMPLE_PAYLOAD_AUDIT_AND_ALIGNMENT

## Objective
Ensure all sample.<id>.<tool>.json files:

- match workspace tools[] payload structure
- contain ONLY:
  - $schema
  - tool
  - version
  - config

## Audit Rules

FOR EACH FILE:
samples/**/sample.*.*.json

VERIFY:
- no palette
- no paletteRef
- no assetRefs.paletteId
- no wrapper fields
- schema path valid
- tool matches filename

## Alignment Rule

Sample payload MUST be identical to:

workspace.manifest.json → tools[]

## Acceptance
- all sample payloads clean
- no embedded shared data
