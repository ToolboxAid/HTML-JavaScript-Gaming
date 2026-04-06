# Engine Maturity Versioning Strategy

## Purpose
Define contract metadata and lifecycle rules for promoted debug surfaces.

## Contract Metadata (required)
Each promoted contract should declare:
- `contractId`
- `contractVersion`
- `compatibility`
  - `backwardCompatible` (boolean)
  - `notes` (string)
- `status` (`active|deprecated`)
- `deprecatedSince` (optional)
- `replacementContractId` (optional)

## Semantic Version Rules
- MAJOR: breaking change
- MINOR: additive compatible change
- PATCH: non-breaking fixes/clarifications

## Compatibility Rules
- MINOR/PATCH must preserve existing consumers
- breaking changes require MAJOR + migration notes
- deprecated contracts require replacement path

## Deprecation Window
1. mark deprecated with replacement
2. keep compatibility during transition window
3. remove only on a MAJOR boundary
