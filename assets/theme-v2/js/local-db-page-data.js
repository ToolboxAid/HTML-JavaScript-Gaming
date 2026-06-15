import { getLocalDbSnapshot } from "../../../src/engine/api/local-db-api-client.js";
import { getSessionCurrent } from "../../../src/engine/api/session-api-client.js";

const LOCAL_DB_START_ACTION = "Start the API-backed local server with npm run dev:local-api, then reload this page.";

function text(value) {
  if (value === undefined || value === null || value === "") {
    return "N/A";
  }
  return String(value);
}

function titleCase(value) {
  return text(value).replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function pageRoots() {
  return Array.from(document.querySelectorAll("[data-local-db-page]"));
}

function statusElement(root) {
  return root.querySelector("[data-local-db-status]");
}

function contentElement(root) {
  return root.querySelector("[data-local-db-content]");
}

function setStatus(root, message) {
  const status = statusElement(root);
  if (status) {
    status.textContent = message;
  }
}

function clearContent(root) {
  const content = contentElement(root);
  if (content) {
    content.replaceChildren();
  }
  return content;
}

function tableRows(snapshot, tableName) {
  const rows = snapshot?.tables?.[tableName];
  if (!Array.isArray(rows)) {
    throw new Error(`Local DB table ${tableName} is missing. ${LOCAL_DB_START_ACTION}`);
  }
  return rows;
}

function tableSchema(snapshot, tableName) {
  const schema = snapshot?.schemas?.[tableName];
  if (!Array.isArray(schema)) {
    throw new Error(`Local DB schema ${tableName} is missing. ${LOCAL_DB_START_ACTION}`);
  }
  return schema;
}

function identityState(snapshot) {
  const users = tableRows(snapshot, "users");
  const roles = tableRows(snapshot, "roles");
  const userRoles = tableRows(snapshot, "user_roles");
  tableSchema(snapshot, "users");
  tableSchema(snapshot, "roles");
  tableSchema(snapshot, "user_roles");
  const usersByKey = new Map(users.map((user) => [user.key, user]));
  const rolesByKey = new Map(roles.map((role) => [role.key, role]));
  return {
    roles,
    rolesByKey,
    userRoles,
    users,
    usersByKey,
  };
}

function rolesForUser(identity, userKey) {
  return identity.userRoles
    .filter((row) => row.userKey === userKey)
    .map((row) => identity.rolesByKey.get(row.roleKey)?.name || row.roleKey)
    .filter(Boolean);
}

function assignedUsersForRole(identity, roleKey) {
  return identity.userRoles
    .filter((row) => row.roleKey === roleKey)
    .map((row) => identity.usersByKey.get(row.userKey)?.displayName || row.userKey)
    .filter(Boolean);
}

function missingAuditFields(rows, usersByKey) {
  const requiredFields = ["key", "createdAt", "updatedAt", "createdBy", "updatedBy"];
  return rows.filter((row) =>
    requiredFields.some((field) => !row[field]) ||
    !usersByKey.has(row.createdBy) ||
    !usersByKey.has(row.updatedBy)
  );
}

function auditMessage(label, rows, usersByKey) {
  const missing = missingAuditFields(rows, usersByKey);
  return missing.length
    ? `Audit WARN: ${missing.length} ${label} record(s) are missing key/audit fields or users.key ownership references.`
    : `Audit PASS: ${rows.length} ${label} record(s) include key, createdAt, updatedAt, createdBy, and updatedBy fields tied to users.key.`;
}

function renderTable(parent, caption, headers, rows, options = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";
  const table = document.createElement("table");
  table.className = "data-table";
  table.dataset.localDbTable = options.tableName || caption;

  const captionElement = document.createElement("caption");
  captionElement.textContent = caption;
  table.append(captionElement);

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headers.forEach((header) => {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = header;
    headerRow.append(cell);
  });
  thead.append(headerRow);
  table.append(thead);

  const tbody = document.createElement("tbody");
  rows.forEach((row) => {
    const tableRow = document.createElement("tr");
    row.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = text(value);
      tableRow.append(cell);
    });
    tbody.append(tableRow);
  });
  table.append(tbody);
  wrapper.append(table);
  parent.append(wrapper);
  return table;
}

function renderAudit(parent, message) {
  const status = document.createElement("p");
  status.className = "status";
  status.dataset.localDbAudit = "";
  status.textContent = message;
  parent.append(status);
}

function renderFollowUp(parent, title, tableName, reason, action) {
  const article = document.createElement("article");
  article.className = "callout";
  article.dataset.localDbFollowUp = tableName;

  const heading = document.createElement("h3");
  heading.textContent = title;
  const status = document.createElement("p");
  status.className = "status";
  status.textContent = `FOLLOW-UP REQUIRED: ${reason}`;
  const nextAction = document.createElement("p");
  nextAction.textContent = action;

  article.append(heading, status, nextAction);
  parent.append(article);
}

function renderUserContext(parent, identity, session) {
  const currentUser = identity.usersByKey.get(session.userKey || session.sessionUser?.id || "");
  const roles = currentUser ? rolesForUser(identity, currentUser.key) : [];
  renderTable(parent, "Current Local DB User", [
    "Field",
    "Value",
  ], [
    ["users.key", currentUser?.key || session.userKey || "N/A"],
    ["Display Name", currentUser?.displayName || session.label || "N/A"],
    ["Email", currentUser?.email || "N/A"],
    ["Roles", roles.length ? roles.join(", ") : "N/A"],
    ["Account State", currentUser?.isActive === false ? "Inactive" : "Active"],
  ], { tableName: "current-user" });
}

