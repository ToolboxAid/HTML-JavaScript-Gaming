-- Game Foundry Studio DEV database DDL
-- Group: Asset
-- Ownership: docs_build/database/ddl/asset.sql
-- Runtime Local DB schemas for these tables are currently owned by src/dev-runtime/persistence/mock-db-store.js.
-- This grouped file documents the product/tool ownership boundary until an executable migration PR promotes the table DDL.
-- Owned tables: asset_role_definitions, asset_library_items, asset_storage_objects, asset_import_events, asset_validation_items

-- Server/API layer owns authoritative key generation for records in this group.
