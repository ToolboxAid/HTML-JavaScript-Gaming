-- Game Foundry Studio DEV database DDL
-- Ownership: docs_build/database/ddl/
-- Target DEV database: gamefoundry_dev
-- Scope: app identity tables only. No custom password tables are defined here.
-- Identity ownership follows the project key-based governance model.

CREATE TABLE IF NOT EXISTS users (
    key text PRIMARY KEY,
    "displayName" text NOT NULL DEFAULT 'Creator',
    email text,
    "authProvider" text,
    "authProviderUserId" text,
    "isActive" boolean NOT NULL DEFAULT true,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    "createdBy" text REFERENCES users(key) ON DELETE SET NULL,
    "updatedBy" text REFERENCES users(key) ON DELETE SET NULL,
    CONSTRAINT users_auth_identity_unique UNIQUE ("authProvider", "authProviderUserId")
);

CREATE TABLE IF NOT EXISTS roles (
    key text PRIMARY KEY,
    "roleSlug" text NOT NULL UNIQUE,
    name text NOT NULL,
    description text NOT NULL DEFAULT '',
    "isSystemRole" boolean NOT NULL DEFAULT false,
    "isActive" boolean NOT NULL DEFAULT true,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    "createdBy" text NOT NULL REFERENCES users(key),
    "updatedBy" text NOT NULL REFERENCES users(key)
);

CREATE TABLE IF NOT EXISTS user_roles (
    key text PRIMARY KEY,
    "userKey" text NOT NULL REFERENCES users(key) ON DELETE CASCADE,
    "roleKey" text NOT NULL REFERENCES roles(key) ON DELETE CASCADE,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    "createdBy" text NOT NULL REFERENCES users(key),
    "updatedBy" text NOT NULL REFERENCES users(key),
    CONSTRAINT user_roles_user_role_unique UNIQUE ("userKey", "roleKey")
);
