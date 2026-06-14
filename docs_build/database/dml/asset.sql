-- Game Foundry Studio DEV database DML / seed review
-- Group: Asset
-- Ownership: docs_build/database/dml/asset.sql
-- Runtime setup/seed operations for this group must run through server-side APIs.
-- Temporary scope: DEV/review artifact only until Admin Site Setup/server seed APIs fully own grouped setup.
-- Browser pages must not directly seed authoritative DB records.
-- Owned tables: asset_role_definitions, asset_library_items, asset_storage_objects, asset_import_events, asset_validation_items

-- Empty/setup note: No executable DML is added for this group in PR_26164_105 because this group has no allowed static DEV user seed rows. Non-user setup records must be generated through the server/API seed layer so authoritative keys are real server/API-generated ULIDs.
