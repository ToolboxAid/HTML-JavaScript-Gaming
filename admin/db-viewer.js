function devRuntimeAllowed() {
  const host = window.location.hostname;
  return window.GameFoundryDevRuntime?.enabled === true ||
    window.location.protocol === "file:" ||
    host === "localhost" ||
    host === "127.0.0.1";
}

function currentSession() {
  try {
    const provider = window.GameFoundryAuthProvider;
    if (!provider || typeof provider.getCurrentUser !== "function") {
      return {
        diagnostic: "Auth provider contract unavailable. Restore the sign-in/session provider before opening DB Viewer.",
        mode: "",
      };
    }
    return provider.getCurrentUser();
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
  if (!session.authenticated) {
    showGatewayStatus(session.diagnostic || "Sign in with an admin account to open DB Viewer.");
    return;
  }
  const module = await import("../src/engine/api/local-db-viewer-ui.js");
  module.startLocalDbViewer(document, { session });
}

loadLocalDbViewer().catch((error) => {
  console.error("Unable to load DB Viewer.", error);
});
