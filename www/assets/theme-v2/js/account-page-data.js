import { requestCurrentSession } from "./account-auth-service.js";

const ACCOUNT_DATA_FAILURE_MESSAGE = "Account data is unavailable. Please try again later.";

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
  return Array.from(document.querySelectorAll("[data-account-page]"));
}

function setStatus(root, message) {
  const status = root.querySelector("[data-account-status]");
  if (status) {
    status.textContent = message;
  }
}

function clearContent(root) {
  const content = root.querySelector("[data-account-content]");
  if (content) {
    content.replaceChildren();
  }
  return content;
}

function accountAccess(session) {
  const roles = Array.isArray(session?.roleSlugs) ? session.roleSlugs : [];
  return roles.length ? roles.map(titleCase).join(", ") : "Account";
}

function renderTable(parent, caption, rows, tableName) {
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";
  const table = document.createElement("table");
  table.className = "data-table";
  table.dataset.accountTable = tableName;

  const captionElement = document.createElement("caption");
  captionElement.textContent = caption;
  table.append(captionElement);

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["Field", "Value"].forEach((header) => {
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
}

function renderFollowUp(parent, tableName, title, reason, action) {
  const article = document.createElement("article");
  article.className = "callout";
  article.dataset.accountFollowUp = tableName;

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

function renderAccountContext(parent, session) {
  renderTable(parent, "Current Account", [
    ["Display Name", session?.displayName || session?.label || "Account"],
    ["Account Key", session?.userKey || session?.id || "N/A"],
    ["Access", accountAccess(session)],
    ["Account State", session?.authenticated ? "Signed in" : "Signed out"],
  ], "current-account");
}

function renderAccountHome(root, session) {
  const content = clearContent(root);
  renderAccountContext(content, session);
  setStatus(root, "Loaded account summary from the account service.");
}

function renderAccountProfile(root, session) {
  const content = clearContent(root);
  renderAccountContext(content, session);
  setStatus(root, "Loaded profile identity from the account service.");
}

function renderAccountPreferences(root, session) {
  const content = clearContent(root);
  renderAccountContext(content, session);
  renderFollowUp(
    content,
    "account-preferences",
    "Preferences Service",
    "Account preferences are not available yet.",
    "A future account service update is required before this page can save preferences.",
  );
  setStatus(root, "Loaded current account. Preferences storage is not available yet.");
}

function renderAccountSecurity(root, session) {
  const content = clearContent(root);
  renderAccountContext(content, session);
  renderFollowUp(
    content,
    "account-security",
    "Security Service",
    "Account security settings are not available yet.",
    "A future account service update is required before this page can show live security controls.",
  );
  setStatus(root, "Loaded current account. Security settings are not available yet.");
}

const RENDERERS = Object.freeze({
  home: renderAccountHome,
  preferences: renderAccountPreferences,
  profile: renderAccountProfile,
  security: renderAccountSecurity,
});

async function renderRoot(root) {
  const renderer = RENDERERS[root.dataset.accountPage || ""];
  if (!renderer) {
    return;
  }
  try {
    const session = await requestCurrentSession(ACCOUNT_DATA_FAILURE_MESSAGE);
    if (!session?.authenticated) {
      throw new Error("Sign in to view account details.");
    }
    renderer(root, session);
  } catch (error) {
    console.warn("[account/operator] Account data service unavailable:", error instanceof Error ? error.message : String(error || ""));
    clearContent(root);
    setStatus(root, ACCOUNT_DATA_FAILURE_MESSAGE);
  }
}

function renderAll() {
  pageRoots().forEach((root) => {
    renderRoot(root);
  });
}

window.addEventListener("gamefoundry:session-user-changed", renderAll);
renderAll();