function renderAdminUsers(root, snapshot) {
  const content = clearContent(root);
  const identity = identityState(snapshot);
  const rows = identity.users.map((user) => [
    user.displayName,
    user.key,
    user.email,
    rolesForUser(identity, user.key).join(", ") || "N/A",
    user.isActive === false ? "Inactive" : "Active",
    user.updatedAt,
  ]);
  renderTable(content, "Local DB Users", [
    "User",
    "users.key",
    "Email",
    "Roles",
    "Account State",
    "Updated",
  ], rows, { tableName: "users" });
  renderAudit(content, auditMessage("user", identity.users, identity.usersByKey));
  setStatus(root, `Loaded ${identity.users.length} Local DB users from users, roles, and user_roles.`);
}

function renderAdminRoles(root, snapshot) {
  const content = clearContent(root);
  const identity = identityState(snapshot);
  const rows = identity.roles.map((role) => [
    role.name,
    role.key,
    role.description,
    role.isActive === false ? "Inactive" : "Active",
    assignedUsersForRole(identity, role.key).join(", ") || "N/A",
  ]);
  renderTable(content, "Local DB Roles", [
    "Role",
    "roles.key",
    "Description",
    "State",
    "Assigned Users",
  ], rows, { tableName: "roles" });
  renderAudit(content, auditMessage("role", identity.roles, identity.usersByKey));
  renderAudit(content, auditMessage("user_roles", identity.userRoles, identity.usersByKey));
  setStatus(root, `Loaded ${identity.roles.length} Local DB roles and ${identity.userRoles.length} user-role assignments.`);
}

function renderAdminSiteSettings(root, snapshot) {
  const content = clearContent(root);
  identityState(snapshot);
  setStatus(root, "Local DB identity records loaded. Site Settings runtime table is not configured yet.");
  renderFollowUp(
    content,
    "Site Settings Local DB Contract",
    "site_settings",
    "No site_settings table/schema exists in the current Local DB snapshot.",
    "Create the Admin Site Setup runtime contract before this page can edit or save site-owned settings.",
  );
}

function renderAccountHome(root, snapshot, session) {
  const content = clearContent(root);
  const identity = identityState(snapshot);
  renderUserContext(content, identity, session);
  renderAudit(content, auditMessage("current identity", identity.users, identity.usersByKey));
  setStatus(root, "Loaded account summary from Local DB users, roles, and user_roles.");
}

function renderAccountProfile(root, snapshot, session) {
  const content = clearContent(root);
  const identity = identityState(snapshot);
  renderUserContext(content, identity, session);
  setStatus(root, "Loaded profile identity from Local DB users and user_roles.");
}

function renderAccountPreferences(root, snapshot, session) {
  const content = clearContent(root);
  const identity = identityState(snapshot);
  renderUserContext(content, identity, session);
  renderFollowUp(
    content,
    "Preferences Local DB Contract",
    "account_preferences",
    "No account_preferences table/schema exists for user-owned preferences.",
    "Add a user-owned preferences table with key/audit fields before this page can save preferences.",
  );
  setStatus(root, "Loaded current Local DB user. Preferences storage requires a future account_preferences table.");
}

function renderAccountSecurity(root, snapshot, session) {
  const content = clearContent(root);
  const identity = identityState(snapshot);
  renderUserContext(content, identity, session);
  renderFollowUp(
    content,
    "Security Local DB Contract",
    "account_security_settings",
    "No account_security_settings table/schema exists for user-owned security settings.",
    "Add an auth-provider-backed security contract before this page can show live security controls.",
  );
  setStatus(root, "Loaded current Local DB user. Security settings require a future provider-backed account security table.");
}

const RENDERERS = Object.freeze({
  "account-home": renderAccountHome,
  "account-preferences": renderAccountPreferences,
  "account-profile": renderAccountProfile,
  "account-security": renderAccountSecurity,
  "admin-roles": renderAdminRoles,
  "admin-site-settings": renderAdminSiteSettings,
  "admin-users": renderAdminUsers,
});

function renderFailure(root, error) {
  clearContent(root);
  const content = contentElement(root);
  const message = error instanceof Error ? error.message : String(error || "Local DB data unavailable.");
  setStatus(root, `Local DB unavailable: ${message}`);
  if (content) {
    renderFollowUp(
      content,
      "Local DB Configuration",
      "local-db",
      message,
      LOCAL_DB_START_ACTION,
    );
  }
}

function renderRoot(root) {
  const page = root.dataset.localDbPage || "";
  const renderer = RENDERERS[page];
  if (!renderer) {
    return;
  }
  try {
    const snapshot = getLocalDbSnapshot();
    const session = getSessionCurrent();
    renderer(root, snapshot, session);
  } catch (error) {
    renderFailure(root, error);
  }
}

function renderAll() {
  pageRoots().forEach(renderRoot);
}

window.addEventListener("gamefoundry:mock-db-session-user-changed", renderAll);
window.addEventListener("gamefoundry:mock-db-session-mode-changed", renderAll);
window.addEventListener("gamefoundry:mock-db-changed", renderAll);

renderAll();
