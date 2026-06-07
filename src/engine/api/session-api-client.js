import { safeRequestServerApi } from "./server-api-client.js";

function unwrap(response, context) {
  if (!response.ok) {
    throw new Error(response.error);
  }
  if (!response.payload || !Object.prototype.hasOwnProperty.call(response.payload, "data")) {
    throw new Error(`${context} did not return server data. Restore the server auth/session API.`);
  }
  return response.payload.data;
}

export function getSessionCurrent() {
  return unwrap(safeRequestServerApi("/session/current"), "Current session");
}

export function getSessionModes() {
  return unwrap(safeRequestServerApi("/session/modes"), "Session modes");
}

export function getSessionUsers() {
  return unwrap(safeRequestServerApi("/session/users"), "Session users");
}

export function setSessionMode(modeId) {
  return unwrap(safeRequestServerApi("/session/mode", {
    body: { modeId },
    method: "POST",
  }), "Session mode update");
}

export function setSessionUser(userKey) {
  return unwrap(safeRequestServerApi("/session/user", {
    body: { userKey },
    method: "POST",
  }), "Session user update");
}

export function logoutSessionUser() {
  return unwrap(safeRequestServerApi("/session/logout", { method: "POST" }), "Session logout");
}
