-- Game Foundry Studio DEV database DML / seed review
-- Group: Tags
-- Ownership: docs_build/database/dml/tags.sql
-- Runtime setup/seed operations for this group must run through server-side APIs.
-- Architecture: Browser -> API -> Database.
-- Browser pages must not directly seed authoritative DB records.
-- Owned tables: project_tags, project_tag_assignments
-- Flat tags only: no category table, category UI, grouped category filtering, or category-owned seed data.

-- Starter flat tag seed labels for server/API seeding.
-- These rows use stable DEV seed ULIDs and users.key ownership so database reviewers can inspect the desired baseline.
-- Product runtime create/update/delete still flows through the API.
INSERT INTO project_tags (key, "slug", "label", "description", "active", "createdBy", "updatedBy")
VALUES
  ('01K2GFSJ0Y0000000000007201', 'platformer', 'platformer', 'Platforming, jumping, and movement-focused projects.', true, '01K2GFSJ0Y0000000000000054', '01K2GFSJ0Y0000000000000054'),
  ('01K2GFSJ0Y0000000000007202', 'fantasy', 'fantasy', 'Magic, legends, and fantasy world themes.', true, '01K2GFSJ0Y0000000000000054', '01K2GFSJ0Y0000000000000054'),
  ('01K2GFSJ0Y0000000000007203', 'medium', 'medium', 'Medium-sized project scope.', true, '01K2GFSJ0Y0000000000000054', '01K2GFSJ0Y0000000000000054'),
  ('01K2GFSJ0Y0000000000007204', 'pixel-art', 'pixel-art', 'Pixel art visual direction.', true, '01K2GFSJ0Y0000000000000054', '01K2GFSJ0Y0000000000000054'),
  ('01K2GFSJ0Y0000000000007205', 'kids', 'kids', 'Designed for younger players.', true, '01K2GFSJ0Y0000000000000054', '01K2GFSJ0Y0000000000000054'),
  ('01K2GFSJ0Y0000000000007206', 'boss-fight', 'boss-fight', 'Includes a climactic boss encounter.', true, '01K2GFSJ0Y0000000000000054', '01K2GFSJ0Y0000000000000054')
ON CONFLICT (key) DO UPDATE SET
  "slug" = EXCLUDED."slug",
  "label" = EXCLUDED."label",
  "description" = EXCLUDED."description",
  "active" = EXCLUDED."active",
  "updatedAt" = now(),
  "updatedBy" = EXCLUDED."updatedBy";

-- Project tag assignment seed rows are intentionally empty.
-- Assignments are user/project-specific and must be created through the API.
