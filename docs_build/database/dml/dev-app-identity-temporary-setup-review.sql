-- TEMPORARY SETUP/REVIEW ARTIFACT
-- DEV review only. Codex may execute DEV database setup only.
-- UAT and production SQL execution is user-controlled.
-- Long-term seed behavior belongs in Admin -> Site Setup, not permanent seed SQL.
-- Target DEV database: gamefoundry_dev
-- The inactive setup user exists only to satisfy audit ownership references; it is not login behavior.

WITH setup_user AS (
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
    VALUES (
        'dev-setup-user',
        'DEV setup user',
        NULL,
        NULL,
        NULL,
        false,
        now(),
        now(),
        'dev-setup-user',
        'dev-setup-user'
    )
    ON CONFLICT (key) DO UPDATE SET
        "displayName" = EXCLUDED."displayName",
        email = EXCLUDED.email,
        "authProvider" = EXCLUDED."authProvider",
        "authProviderUserId" = EXCLUDED."authProviderUserId",
        "isActive" = EXCLUDED."isActive",
        "updatedAt" = now(),
        "updatedBy" = EXCLUDED."updatedBy"
    RETURNING key
),
role_seed (key, role_slug, name, description, is_system_role, is_active) AS (
    VALUES
        ('role-admin', 'admin', 'Admin', 'Can manage site configuration and review operational setup.', false, true),
        ('role-creator', 'creator', 'Creator', 'Can create and manage games, assets, and publishing workflows.', false, true),
        ('role-user', 'user', 'User', 'Can use signed-in platform features.', false, true),
        ('role-guest', 'guest', 'Guest', 'Can explore public and guest-safe areas.', false, true)
),
upsert_roles AS (
    INSERT INTO roles (
        key,
        "roleSlug",
        name,
        description,
        "isSystemRole",
        "isActive",
        "createdAt",
        "updatedAt",
        "createdBy",
        "updatedBy"
    )
    SELECT
        role_seed.key,
        role_seed.role_slug,
        role_seed.name,
        role_seed.description,
        role_seed.is_system_role,
        role_seed.is_active,
        now(),
        now(),
        setup_user.key,
        setup_user.key
    FROM role_seed
    CROSS JOIN setup_user
    ON CONFLICT (key) DO UPDATE SET
        "roleSlug" = EXCLUDED."roleSlug",
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        "isSystemRole" = EXCLUDED."isSystemRole",
        "isActive" = EXCLUDED."isActive",
        "updatedAt" = now(),
        "updatedBy" = EXCLUDED."updatedBy"
    RETURNING key, "roleSlug"
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
    'dev-setup-user-role-admin',
    setup_user.key,
    upsert_roles.key,
    now(),
    now(),
    setup_user.key,
    setup_user.key
FROM setup_user
JOIN upsert_roles ON upsert_roles."roleSlug" = 'admin'
ON CONFLICT (key) DO UPDATE SET
    "userKey" = EXCLUDED."userKey",
    "roleKey" = EXCLUDED."roleKey",
    "updatedAt" = now(),
    "updatedBy" = EXCLUDED."updatedBy";
