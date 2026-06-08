import path from "node:path";

export const ADMIN_NOTES_LOCAL_VIEWER_PATH = "/src/dev-runtime/admin/admin-notes.html";
export const ADMIN_NOTES_LOCAL_MENU_LABEL = "Admin Notes (Local Dev)";

const HEADER_PARTIAL_PATH = "assets/theme-v2/partials/header-nav.html";
const INSERT_BEFORE = '          <a data-nav-link data-route="admin-analytics" href="admin/analytics.html">Analytics</a>';
const LOCAL_MENU_LINK = `          <a data-nav-link data-admin-notes-local-menu href="${ADMIN_NOTES_LOCAL_VIEWER_PATH}">${ADMIN_NOTES_LOCAL_MENU_LABEL}</a>`;

function repoRelativePath(repoRoot, targetPath) {
  return path.relative(repoRoot, targetPath).replaceAll(path.sep, "/");
}

export function localAdminNotesMenuContent(repoRoot, targetPath, fileContents) {
  if (repoRelativePath(repoRoot, targetPath) !== HEADER_PARTIAL_PATH) {
    return fileContents;
  }
  const source = fileContents.toString("utf8");
  if (source.includes("data-admin-notes-local-menu")) {
    return fileContents;
  }
  if (!source.includes(INSERT_BEFORE)) {
    return fileContents;
  }
  return Buffer.from(source.replace(INSERT_BEFORE, `${LOCAL_MENU_LINK}\n${INSERT_BEFORE}`), "utf8");
}
