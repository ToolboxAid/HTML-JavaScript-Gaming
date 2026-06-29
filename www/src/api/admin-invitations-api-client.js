import {
  requireServerApiData,
  safeRequestServerApi,
} from "./server-api-client.js";

export function readAdminInvites() {
  return requireServerApiData(
    safeRequestServerApi("/admin/invitations/list"),
    "Admin Invites list",
  );
}

export function createAdminBetaInvite(invite = {}, expiresAt = "") {
  const body = typeof invite === "string"
    ? { email: invite, expiresAt }
    : { ...invite };
  return requireServerApiData(
    safeRequestServerApi("/admin/invitations/create", {
      body: { ...body, planKey: "BETA" },
      method: "POST",
    }),
    "Admin Beta invite create",
  );
}

export function revokeAdminBetaInvite(inviteKey) {
  return requireServerApiData(
    safeRequestServerApi("/admin/invitations/revoke", {
      body: { invitationKey: inviteKey },
      method: "POST",
    }),
    "Admin Beta invite revoke",
  );
}

export function expireAdminBetaInvite(inviteKey) {
  return requireServerApiData(
    safeRequestServerApi("/admin/invitations/expire", {
      body: { invitationKey: inviteKey },
      method: "POST",
    }),
    "Admin Beta invite expire",
  );
}
