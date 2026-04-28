# PR_10_24_SAMPLE_JSON_DESTINATION_NORMALIZATION Report

## Scope
Normalized misleading sample-owned JSON destination hints under `samples/` to valid sample-local paths, without modifying game-owned JSON or runtime/sample implementation code.

## Files Changed
- `samples/phase-02/0204/sample.0204.asset-browser.json`
- `samples/phase-14/1413/sample.1413.asset-browser.json`
- `samples/phase-15/1505/sample.1505.asset-browser.json`
- `docs/dev/reports/PR_10_24_SAMPLE_JSON_DESTINATION_NORMALIZATION_report.md`

## Destination Hint Changes

### 0204
- `importDestination`
  - from: `/samples/phase-02/0204/config/`
  - to: `/samples/phase-02/0204/assets/`

### 1413
- `importDestination`
  - from: `/samples/phase-14/1413/assets/sprites/`
  - to: `/samples/phase-14/1413/assets/images/`

### 1505
- `importDestination`
  - from: `/samples/phase-15/1505/config/`
  - to: `/samples/phase-15/1505/assets/`

## 1413 Specific Requirement
- The sample 1413 Asset Browser / Import Hub destination hint is now a valid sample-local path:
  - `/samples/phase-14/1413/assets/images/`

## Preservation Confirmations
- Asset catalogs unchanged.
- Source paths unchanged.
- IDs unchanged.
- Schemas unchanged.
- Tool identities unchanged.
- Preview behavior-related fields unchanged.

## Validation Performed
1. Searched all JSON under `samples/` for `games/<project>/` placeholders.
2. Enumerated `importDestination` fields in all sample JSON.
3. Parsed changed JSON files to confirm valid JSON.
4. Verified each updated destination path exists on disk.

## Validation Results
- No sample-owned JSON contains `games/<project>/`.
- Updated destination hints point to existing sample-local folders.
- Changed JSON files parse successfully.

## Guardrails
- No modifications under `games/`.
- No `start_of_day` folder changes.
