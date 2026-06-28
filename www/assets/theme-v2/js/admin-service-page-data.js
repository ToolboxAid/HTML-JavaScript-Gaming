import { getDbViewerSnapshot } from "../../../../src/api/db-viewer-api-client.js";

const SERVICE_START_ACTION = "Start the API-backed server, then reload this page.";

function text(value) {
  if (value === undefined || value === null || value === "") {
    return "N/A";
  }
  return String(value);
}

function pageRoots() {
  return Array.from(document.querySelectorAll("[data-admin-service-page]"));
}

function statusElement(root) {
  return root.querySelector("[data-admin-service-status]");
}

function contentElement(root) {
  return root.querySelector("[data-admin-service-content]");
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
    throw new Error(`Service table ${tableName} is missing. ${SERVICE_START_ACTION}`);
  }
  return rows;
}

function tableSchema(snapshot, tableName) {
  const schema = snapshot?.schemas?.[tableName];
  if (!Array.isArray(schema)) {
    throw new Error(`Service schema ${tableName} is missing. ${SERVICE_START_ACTION}`);
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

function responsibilitiesForCreator(identity, userKey) {
  return identity.userRoles
    .filter((row) => row.userKey === userKey)
    .map((row) => identity.rolesByKey.get(row.roleKey)?.name || row.roleKey)
    .filter(Boolean);
}

function creatorsForResponsibility(identity, roleKey) {
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
  table.dataset.adminServiceTable = options.tableName || caption;

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
  status.dataset.adminServiceAudit = "";
  status.textContent = message;
  parent.append(status);
}

function renderFollowUp(parent, title, tableName, reason, action) {
  const article = document.createElement("article");
  article.className = "callout";
  article.dataset.adminServiceFollowUp = tableName;

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

function renderAdminCreators(root, snapshot) {
  const content = clearContent(root);
  const identity = identityState(snapshot);
  const rows = identity.users.map((user) => [
    user.displayName,
    user.key,
    user.email,
    responsibilitiesForCreator(identity, user.key).join(", ") || "N/A",
    user.isActive === false ? "Inactive" : "Active",
    user.updatedAt,
  ]);
  renderTable(content, "Account Creators", [
    "Creator",
    "users.key",
    "Email",
    "Responsibilities",
    "Account State",
    "Updated",
  ], rows, { tableName: "users" });
  renderAudit(content, auditMessage("creator", identity.users, identity.usersByKey));
  setStatus(root, `Loaded ${identity.users.length} creators from the account service.`);
}

function renderAdminResponsibilities(root, snapshot) {
  const content = clearContent(root);
  const identity = identityState(snapshot);
  const rows = identity.roles.map((role) => [
    role.name,
    role.key,
    role.description,
    role.isActive === false ? "Inactive" : "Active",
    creatorsForResponsibility(identity, role.key).join(", ") || "N/A",
  ]);
  renderTable(content, "Account Responsibilities", [
    "Responsibility",
    "roles.key",
    "Description",
    "State",
    "Assigned Creators",
  ], rows, { tableName: "roles" });
  renderAudit(content, auditMessage("responsibility", identity.roles, identity.usersByKey));
  renderAudit(content, auditMessage("user_roles", identity.userRoles, identity.usersByKey));
  setStatus(root, `Loaded ${identity.roles.length} responsibilities and ${identity.userRoles.length} creator-responsibility assignments.`);
}

function renderAdminSiteSettings(root, snapshot) {
  const content = clearContent(root);
  identityState(snapshot);
  setStatus(root, "Account identity records loaded. Site Settings runtime table is not configured yet.");
  renderFollowUp(
    content,
    "Site Settings Service Contract",
    "site_settings",
    "Editable branding and site identity settings are code/content-owned and deferred from this Owner surface.",
    "Use Admin Operations for operational planning. Keep Platform Settings focused on banner settings and future runtime toggles.",
  );
}

const RENDERERS = Object.freeze({
  "admin-roles": renderAdminResponsibilities,
  "owner-site-settings": renderAdminSiteSettings,
  "admin-users": renderAdminCreators,
});

function renderFailure(root, error) {
  clearContent(root);
  const content = contentElement(root);
  const message = error instanceof Error ? error.message : String(error || "Account service data unavailable.");
  setStatus(root, `Account service unavailable: ${message}`);
  if (content) {
    renderFollowUp(
      content,
      "Service Configuration",
      "service",
      message,
      SERVICE_START_ACTION,
    );
  }
}

function renderRoot(root) {
  const page = root.dataset.adminServicePage || "";
  const renderer = RENDERERS[page];
  if (!renderer) {
    return;
  }
  try {
    const snapshot = getDbViewerSnapshot();
    renderer(root, snapshot);
  } catch (error) {
    renderFailure(root, error);
  }
}

function renderAll() {
  pageRoots().forEach(renderRoot);
}

window.addEventListener("gamefoundry:session-user-changed", renderAll);
window.addEventListener("gamefoundry:data-changed", renderAll);

renderAll();
