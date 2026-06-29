const ADMIN_NAVIGATION_ITEMS = Object.freeze([
  Object.freeze({ disabled: true, label: "Admin Tools", planned: false }),
  Object.freeze({ label: "Analytics", path: "admin/analytics.html", route: "admin-analytics" }),
  Object.freeze({ label: "Controls", path: "admin/controls.html", route: "admin-controls" }),
  Object.freeze({ label: "Creators", path: "admin/users.html", route: "admin-users" }),
  Object.freeze({ label: "DB Viewer", path: "admin/db-viewer.html", route: "admin-db-viewer" }),
  Object.freeze({ label: "Environments", path: "admin/environments.html", route: "admin-environments" }),
  Object.freeze({ label: "Game Migration", path: "admin/game-migration.html", route: "admin-game-migration" }),
  Object.freeze({ label: "Infrastructure", path: "admin/infrastructure.html", route: "admin-infrastructure" }),
  Object.freeze({ label: "Invites", path: "admin/invitations.html", route: "admin-invitations" }),
  Object.freeze({ label: "Moderation", path: "admin/moderation.html", route: "admin-moderation" }),
  Object.freeze({ label: "Operations", path: "admin/operations.html", route: "admin-operations" }),
  Object.freeze({ label: "Platform Settings", path: "admin/platform-settings.html", route: "admin-platform-settings" }),
  Object.freeze({ label: "Ratings", path: "admin/ratings.html", route: "admin-ratings" }),
  Object.freeze({ label: "Responsibilities", path: "admin/roles.html", route: "admin-roles" }),
  Object.freeze({ label: "Site Setup", path: "admin/site-setup.html", route: "admin-site-setup" }),
  Object.freeze({ label: "System Health", path: "admin/system-health.html", route: "admin-system-health" }),
  Object.freeze({ label: "Tool Votes", path: "admin/tool-votes.html", route: "admin-tool-votes" }),
]);

const OWNER_NAVIGATION_ITEMS = Object.freeze([
  Object.freeze({ disabled: true, label: "Owner Tools", planned: false }),
  Object.freeze({ label: "AI Credits", path: "owner/ai-credits.html", route: "owner-ai-credits" }),
  Object.freeze({ label: "Branding", path: "owner/branding.html", route: "owner-branding" }),
  Object.freeze({ label: "Design System", path: "owner/design-system.html", route: "owner-design-system" }),
  Object.freeze({ label: "Grouping Colors", path: "owner/grouping-colors.html", route: "owner-grouping-colors" }),
  Object.freeze({ disabled: true, label: "Legal", planned: true }),
  Object.freeze({ label: "Memberships", path: "owner/memberships.html", route: "owner-memberships" }),
  Object.freeze({ disabled: true, label: "Marketplace Settings", planned: true }),
  Object.freeze({ label: "Notes", path: "owner/notes.html", route: "owner-notes" }),
  Object.freeze({ disabled: true, label: "Revenue", planned: true }),
  Object.freeze({ label: "Site Settings", path: "owner/site-settings.html", route: "owner-site-settings" }),
  Object.freeze({ label: "Themes", path: "owner/themes.html", route: "owner-themes" }),
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
