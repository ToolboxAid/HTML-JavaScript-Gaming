# PR_26152_270 In-Memory Project Data Store

## Scope

- Added `src/shared/projectDataStore/inMemoryProjectDataStore.js`.
- Added `tests/shared/InMemoryProjectDataStore.test.mjs`.
- Implemented a runtime/dev-only in-memory Project Data Store adapter.
- Kept the implementation replaceable by a future real database adapter.

## Adapter Surface

- `putRecord(record)`
- `getRecord(recordType, recordId)`
- `listRecords(filters)`
- `deleteRecord(recordType, recordId)`
- `clear()`

## Boundary Rules

- The in-memory adapter validates records through `projectDataStoreContract.js`.
- The adapter does not use `localStorage`.
- The adapter does not use `sessionStorage`.
- The adapter does not use IndexedDB.
- The adapter does not introduce an external database dependency.
- Returned records are cloned and frozen so callers cannot mutate stored data by reference.

## Test Coverage

- PASS: adapter validates against the shared Project Data Store contract.
- PASS: initial records can seed the store.
- PASS: invalid initial records reject visibly.
- PASS: valid records can be written and read.
- PASS: record replacement updates existing keys.
- PASS: list filters work for record type, owner, and project.
- PASS: delete removes records.
- PASS: clear removes all records.
- PASS: invalid records reject and are not stored.
- PASS: source scan confirms no browser storage or IndexedDB usage.

## Validation

- PASS: `node tests/shared/InMemoryProjectDataStore.test.mjs`
- PASS: `git diff --check`

## Scope Exclusions

- No real database.
- No browser storage as authoritative store.
- No Toolbox rebuild.
- No samples.
