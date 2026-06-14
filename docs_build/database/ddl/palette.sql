-- Game Foundry Studio DEV database DDL
-- Group: Palette
-- Ownership: docs_build/database/ddl/palette.sql
-- Runtime Local DB schemas for these tables are currently owned by src/dev-runtime/persistence/mock-db-store.js.
-- This grouped file documents the product/tool ownership boundary until an executable migration PR promotes the table DDL.
-- Owned tables: palette_colors, palette_source_swatches, palette_swatch_usages, project_workspace_palette_globals

-- Server/API layer owns authoritative key generation for records in this group.
