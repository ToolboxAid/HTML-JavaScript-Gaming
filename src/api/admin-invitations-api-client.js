import {
  requireServerApiData,
  safeRequestServerApi,
} from "../engine/api/server-api-client.js";

export function readAdminInvitations() {
  return requireServerApiData(
    safeRequestServerApi("/admin/invitations/list"),
    "Admin Invitations list",
  );
}

export function createAdminBetaInvitation(invitation = {}, expiresAt = "") {
  const body = typeof invitation === "string"
    ? { email: invitation, expiresAt }
    : { ...invitation };
  return requireServerApiData(
    safeRequestServerApi("/admin/invitations/create", {
      body: { ...body, planKey: "BETA" },
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
