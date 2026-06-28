import { getSessionCurrent } from "../../src/api/session-api-client.js";

function devRuntimeAllowed() {
  const host = window.location.hostname;
  return window.GameFoundryDevRuntime?.enabled === true ||
    window.location.protocol === "file:" ||
    host === "localhost" ||
    host === "127.0.0.1";
}

function currentSession() {
  try {
    return getSessionCurrent();
  } catch (error) {
    const diagnostic = error instanceof Error ? error.message : String(error || "Unable to read current DB Viewer session.");
    console.warn("[admin/operator] DB Viewer session unavailable:", diagnostic);
    return {
      diagnostic: "Sign in with an admin account to open DB Viewer.",
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

async function loadDbViewer() {
  if (window.GameFoundrySessionGuard?.blocked) {
    return;
  }
  if (!devRuntimeAllowed()) {
    showGatewayStatus("DB Viewer is available only in the approved admin runtime.");
    return;
  }
  const session = currentSession();
  if (!session.authenticated) {
    showGatewayStatus(session.diagnostic || "Sign in with an admin account to open DB Viewer.");
    return;
  }
  const module = await import("../../src/api/db-viewer-ui.js");
  module.startDbViewer(document, { session });
}

loadDbViewer().catch((error) => {
  console.error("Unable to load DB Viewer.", error);
});
