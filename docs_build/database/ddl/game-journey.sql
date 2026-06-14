-- Game Foundry Studio DEV database DDL
-- Group: Game Journey
-- Ownership: docs_build/database/ddl/game-journey.sql
-- Runtime Local DB schemas for these tables are currently owned by src/dev-runtime/persistence/mock-db-store.js.
-- This grouped file documents the product/tool ownership boundary until an executable migration PR promotes the table DDL.
-- Owned tables: game_journey_note_types, game_journey_notes, game_journey_templates, game_journey_items, game_journey_activity

-- Server/API layer owns authoritative key generation for records in this group.
