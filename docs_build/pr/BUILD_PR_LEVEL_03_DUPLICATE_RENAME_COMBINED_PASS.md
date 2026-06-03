
# BUILD_PR_LEVEL_03_DUPLICATE_RENAME_COMBINED_PASS

## Purpose
Complete the duplicate/rename normalization lane for `getState`-family naming with classification-first enforcement.

## What was implemented

### 1) All getState-variant identification + domain bucketing
- Added reusable classifier at:
  - `src/shared/state/getStateVariantClassification.js`
- Added public exports in:
  - `src/shared/state/index.js`
- Classifier capabilities:
  - identify `getState` variants from source text
  - bucket variants by domain:
    - `simulation`
    - `replay`
    - `editor`
    - `other`
  - classify each variant by layer:
    - `sample`
    - `tool`
    - `runtime`
    - `other`

### 2) Naming normalization enforcement
- Canonical domain selector naming is now explicitly validated:
  - `getSimulationState`
  - `getReplayState`
  - `getEditorState`
- Enforced through focused test:
  - `tests/shared/GetStateVariantClassification.test.mjs`

### 3) Duplicate classification before move
- Classification scan executed across:
  - `src/`
  - `games/`
  - `samples/`
  - `tools/`
- Scan summary:
  - total variant entries: `133`
  - domain counts:
    - `simulation`: `4`
    - `replay`: `4`
    - `editor`: `4`
    - `other`: `121`
  - layer counts:
    - `sample`: `28`
    - `tool`: `13`
    - `runtime`: `92`
- Cross-layer duplicates identified before move:
  - `getState` => runtime, sample, tool
  - `getStateApi` => runtime, sample
  - `getStateApiRef` => runtime, sample
  - `getStateName` => runtime, sample
  - `getTrackState` => runtime, sample

### 4) Move decision
- No cross-layer move was performed in this PR.
- Reason: classification-first rule applied; variant groups were identified and bucketed before any move, and no safe move was required to establish naming/ownership truth in this pass.

## Roadmap status updates
- Updated status markers only for:
  - `getState` variants bucketed by domain
  - `getSimulationState` naming established where needed
  - `getReplayState` naming established where needed
  - `getEditorState` naming established where needed
  - sample/tool/runtime duplicates classified before move

## Validation run
- `node --check src/shared/state/getStateVariantClassification.js`
- `node --check src/shared/state/index.js`
- `node --check tests/shared/GetStateVariantClassification.test.mjs`
- `node --input-type=module -e "import { run } from './tests/shared/GetStateVariantClassification.test.mjs'; run();"`
- `node --input-type=module -e "import { run } from './tests/shared/SharedFoundationCombinedPass.test.mjs'; run();"`
- `node tests/render/Renderer.test.mjs`

## Outcome
The duplicate/rename focus items for Section-3 were completed in one classification-first pass with no blind moves.
