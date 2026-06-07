function devRuntimeAllowed() {
  const host = window.location.hostname;
  return window.GameFoundryDevRuntime?.enabled === true ||
    window.location.protocol === "file:" ||
    host === "localhost" ||
    host === "127.0.0.1";
}

function localModeSelected() {
  try {
    const request = new XMLHttpRequest();
    request.open("GET", "/api/session/current", false);
    request.setRequestHeader("Accept", "application/json");
    request.send(null);
    const payload = request.responseText ? JSON.parse(request.responseText) : null;
    return request.status >= 200 && request.status < 300 && payload?.data?.mode === "local-mem";
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
    showGatewayStatus("Local Mem DB is available only in the local dev runtime.");
    return;
  }
  if (!localModeSelected()) {
    showGatewayStatus("Local Mem DB Viewer is available only in Local Mem mode.");
    return;
  }
  const module = await import("../src/engine/api/mock-db-viewer-ui.js");
  module.startMockDbViewer(document);
}

loadLocalDbViewer().catch((error) => {
  console.error("Unable to load Local Mem DB viewer.", error);
});
