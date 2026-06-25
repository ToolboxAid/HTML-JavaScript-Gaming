import {
  requireServerApiData,
  safeRequestServerApi,
} from "./server-api-client.js";

export const AUTH_PROVIDER_CONTRACT_OPERATIONS = Object.freeze([
  "getCurrentUser",
  "signIn",
  "signOut",
  "requireRole",
]);

function requireSessionApiData(response, context) {
  return requireServerApiData(response, context, {
    restoreMessage: "Restore the server auth/session API.",
  });
}

export function getSessionCurrent() {
  return requireSessionApiData(safeRequestServerApi("/session/current"), "Current session");
}

export function getCurrentUser() {
  return getSessionCurrent();
}

export function getSessionModes() {
  return requireSessionApiData(safeRequestServerApi("/session/modes"), "Session modes");
}

export function getSessionUsers() {
  return requireSessionApiData(safeRequestServerApi("/session/users"), "Session users");
}

export function setSessionMode(modeId) {
  return requireSessionApiData(safeRequestServerApi("/session/mode", {
    body: { modeId },
    method: "POST",
  }), "Session mode update");
}

export function setSessionUser(userKey) {
  return requireSessionApiData(safeRequestServerApi("/session/user", {
    body: { userKey },
    method: "POST",
  }), "Session user update");
}

export function signIn(options = {}) {
  return setSessionUser(options.userKey || "");
}

export function logoutSessionUser() {
  return requireSessionApiData(safeRequestServerApi("/session/logout", { method: "POST" }), "Session logout");
}

export function signOut() {
  return logoutSessionUser();
}

export function requireRole(role, session = getCurrentUser()) {
  const requiredRole = String(role || "").trim();
  if (!requiredRole) {
    return {
      allowed: false,
      diagnostic: "Auth role check requires a role.",
      role: "",
      session,
    };
  }
  const roleSlugs = Array.isArray(session?.roleSlugs) ? session.roleSlugs : [];
  const allowed = Boolean(session?.authenticated && roleSlugs.includes(requiredRole));
  return {
    allowed,
    diagnostic: allowed ? "" : `Sign in with the ${requiredRole} role to continue.`,
    role: requiredRole,
    session,
  };
}
