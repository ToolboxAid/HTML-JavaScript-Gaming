-- Local DB SQLite schema map.
-- Source of truth for runtime DEV SQLite table fields is getMockDbTableSchemas() in src/dev-runtime/persistence/mock-db-store.js.
-- This file maps the runtime Local DB shape back to grouped DDL ownership under docs_build/database/ddl/.
-- Grouped Postgres/Supabase-style DDL is not executed directly by the Node SQLite Local DB adapter.
-- SQLite runtime values are serialized as TEXT for compatibility with JSON-shaped tool records.
-- Ownership fields createdBy and updatedBy reference users("key").

PRAGMA foreign_keys = ON;

-- Group: Account
-- Grouped DDL source: docs_build/database/ddl/account.sql
CREATE TABLE IF NOT EXISTS "users" (
    "key" TEXT PRIMARY KEY,
    "displayName" TEXT,
    "email" TEXT,
    "authProvider" TEXT,
    "authProviderUserId" TEXT,
    "isActive" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_users_createdby ON "users" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_users_updatedby ON "users" ("updatedBy");

CREATE TABLE IF NOT EXISTS "roles" (
    "key" TEXT PRIMARY KEY,
    "roleSlug" TEXT,
    "name" TEXT,
    "description" TEXT,
    "isSystemRole" TEXT,
    "isActive" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_roles_createdby ON "roles" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_roles_updatedby ON "roles" ("updatedBy");

CREATE TABLE IF NOT EXISTS "user_roles" (
    "key" TEXT PRIMARY KEY,
    "userKey" TEXT NOT NULL REFERENCES users("key"),
    "roleKey" TEXT NOT NULL REFERENCES roles("key"),
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_user_roles_createdby ON "user_roles" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_user_roles_updatedby ON "user_roles" ("updatedBy");

-- Group: Admin
-- Grouped DDL source: docs_build/database/ddl/admin.sql
CREATE TABLE IF NOT EXISTS "platform_settings" (
    "key" TEXT PRIMARY KEY,
    "settingKey" TEXT,
    "settingValue" TEXT,
    "settingType" TEXT,
    "description" TEXT,
    "isActive" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_platform_settings_createdby ON "platform_settings" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_platform_settings_updatedby ON "platform_settings" ("updatedBy");

-- Group: Game Workspace
-- Grouped DDL source: docs_build/database/ddl/game-workspace.sql
CREATE TABLE IF NOT EXISTS "game_workspace_games" (
    "key" TEXT PRIMARY KEY,
    "name" TEXT,
    "status" TEXT,
    "ownerKey" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_game_workspace_games_createdby ON "game_workspace_games" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_game_workspace_games_updatedby ON "game_workspace_games" ("updatedBy");

CREATE TABLE IF NOT EXISTS "game_workspace_progress" (
    "key" TEXT PRIMARY KEY,
    "gameKey" TEXT,
    "currentFocus" TEXT,
    "gameProgress" TEXT,
    "publishingProgress" TEXT,
    "recommendedNextTool" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_game_workspace_progress_createdby ON "game_workspace_progress" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_game_workspace_progress_updatedby ON "game_workspace_progress" ("updatedBy");

-- Group: Game Design
-- Grouped DDL source: docs_build/database/ddl/game-design.sql
CREATE TABLE IF NOT EXISTS "game_design_documents" (
    "key" TEXT PRIMARY KEY,
    "gameKey" TEXT,
    "title" TEXT,
    "status" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_game_design_documents_createdby ON "game_design_documents" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_game_design_documents_updatedby ON "game_design_documents" ("updatedBy");

CREATE TABLE IF NOT EXISTS "game_design_validation_items" (
    "key" TEXT PRIMARY KEY,
    "gameKey" TEXT,
    "label" TEXT,
    "status" TEXT,
    "action" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_game_design_validation_items_createdby ON "game_design_validation_items" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_game_design_validation_items_updatedby ON "game_design_validation_items" ("updatedBy");

-- Group: Game Configuration
-- Grouped DDL source: docs_build/database/ddl/game-configuration.sql
CREATE TABLE IF NOT EXISTS "game_configuration_records" (
    "key" TEXT PRIMARY KEY,
    "gameKey" TEXT,
    "status" TEXT,
    "summary" TEXT,
    "playerMode" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_game_configuration_records_createdby ON "game_configuration_records" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_game_configuration_records_updatedby ON "game_configuration_records" ("updatedBy");

CREATE TABLE IF NOT EXISTS "game_configuration_validation_items" (
    "key" TEXT PRIMARY KEY,
    "gameKey" TEXT,
    "label" TEXT,
    "status" TEXT,
    "action" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_game_configuration_validation_items_createdby ON "game_configuration_validation_items" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_game_configuration_validation_items_updatedby ON "game_configuration_validation_items" ("updatedBy");

-- Group: Objects
-- Grouped DDL source: docs_build/database/ddl/objects.sql
CREATE TABLE IF NOT EXISTS "object_definition_records" (
    "key" TEXT PRIMARY KEY,
    "id" TEXT,
    "gameId" TEXT,
    "name" TEXT,
    "type" TEXT,
    "state" TEXT,
    "modelType" TEXT,
    "renderType" TEXT,
    "renderAssetKey" TEXT,
    "renderPreviewPath" TEXT,
    "capabilities" TEXT,
    "behavior" TEXT,
    "interaction" TEXT,
    "recordOrder" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_object_definition_records_createdby ON "object_definition_records" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_object_definition_records_updatedby ON "object_definition_records" ("updatedBy");

-- Group: Controls
-- Grouped DDL source: docs_build/database/ddl/controls.sql
CREATE TABLE IF NOT EXISTS "game_input_mappings" (
    "key" TEXT PRIMARY KEY,
    "id" TEXT,
    "gameId" TEXT,
    "objectKey" TEXT,
    "objectName" TEXT,
    "gameAction" TEXT,
    "gameActionLabel" TEXT,
    "usageLabel" TEXT,
    "normalizedInput" TEXT,
    "inputFamily" TEXT,
    "eventD" TEXT,
    "eventH" TEXT,
    "eventU" TEXT,
    "eventDC" TEXT,
    "eventDrag" TEXT,
    "eventAxis" TEXT,
    "enabled" TEXT,
    "state" TEXT,
    "recordOrder" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_game_input_mappings_createdby ON "game_input_mappings" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_game_input_mappings_updatedby ON "game_input_mappings" ("updatedBy");

CREATE TABLE IF NOT EXISTS "player_controller_profiles" (
    "key" TEXT PRIMARY KEY,
    "id" TEXT,
    "playerId" TEXT,
    "deviceType" TEXT,
    "controllerName" TEXT,
    "controllerId" TEXT,
    "profileName" TEXT,
    "inputs" TEXT,
    "inputMappings" TEXT,
    "recordOrder" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_player_controller_profiles_createdby ON "player_controller_profiles" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_player_controller_profiles_updatedby ON "player_controller_profiles" ("updatedBy");

CREATE TABLE IF NOT EXISTS "player_input_device_selections" (
    "key" TEXT PRIMARY KEY,
    "id" TEXT,
    "playerId" TEXT,
    "selectionKey" TEXT,
    "selectionType" TEXT,
    "deviceType" TEXT,
    "controllerId" TEXT,
    "profileId" TEXT,
    "label" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_player_input_device_selections_createdby ON "player_input_device_selections" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_player_input_device_selections_updatedby ON "player_input_device_selections" ("updatedBy");

CREATE TABLE IF NOT EXISTS "input_custom_action_records" (
    "key" TEXT PRIMARY KEY,
    "id" TEXT,
    "gameId" TEXT,
    "label" TEXT,
    "recordOrder" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_input_custom_action_records_createdby ON "input_custom_action_records" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_input_custom_action_records_updatedby ON "input_custom_action_records" ("updatedBy");

-- Group: Game Journey
-- Grouped DDL source: docs_build/database/ddl/game-journey.sql
CREATE TABLE IF NOT EXISTS "game_journey_note_types" (
    "key" TEXT PRIMARY KEY,
    "typeSlug" TEXT,
    "name" TEXT,
    "seeded" TEXT,
    "userExtensible" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_game_journey_note_types_createdby ON "game_journey_note_types" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_game_journey_note_types_updatedby ON "game_journey_note_types" ("updatedBy");

CREATE TABLE IF NOT EXISTS "game_journey_notes" (
    "key" TEXT PRIMARY KEY,
    "slug" TEXT,
    "gameKey" TEXT,
    "ownerKey" TEXT,
    "name" TEXT,
    "typeKey" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_game_journey_notes_createdby ON "game_journey_notes" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_game_journey_notes_updatedby ON "game_journey_notes" ("updatedBy");

CREATE TABLE IF NOT EXISTS "game_journey_templates" (
    "key" TEXT PRIMARY KEY,
    "templateSlug" TEXT,
    "originalMeaning" TEXT,
    "systemGuidance" TEXT,
    "linkedToolContexts" TEXT,
    "version" TEXT,
    "isActive" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_game_journey_templates_createdby ON "game_journey_templates" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_game_journey_templates_updatedby ON "game_journey_templates" ("updatedBy");

CREATE TABLE IF NOT EXISTS "game_journey_items" (
    "key" TEXT PRIMARY KEY,
    "gameKey" TEXT,
    "noteKey" TEXT,
    "status" TEXT,
    "title" TEXT,
    "userDetails" TEXT,
    "templateKey" TEXT,
    "linkedRecordType" TEXT,
    "linkedRecordId" TEXT,
    "indent" TEXT,
    "order" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_game_journey_items_createdby ON "game_journey_items" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_game_journey_items_updatedby ON "game_journey_items" ("updatedBy");

CREATE TABLE IF NOT EXISTS "game_journey_activity" (
    "key" TEXT PRIMARY KEY,
    "gameKey" TEXT,
    "noteKey" TEXT,
    "message" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_game_journey_activity_createdby ON "game_journey_activity" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_game_journey_activity_updatedby ON "game_journey_activity" ("updatedBy");

-- Group: Palette
-- Grouped DDL source: docs_build/database/ddl/palette.sql
CREATE TABLE IF NOT EXISTS "palette_colors" (
    "key" TEXT PRIMARY KEY,
    "gameId" TEXT,
    "swatchKey" TEXT,
    "hex" TEXT,
    "name" TEXT,
    "source" TEXT,
    "tags" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_palette_colors_createdby ON "palette_colors" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_palette_colors_updatedby ON "palette_colors" ("updatedBy");

CREATE TABLE IF NOT EXISTS "palette_source_swatches" (
    "key" TEXT PRIMARY KEY,
    "id" TEXT,
    "swatchKey" TEXT,
    "hex" TEXT,
    "name" TEXT,
    "source" TEXT,
    "sourceLabel" TEXT,
    "tags" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_palette_source_swatches_createdby ON "palette_source_swatches" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_palette_source_swatches_updatedby ON "palette_source_swatches" ("updatedBy");

CREATE TABLE IF NOT EXISTS "palette_swatch_usages" (
    "key" TEXT PRIMARY KEY,
    "id" TEXT,
    "gameId" TEXT,
    "assetId" TEXT,
    "swatchHex" TEXT,
    "swatchName" TEXT,
    "swatchKey" TEXT,
    "toolId" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_palette_swatch_usages_createdby ON "palette_swatch_usages" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_palette_swatch_usages_updatedby ON "palette_swatch_usages" ("updatedBy");

CREATE TABLE IF NOT EXISTS "project_workspace_palette_globals" (
    "key" TEXT PRIMARY KEY,
    "gameId" TEXT,
    "swatchCount" TEXT,
    "toolKey" TEXT,
    "workspacePath" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_project_workspace_palette_globals_createdby ON "project_workspace_palette_globals" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_project_workspace_palette_globals_updatedby ON "project_workspace_palette_globals" ("updatedBy");

-- Group: Tags
-- Grouped DDL source: docs_build/database/ddl/tags.sql
CREATE TABLE IF NOT EXISTS "workspace_tag_records" (
    "key" TEXT PRIMARY KEY,
    "id" TEXT,
    "gameId" TEXT,
    "name" TEXT,
    "description" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_workspace_tag_records_createdby ON "workspace_tag_records" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_workspace_tag_records_updatedby ON "workspace_tag_records" ("updatedBy");

-- Group: Asset
-- Grouped DDL source: docs_build/database/ddl/asset.sql
CREATE TABLE IF NOT EXISTS "asset_role_definitions" (
    "key" TEXT PRIMARY KEY,
    "id" TEXT,
    "label" TEXT,
    "storageFolder" TEXT,
    "extensions" TEXT,
    "mimeTypes" TEXT,
    "previewBehavior" TEXT,
    "uploadEnabled" TEXT,
    "inputMode" TEXT,
    "usageRoles" TEXT,
    "maxSizeBytes" TEXT,
    "dbFields" TEXT,
    "validationNeeds" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_asset_role_definitions_createdby ON "asset_role_definitions" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_asset_role_definitions_updatedby ON "asset_role_definitions" ("updatedBy");

CREATE TABLE IF NOT EXISTS "asset_library_items" (
    "key" TEXT PRIMARY KEY,
    "id" TEXT,
    "gameId" TEXT,
    "ownerProjectId" TEXT,
    "ownerUserId" TEXT,
    "assetRole" TEXT,
    "assetRoleLabel" TEXT,
    "assetType" TEXT,
    "description" TEXT,
    "tagKeys" TEXT,
    "name" TEXT,
    "source" TEXT,
    "reference" TEXT,
    "fileName" TEXT,
    "originalName" TEXT,
    "mimeType" TEXT,
    "size" TEXT,
    "checksum" TEXT,
    "storageObjectId" TEXT,
    "storedPath" TEXT,
    "path" TEXT,
    "previewKind" TEXT,
    "role" TEXT,
    "type" TEXT,
    "usage" TEXT,
    "status" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_asset_library_items_createdby ON "asset_library_items" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_asset_library_items_updatedby ON "asset_library_items" ("updatedBy");

CREATE TABLE IF NOT EXISTS "asset_storage_objects" (
    "key" TEXT PRIMARY KEY,
    "id" TEXT,
    "assetId" TEXT,
    "gameId" TEXT,
    "ownerProjectId" TEXT,
    "role" TEXT,
    "originalName" TEXT,
    "storedPath" TEXT,
    "mimeType" TEXT,
    "size" TEXT,
    "checksum" TEXT,
    "status" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_asset_storage_objects_createdby ON "asset_storage_objects" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_asset_storage_objects_updatedby ON "asset_storage_objects" ("updatedBy");

CREATE TABLE IF NOT EXISTS "asset_import_events" (
    "key" TEXT PRIMARY KEY,
    "id" TEXT,
    "assetId" TEXT,
    "gameId" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "storedPath" TEXT,
    "status" TEXT,
    "type" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_asset_import_events_createdby ON "asset_import_events" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_asset_import_events_updatedby ON "asset_import_events" ("updatedBy");

CREATE TABLE IF NOT EXISTS "asset_validation_items" (
    "key" TEXT PRIMARY KEY,
    "id" TEXT,
    "gameId" TEXT,
    "field" TEXT,
    "label" TEXT,
    "status" TEXT,
    "action" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_asset_validation_items_createdby ON "asset_validation_items" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_asset_validation_items_updatedby ON "asset_validation_items" ("updatedBy");

-- Group: Tool Metadata
-- Grouped DDL source: docs_build/database/ddl/tool-metadata.sql
CREATE TABLE IF NOT EXISTS "toolbox_tool_metadata" (
    "key" TEXT PRIMARY KEY,
    "toolKey" TEXT,
    "toolName" TEXT,
    "shortLabel" TEXT,
    "shortDescription" TEXT,
    "description" TEXT,
    "group" TEXT,
    "category" TEXT,
    "colorGroup" TEXT,
    "toolboxGroup" TEXT,
    "subgroup" TEXT,
    "path" TEXT,
    "order" TEXT,
    "status" TEXT,
    "badge" TEXT,
    "toolImage" TEXT,
    "active" TEXT,
    "adminOnly" TEXT,
    "hidden" TEXT,
    "deferred" TEXT,
    "visibleInToolsList" TEXT,
    "capabilityLabel" TEXT,
    "childCapabilities" TEXT,
    "requiredRole" TEXT,
    "statusDiagnostic" TEXT,
    "toolId" TEXT,
    "releaseChannel" TEXT,
    "releaseChannelLabel" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_toolbox_tool_metadata_createdby ON "toolbox_tool_metadata" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_toolbox_tool_metadata_updatedby ON "toolbox_tool_metadata" ("updatedBy");

-- Group: Tool Planning
-- Grouped DDL source: docs_build/database/ddl/tool-planning.sql
CREATE TABLE IF NOT EXISTS "toolbox_tool_planning" (
    "key" TEXT PRIMARY KEY,
    "toolKey" TEXT,
    "readiness" TEXT,
    "requiredForPlayable" TEXT,
    "requiredForTestable" TEXT,
    "requiredForPublish" TEXT,
    "requires" TEXT,
    "progressChecklist" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_toolbox_tool_planning_createdby ON "toolbox_tool_planning" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_toolbox_tool_planning_updatedby ON "toolbox_tool_planning" ("updatedBy");

-- Group: Toolbox Votes
-- Grouped DDL source: docs_build/database/ddl/toolbox-votes.sql
CREATE TABLE IF NOT EXISTS "toolbox_votes" (
    "key" TEXT PRIMARY KEY,
    "toolId" TEXT,
    "userKey" TEXT,
    "direction" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_toolbox_votes_createdby ON "toolbox_votes" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_toolbox_votes_updatedby ON "toolbox_votes" ("updatedBy");

-- Group: Support Tickets
-- Grouped DDL source: docs_build/database/ddl/support-tickets.sql
CREATE TABLE IF NOT EXISTS "support_categories" (
    "key" TEXT PRIMARY KEY,
    "categorySlug" TEXT,
    "name" TEXT,
    "description" TEXT,
    "isActive" TEXT,
    "sortOrder" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_support_categories_createdby ON "support_categories" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_support_categories_updatedby ON "support_categories" ("updatedBy");

-- Group: Tool State Samples
-- Grouped DDL source: Local DB compatibility table; grouped guest seed data is owned under docs_build/database/seed/guest/.
CREATE TABLE IF NOT EXISTS "tool_state_samples" (
    "key" TEXT PRIMARY KEY,
    "audience" TEXT,
    "userKey" TEXT,
    "displayName" TEXT,
    "toolKey" TEXT,
    "toolName" TEXT,
    "route" TEXT,
    "gameKey" TEXT,
    "toolStateKey" TEXT,
    "manifestPath" TEXT,
    "sampleLabel" TEXT,
    "sampleKind" TEXT,
    "loadablePath" TEXT,
    "toolStatePayload" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "createdBy" TEXT NOT NULL REFERENCES users("key"),
    "updatedBy" TEXT NOT NULL REFERENCES users("key")
);
CREATE INDEX IF NOT EXISTS idx_tool_state_samples_createdby ON "tool_state_samples" ("createdBy");
CREATE INDEX IF NOT EXISTS idx_tool_state_samples_updatedby ON "tool_state_samples" ("updatedBy");

