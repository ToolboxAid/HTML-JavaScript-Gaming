-- Game Foundry Studio DEV database DDL
-- Group: Admin
-- Ownership: docs_build/database/ddl/admin.sql
-- Target DEV database: gamefoundry_dev
-- Scope: Admin Site Setup ownership tables.

CREATE TABLE IF NOT EXISTS platform_settings (
    key text PRIMARY KEY,
    "settingKey" text NOT NULL UNIQUE,
    "settingValue" text NOT NULL DEFAULT '',
    "settingType" text NOT NULL DEFAULT 'string',
    description text NOT NULL DEFAULT '',
    "isActive" boolean NOT NULL DEFAULT true,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    "createdBy" text NOT NULL REFERENCES users(key),
    "updatedBy" text NOT NULL REFERENCES users(key)
);

CREATE INDEX IF NOT EXISTS idx_platform_settings_createdby ON platform_settings ("createdBy");
CREATE INDEX IF NOT EXISTS idx_platform_settings_updatedby ON platform_settings ("updatedBy");
