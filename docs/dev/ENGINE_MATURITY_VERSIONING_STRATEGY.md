# Engine Maturity Versioning Strategy

## Contract Metadata
Each promoted contract should declare:
- `contractId`
- `contractVersion`
- `compatibility` (`backwardCompatible`, `notes`)
- `status` (`active|deprecated`)
- `deprecatedSince` (optional)
- `replacementContractId` (optional)

## SemVer Rules
- MAJOR: breaking
- MINOR: additive/backward-compatible
- PATCH: non-breaking fix/clarification

## Deprecation
- mark deprecated with replacement guidance
- keep transition window
- remove only on MAJOR boundary
