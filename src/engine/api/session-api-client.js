import { safeRequestServerApi } from "./server-api-client.js";

function unwrap(response, fallback) {
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.payload?.data || fallback;
}

export function getSessionCurrent() {
  return unwrap(safeRequestServerApi("/session/current"), {
    authenticated: false,
    diagnostic: "Server session API is unavailable.",
    displayName: "Login",
    mode: "local",
    roleSlugs: [],
    userKey: null,
  });
}

export function getSessionModes() {
  return unwrap(safeRequestServerApi("/session/modes"), []);
}

export function getSessionUsers() {
  return unwrap(safeRequestServerApi("/session/users"), []);
}

export function setSessionMode(modeId) {
  return unwrap(safeRequestServerApi("/session/mode", {
    body: { modeId },
    method: "POST",
  }), {});
}

export function setSessionUser(userKey) {
  return unwrap(safeRequestServerApi("/session/user", {
    body: { userKey },
    method: "POST",
  }), {});
}

export function logoutSessionUser() {
  return unwrap(safeRequestServerApi("/session/logout", { method: "POST" }), {});
}
