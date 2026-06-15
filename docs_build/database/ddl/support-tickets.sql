-- Game Foundry Studio DEV database DDL
-- Group: Support Tickets
-- Ownership: docs_build/database/ddl/support-tickets.sql
-- Target DEV database: gamefoundry_dev
-- Scope: Support category setup ownership.

CREATE TABLE IF NOT EXISTS support_categories (
    key text PRIMARY KEY,
    "categorySlug" text NOT NULL UNIQUE,
    name text NOT NULL,
    description text NOT NULL DEFAULT '',
    "isActive" boolean NOT NULL DEFAULT true,
    "sortOrder" integer NOT NULL DEFAULT 1,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    "createdBy" text NOT NULL REFERENCES users(key),
    "updatedBy" text NOT NULL REFERENCES users(key)
);

CREATE INDEX IF NOT EXISTS idx_support_categories_createdby ON support_categories ("createdBy");
CREATE INDEX IF NOT EXISTS idx_support_categories_updatedby ON support_categories ("updatedBy");
