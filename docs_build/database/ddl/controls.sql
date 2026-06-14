-- Game Foundry Studio DEV database DDL
-- Group: Controls
-- Ownership: docs_build/database/ddl/controls.sql
-- Runtime Local DB schemas for these tables are currently owned by src/dev-runtime/persistence/mock-db-store.js.
-- This grouped file documents the product/tool ownership boundary until an executable migration PR promotes the table DDL.
-- Owned tables: game_input_mappings, player_controller_profiles, player_input_device_selections, input_custom_action_records

-- Server/API layer owns authoritative key generation for records in this group.
