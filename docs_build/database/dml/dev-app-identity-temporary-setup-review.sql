-- TEMPORARY SETUP/REVIEW ARTIFACT
-- DEV review only. Codex may execute DEV database setup only.
-- UAT and production SQL execution is user-controlled.
-- Long-term seed behavior belongs in Admin -> Site Setup, not permanent seed SQL.
-- Target DEV database: gamefoundry_dev

INSERT INTO roles (slug, display_name, description)
VALUES
    ('admin', 'Admin', 'Can manage site configuration and review operational setup.'),
    ('creator', 'Creator', 'Can create and manage games, assets, and publishing workflows.'),
    ('user', 'User', 'Can use signed-in platform features.'),
    ('guest', 'Guest', 'Can explore public and guest-safe areas.')
ON CONFLICT (slug) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = now();
