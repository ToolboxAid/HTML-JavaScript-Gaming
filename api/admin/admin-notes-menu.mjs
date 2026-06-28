import path from "node:path";

export const ADMIN_NOTES_LOCAL_VIEWER_PATH = "/admin/admin-notes.html";
export const ADMIN_NOTES_LOCAL_SOURCE_PATH = "/src/dev-runtime/admin/notes.html";
export const ADMIN_NOTES_LOCAL_MENU_LABEL = "Notes";
export const ADMIN_MY_STUFF_MENU_LABEL = "My Stuff";

const HEADER_PARTIAL_PATH = "www/assets/theme-v2/partials/header-nav.html";
const LOCAL_HEADER_PARTIAL_PATH = "src/dev-runtime/admin/header-nav.local.html";

function repoRelativePath(repoRoot, targetPath) {
  return path.relative(repoRoot, targetPath).replaceAll(path.sep, "/");
}

export function localAdminNotesHeaderPartialPath(repoRoot, targetPath) {
  if (repoRelativePath(repoRoot, targetPath) !== HEADER_PARTIAL_PATH) {
    return targetPath;
  }
  return path.join(repoRoot, LOCAL_HEADER_PARTIAL_PATH);
}
