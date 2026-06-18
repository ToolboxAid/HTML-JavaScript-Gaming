import {
  requireServerApiData,
  safeRequestServerApi,
} from "./server-api-client.js";

export function readAdminInvitations() {
  return requireServerApiData(
    safeRequestServerApi("/admin/invitations/list"),
    "Admin Invitations list",
  );
}

export function createAdminBetaInvitation(email, expiresAt = "") {
  return requireServerApiData(
    safeRequestServerApi("/admin/invitations/create", {
      body: { email, expiresAt, planKey: "BETA" },
      method: "POST",
    }),
    "Admin Beta invitation create",
  );
}

export function revokeAdminBetaInvitation(invitationKey) {
  return requireServerApiData(
    safeRequestServerApi("/admin/invitations/revoke", {
      body: { invitationKey },
      method: "POST",
    }),
    "Admin Beta invitation revoke",
  );
}

export function expireAdminBetaInvitation(invitationKey) {
  return requireServerApiData(
    safeRequestServerApi("/admin/invitations/expire", {
      body: { invitationKey },
      method: "POST",
    }),
    "Admin Beta invitation expire",
  );
}
