import { safeRequestServerApi } from "../../../src/engine/api/server-api-client.js";

const fields = {
  api: document.querySelector("[data-admin-db-status-api]"),
  currentUrl: document.querySelector("[data-admin-db-status-current-url]"),
  endpoint: document.querySelector("[data-admin-db-status-endpoint]"),
  serverMode: document.querySelector("[data-admin-db-status-server-mode]"),
  setupEndpoint: document.querySelector("[data-admin-db-status-setup-endpoint]"),
};

function setText(field, value) {
  if (field) {
    field.textContent = value;
  }
}

function renderAdminDbStatus() {
  setText(fields.currentUrl, window.location.href);
  setText(fields.endpoint, "/api/session/current");
  setText(fields.setupEndpoint, "/api/admin/setup/reseed");

  const sessionResponse = safeRequestServerApi("/session/current");
  if (!sessionResponse.ok) {
    setText(fields.serverMode, "FAIL: Local API unavailable.");
    setText(fields.api, `FAIL: ${sessionResponse.error}`);
    return;
  }

  const session = sessionResponse.payload?.data || {};
  const mode = session.mode || "unknown";
  const persistence = session.persistence || "unknown persistence";
  setText(fields.serverMode, `PASS: ${mode} (${persistence}).`);
  setText(fields.api, "PASS: /api/session/current responded.");
}

renderAdminDbStatus();
