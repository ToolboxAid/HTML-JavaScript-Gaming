-- TEMPORARY DEV-ONLY SETUP/REVIEW ARTIFACT
-- Group: Account
-- Ownership: docs_build/database/dml/account.sql
-- DEV review only. Codex may execute DEV database setup only.
-- DML status: review-only DEV static user shape.
-- UAT and production SQL execution is user-controlled.
-- Runtime reseed/setup must be called through Admin-owned server-side APIs.
-- Supabase Auth identity sync must use scripts/sync-supabase-dev-creator-identities.mjs.
-- Target DEV database: gamefoundry_dev
-- Temporary DEV static user ULID exception:
--   Static ULIDs are allowed only for User 1, User 2, User 3, and DavidQ.
--   Static ULIDs are allowed for user_roles only to bind these DEV users to existing roles.
--   Non-user records, including roles, must use real server/API-generated keys.
-- No passwords, password hashes, password reset tokens, or authProvider='mock' records are defined here.
-- authProviderUserId values must be replaced by the server-side sync with real auth.users.id values before runtime validation.

INSERT INTO users (
    key,
    "displayName",
    email,
    "authProvider",
    "authProviderUserId",
    "isActive",
    "createdAt",
    "updatedAt",
    "createdBy",
    "updatedBy"
)
VALUES
    (
        '01K2GFSJ0Y0000000000000051',
        'User 1',
        'user1@example.invalid',
        'supabase-auth',
        'user-1',
        true,
        now(),
        now(),
        '01K2GFSJ0Y0000000000000054',
        '01K2GFSJ0Y0000000000000054'
    ),
    (
        '01K2GFSJ0Y0000000000000052',
        'User 2',
        'user2@example.invalid',
        'supabase-auth',
        'user-2',
        true,
        now(),
        now(),
        '01K2GFSJ0Y0000000000000054',
        '01K2GFSJ0Y0000000000000054'
    ),
    (
        '01K2GFSJ0Y0000000000000053',
        'User 3',
        'user3@example.invalid',
        'supabase-auth',
        'user-3',
        true,
        now(),
        now(),
        '01K2GFSJ0Y0000000000000054',
        '01K2GFSJ0Y0000000000000054'
    ),
    (
        '01K2GFSJ0Y0000000000000054',
        'DavidQ',
        'qbytes.dq@gmail.com',
        'supabase-auth',
        'davidq',
        true,
        now(),
        now(),
        '01K2GFSJ0Y0000000000000054',
        '01K2GFSJ0Y0000000000000054'
    )
ON CONFLICT (key) DO UPDATE SET
    "displayName" = EXCLUDED."displayName",
    email = EXCLUDED.email,
    "authProvider" = EXCLUDED."authProvider",
    "authProviderUserId" = EXCLUDED."authProviderUserId",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = now(),
    "updatedBy" = EXCLUDED."updatedBy";

DO $$
DECLARE
    missing_role_slugs text;
BEGIN
    SELECT string_agg(required_roles.role_slug, ', ')
    INTO missing_role_slugs
    FROM (
        VALUES
            ('admin'),
            ('creator'),
            ('guest')
    ) AS required_roles(role_slug)
    LEFT JOIN roles ON roles."roleSlug" = required_roles.role_slug
    WHERE roles.key IS NULL;

    IF missing_role_slugs IS NOT NULL THEN
        RAISE EXCEPTION 'Missing required role rows for DEV user_roles seed: %. Create roles through the server/API seed layer before running account DML.', missing_role_slugs;
    END IF;
END $$;

WITH user_role_seed (user_role_key, user_key, role_slug) AS (
    VALUES
        ('01K2GFSJ0Y0000000000000082', '01K2GFSJ0Y0000000000000051', 'creator'),
        ('01K2GFSJ0Y0000000000000083', '01K2GFSJ0Y0000000000000052', 'creator'),
        ('01K2GFSJ0Y0000000000000084', '01K2GFSJ0Y0000000000000053', 'creator'),
        ('01K2GFSJ0Y0000000000000085', '01K2GFSJ0Y0000000000000054', 'creator'),
        ('01K2GFSJ0Y0000000000000086', '01K2GFSJ0Y0000000000000054', 'admin')
),
resolved_user_roles AS (
    SELECT
        user_role_seed.user_role_key,
        user_role_seed.user_key,
        roles.key AS role_key
    FROM user_role_seed
    JOIN roles ON roles."roleSlug" = user_role_seed.role_slug
)
INSERT INTO user_roles (
    key,
    "userKey",
    "roleKey",
    "createdAt",
    "updatedAt",
    "createdBy",
    "updatedBy"
)
SELECT
    resolved_user_roles.user_role_key,
    resolved_user_roles.user_key,
    resolved_user_roles.role_key,
    now(),
    now(),
    '01K2GFSJ0Y0000000000000054',
    '01K2GFSJ0Y0000000000000054'
FROM resolved_user_roles
ON CONFLICT (key) DO UPDATE SET
    "userKey" = EXCLUDED."userKey",
    "roleKey" = EXCLUDED."roleKey",
    "updatedAt" = now(),
    "updatedBy" = EXCLUDED."updatedBy";
