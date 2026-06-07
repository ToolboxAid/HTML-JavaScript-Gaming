const MOCK_DB_SESSION_MODE_STORAGE_KEY = "gamefoundry.mockDb.sessionMode.v1";

function devRuntimeAllowed() {
  const host = window.location.hostname;
  return window.GameFoundryDevRuntime?.enabled === true ||
    window.location.protocol === "file:" ||
    host === "localhost" ||
    host === "127.0.0.1";
}

function localModeSelected() {
  try {
    return (window.localStorage.getItem(MOCK_DB_SESSION_MODE_STORAGE_KEY) || "local") === "local";
  } catch {
    return false;
  }
}

function showGatewayStatus(message) {
  const status = document.querySelector("[data-admin-db-status]");
  if (status) {
    status.textContent = message;
  }
}

async function loadLocalDbViewer() {
  if (window.GameFoundrySessionGuard?.blocked) {
    return;
  }
  if (!devRuntimeAllowed()) {
    showGatewayStatus("Mock DB is available only in the local dev runtime.");
    return;
  }
  if (!localModeSelected()) {
    showGatewayStatus("Mock DB is available only in Local mode.");
    return;
  }
  const module = await import("../src/dev-runtime/admin/db-viewer.js");
  module.startDevRuntimeDbViewer(document);
}

loadLocalDbViewer().catch((error) => {
  console.error("Unable to load Local Mock DB viewer.", error);
});
