function devRuntimeAllowed() {
  const host = window.location.hostname;
  return window.GameFoundryDevRuntime?.enabled === true ||
    window.location.protocol === "file:" ||
    host === "localhost" ||
    host === "127.0.0.1";
}

function currentSession() {
  try {
    const request = new XMLHttpRequest();
    request.open("GET", "/api/session/current", false);
    request.setRequestHeader("Accept", "application/json");
    request.send(null);
    const payload = request.responseText ? JSON.parse(request.responseText) : null;
    if (request.status >= 200 && request.status < 300 && payload?.data) {
      return payload.data;
    }
    return {
      diagnostic: payload?.error || "Unable to read current DB Viewer session from the server API.",
      mode: "",
    };
  } catch (error) {
    return {
      diagnostic: error instanceof Error ? error.message : String(error || "Unable to read current DB Viewer session."),
      mode: "",
    };
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
    showGatewayStatus("DB Viewer is available only in the local dev runtime.");
    return;
  }
  const session = currentSession();
  if (session.mode !== "local-mem" && session.mode !== "local-db") {
    showGatewayStatus(session.diagnostic || "DB Viewer is available only in Local Mem or Local DB mode.");
    return;
  }
  const module = await import("../src/engine/api/mock-db-viewer-ui.js");
  module.startMockDbViewer(document, { session });
}

loadLocalDbViewer().catch((error) => {
  console.error("Unable to load DB Viewer.", error);
});
