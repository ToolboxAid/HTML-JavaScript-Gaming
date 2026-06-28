import { safeRequestServerApi } from "../../../../src/api/server-api-client.js";

const fields = {
  api: document.querySelector("[data-admin-db-status-api]"),
  connection: document.querySelector("[data-admin-db-status-connection]"),
  currentUrl: document.querySelector("[data-admin-db-status-current-url]"),
  endpoint: document.querySelector("[data-admin-db-status-endpoint]"),
  serverMode: document.querySelector("[data-admin-db-status-server-mode]"),
  source: document.querySelector("[data-admin-db-status-source]"),
};

function setText(field, value) {
  if (field) {
    field.textContent = value;
  }
}

function renderAdminDbStatus() {
  setText(fields.currentUrl, window.location.href);
  setText(fields.endpoint, "/api/session/current");

  const sessionResponse = safeRequestServerApi("/session/current");
  if (!sessionResponse.ok) {
    setText(fields.serverMode, "FAIL: Session service unavailable.");
    setText(fields.connection, "Unavailable.");
    setText(fields.source, "Unavailable.");
    setText(fields.api, `FAIL: ${sessionResponse.error}`);
    return;
  }

  setText(fields.serverMode, "PASS: Session service responded.");
  setText(fields.connection, "Configured connection.");
  setText(fields.source, "Server API.");
  setText(fields.api, "PASS: /api/session/current responded.");
}

renderAdminDbStatus();
