# PR_26152_269 Project Data Store Contract

## Scope

- Added `src/shared/contracts/projectDataStoreContract.js`.
- Added `tests/shared/ProjectDataStoreContract.test.mjs`.
- Defined a UI/tool-page independent project data store contract.
- Covered these record types:
  - projects
  - manifests
  - assets
  - tool outputs
  - Custom Extensions
  - Custom Extension approvals
  - publish state

## Boundary Rules

- The store contract is swappable for a future real database.
- Browser storage is not the authoritative store.
- `localStorage` and `sessionStorage` are forbidden as persisted store state.
- UI/tool-page state is forbidden as persisted store state.
- runtime ProjectWorkspace state is forbidden as persisted store state.
- auth session state is forbidden as persisted store state.

## Contract Coverage

- PASS: required record types and collection names are defined.
- PASS: collection-to-record-type mapping is defined.
- PASS: adapter method surface is defined: `putRecord`, `getRecord`, `listRecords`, `deleteRecord`, `clear`.
- PASS: Custom Extension approval lifecycle states are represented.
- PASS: publish-state values are represented.
- PASS: valid records validate.
- PASS: missing owner/project/payload values reject.
- PASS: invalid approval and publish status values reject.
- PASS: forbidden UI/browser/runtime fields reject.
- PASS: records in the wrong collection reject.
- PASS: adapter shape validation rejects incomplete adapters.

## Validation

- PASS: `node tests/shared/ProjectDataStoreContract.test.mjs`
- PASS: `git diff --check`

## Scope Exclusions

- No UI implementation.
- No Toolbox rebuild.
- No samples.
- No external database implementation.
