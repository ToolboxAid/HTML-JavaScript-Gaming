const ADMIN_NAVIGATION_ITEMS = Object.freeze([
  Object.freeze({ label: "Analytics", path: "admin/analytics.html", route: "admin-analytics" }),
  Object.freeze({ label: "Branding", path: "admin/branding.html", route: "admin-branding" }),
  Object.freeze({ label: "Controls", path: "admin/controls.html", route: "admin-controls" }),
  Object.freeze({ label: "DB Viewer", path: "admin/db-viewer.html", route: "admin-db-viewer" }),
  Object.freeze({ label: "Design System", path: "admin/design-system.html", route: "admin-design-system" }),
  Object.freeze({ label: "Environments", path: "admin/environments.html", route: "admin-environments" }),
  Object.freeze({ label: "Game Migration", path: "admin/game-migration.html", route: "admin-game-migration" }),
  Object.freeze({ label: "Grouping Colors", path: "admin/grouping-colors.html", route: "admin-grouping-colors" }),
  Object.freeze({ label: "Infrastructure", path: "admin/infrastructure.html", route: "admin-infrastructure" }),
  Object.freeze({ label: "Invitations", path: "admin/invitations.html", route: "admin-invitations" }),
  Object.freeze({ label: "Moderation", path: "admin/moderation.html", route: "admin-moderation" }),
  Object.freeze({ label: "Operations", path: "admin/operations.html", route: "admin-operations" }),
  Object.freeze({ label: "Platform Settings", path: "admin/platform-settings.html", route: "admin-platform-settings" }),
  Object.freeze({ label: "Ratings", path: "admin/ratings.html", route: "admin-ratings" }),
  Object.freeze({ label: "Roles", path: "admin/roles.html", route: "admin-roles" }),
  Object.freeze({ label: "Site Settings", path: "admin/site-settings.html", route: "admin-site-settings" }),
  Object.freeze({ label: "Site Setup", path: "admin/site-setup.html", route: "admin-site-setup" }),
  Object.freeze({ label: "System Health", path: "admin/system-health.html", route: "admin-system-health" }),
  Object.freeze({ label: "Themes", path: "admin/themes.html", route: "admin-themes" }),
  Object.freeze({ label: "Tool Votes", path: "admin/tool-votes.html", route: "admin-tool-votes" }),
  Object.freeze({ label: "Users", path: "admin/users.html", route: "admin-users" }),
]);

const OWNER_NAVIGATION_ITEMS = Object.freeze([
  Object.freeze({ label: "AI Credits", path: "owner/ai-credits.html", route: "owner-ai-credits" }),
  Object.freeze({ label: "Branding", path: "admin/branding.html", route: "admin-branding" }),
  Object.freeze({ label: "DB Viewer", path: "admin/db-viewer.html", route: "admin-db-viewer" }),
  Object.freeze({ label: "Design System", path: "admin/design-system.html", route: "admin-design-system" }),
  Object.freeze({ label: "Grouping Colors", path: "admin/grouping-colors.html", route: "admin-grouping-colors" }),
  Object.freeze({ label: "Memberships", path: "owner/memberships.html", route: "owner-memberships" }),
]);

function cloneItems(items) {
  return items.map((item) => ({ ...item }));
}

export function getAdminNavigationItems() {
  return cloneItems(ADMIN_NAVIGATION_ITEMS);
}

export function getOwnerNavigationItems() {
  return cloneItems(OWNER_NAVIGATION_ITEMS);
}
