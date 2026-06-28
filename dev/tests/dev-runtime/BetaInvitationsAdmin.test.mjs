import http from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { createLocalApiRouter } from "../../../api/server/local-api-router.mjs";
import { SEED_DB_KEYS } from "../../../api/seed/seed-db-keys.mjs";

function withEnv(nextEnv, callback) {
  const previousEnv = {};
  Object.keys(nextEnv).forEach((key) => {
    previousEnv[key] = process.env[key];
    if (nextEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = nextEnv[key];
    }
  });
  return Promise.resolve()
    .then(callback)
    .finally(() => {
      Object.entries(previousEnv).forEach(([key, value]) => {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      });
    });
}

function startApiServer() {
  const handleRequest = createLocalApiRouter();
  const server = http.createServer((request, response) => {
    const address = server.address();
    const port = address && typeof address !== "string" ? address.port : 0;
    const requestUrl = new URL(request.url || "/", `http://127.0.0.1:${port}`);
    handleRequest(request, response, requestUrl).catch((error) => {
      response.statusCode = error?.statusCode || 500;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({
        error: error instanceof Error ? error.message : String(error || "Beta invitations test server error."),
        ok: false,
      }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start Beta invitations API server."));
        return;
      }
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () => new Promise((closeResolve) => {
          server.closeAllConnections?.();
          server.close(closeResolve);
        }),
      });
    });
  });
}

async function apiPayload(baseUrl, pathName, options = {}) {
  const init = options.body === undefined
    ? options
    : {
      ...options,
      body: JSON.stringify(options.body),
      headers: {
        "content-type": "application/json",
        ...(options.headers || {}),
      },
    };
  const response = await fetch(`${baseUrl}${pathName}`, init);
  const payload = await response.json();
  return { payload, status: response.status };
}

async function apiJson(baseUrl, pathName, options = {}) {
  const { payload, status } = await apiPayload(baseUrl, pathName, options);
  assert.equal(status, 200, `${pathName} should return HTTP 200: ${payload.error || ""}`);
  assert.equal(payload.ok, true, `${pathName} should return ok: ${payload.error || ""}`);
  return payload.data;
}

async function expectApiFailure(baseUrl, pathName, options, expectedStatus, pattern) {
  const { payload, status } = await apiPayload(baseUrl, pathName, options);
  assert.equal(status, expectedStatus, `${pathName} should return HTTP ${expectedStatus}`);
  assert.equal(payload.ok, false, `${pathName} should fail visibly`);
  assert.match(payload.error, pattern);
  return payload;
}

async function signInAdmin(baseUrl) {
  const session = await apiJson(baseUrl, "/api/session/user", {
    body: { userKey: SEED_DB_KEYS.users.admin },
    method: "POST",
  });
  assert.equal(session.authenticated, true);
  assert.equal(session.isAdmin, true);
  assert.equal(session.userKey, SEED_DB_KEYS.users.admin);
}

async function createBetaInvitation(baseUrl, email, personalization = {}) {
  const data = await apiJson(baseUrl, "/api/admin/invitations/create", {
    body: { email, planKey: "BETA", ...personalization },
    method: "POST",
  });
  assert.equal(data.status, "PASS");
  assert.equal(data.sourceTable, "invitations");
  assert.equal(data.invitation.email, email.toLowerCase());
  assert.equal(data.invitation.planKey, "BETA");
  assert.equal(data.invitation.status, "pending");
  assert.equal(Object.hasOwn(data.invitation, "storageMb"), false);
  assert.equal(Object.hasOwn(data.invitation, "monthlyAiCredits"), false);
  assert.equal(Object.hasOwn(data.invitation, "priceMonthlyUsd"), false);
  return data.invitation;
}

test("Admin Beta invitations require Admin and support create, list, and revoke", async () => {
  await withEnv({
    GAMEFOUNDRY_SUPABASE_ANON_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_URL: undefined,
  }, async () => {
    const server = await startApiServer();
    try {
      const unauthenticatedList = await apiPayload(server.baseUrl, "/api/admin/invitations/list");
      assert.equal(unauthenticatedList.payload.ok, false);
      assert.match(unauthenticatedList.payload.error, /Admin role required/);

      await signInAdmin(server.baseUrl);
      const invitation = await createBetaInvitation(server.baseUrl, "beta-admin@example.test", {
        inviteSource: "manual-admin",
        personalMessage: "Welcome to the Beta program.",
        recipientName: "Beta Admin",
        relationshipNote: "Studio partner",
      });
      assert.equal(invitation.recipientName, "Beta Admin");
      assert.equal(invitation.relationshipNote, "Studio partner");
      assert.equal(invitation.personalMessage, "Welcome to the Beta program.");
      assert.equal(invitation.inviteSource, "manual-admin");
      const list = await apiJson(server.baseUrl, "/api/admin/invitations/list");
      assert.equal(list.status, "PASS");
      assert.equal(list.plan.code, "BETA");
      assert.equal(list.plan.studioEquivalent, true);
      assert.equal(list.plan.membershipAssignment, "deferred-to-PR-26169-005");
      assert.deepEqual(
        list.invitations.find((row) => row.key === invitation.key),
        invitation,
      );

      const revoked = await apiJson(server.baseUrl, "/api/admin/invitations/revoke", {
        body: { invitationKey: invitation.key },
        method: "POST",
      });
      assert.equal(revoked.status, "PASS");
      assert.equal(revoked.invitation.status, "revoked");
      assert.equal(revoked.invitation.updatedBy, SEED_DB_KEYS.users.admin);

      await expectApiFailure(server.baseUrl, "/api/invitations/accept", {
        body: {
          email: invitation.email,
          invitationCode: invitation.invitationCode,
        },
        method: "POST",
      }, 409, /revoked/);
    } finally {
      await server.close();
    }
  });
});

test("Beta invitation acceptance is single-use and preserves membership assignment handoff", async () => {
  await withEnv({
    GAMEFOUNDRY_SUPABASE_ANON_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_URL: undefined,
  }, async () => {
    const server = await startApiServer();
    try {
      await signInAdmin(server.baseUrl);
      const invitation = await createBetaInvitation(server.baseUrl, "user1@example.invalid");

      const accepted = await apiJson(server.baseUrl, "/api/invitations/accept", {
        body: {
          email: "USER1@example.invalid",
          invitationCode: invitation.invitationCode,
        },
        method: "POST",
      });
      assert.equal(accepted.status, "PASS");
      assert.equal(accepted.userKey, SEED_DB_KEYS.users.user1);
      assert.equal(accepted.membershipAssignmentStatus, "deferred-to-PR-26169-005");
      assert.equal(accepted.invitation.status, "accepted");
      assert.equal(accepted.invitation.acceptedBy, SEED_DB_KEYS.users.user1);
      assert.equal(Object.hasOwn(accepted, "membership"), false);
      assert.equal(Object.hasOwn(accepted, "userMembership"), false);

      const listed = await apiJson(server.baseUrl, "/api/admin/invitations/list");
      const listedInvitation = listed.invitations.find((row) => row.key === invitation.key);
      assert.equal(listedInvitation.status, "accepted");
      assert.equal(listedInvitation.acceptedBy, SEED_DB_KEYS.users.user1);

      await expectApiFailure(server.baseUrl, "/api/invitations/accept", {
        body: {
          email: "user1@example.invalid",
          invitationCode: invitation.invitationCode,
        },
        method: "POST",
      }, 409, /already been accepted/);

      const mismatched = await createBetaInvitation(server.baseUrl, "user2@example.invalid");
      await expectApiFailure(server.baseUrl, "/api/invitations/accept", {
        body: {
          email: "user1@example.invalid",
          invitationCode: mismatched.invitationCode,
        },
        method: "POST",
      }, 403, /email does not match/);

      await expectApiFailure(server.baseUrl, "/api/invitations/accept", {
        body: {
          email: "user1@example.invalid",
          invitationCode: "missing-beta-code",
        },
        method: "POST",
      }, 404, /not found/);
    } finally {
      await server.close();
    }
  });
});

test("Expired Beta invitations reject acceptance visibly", async () => {
  await withEnv({
    GAMEFOUNDRY_SUPABASE_ANON_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_URL: undefined,
  }, async () => {
    const server = await startApiServer();
    try {
      await signInAdmin(server.baseUrl);
      const invitation = await createBetaInvitation(server.baseUrl, "user3@example.invalid");
      const expired = await apiJson(server.baseUrl, "/api/admin/invitations/expire", {
        body: { invitationKey: invitation.key },
        method: "POST",
      });
      assert.equal(expired.status, "PASS");
      assert.equal(expired.invitation.status, "expired");
      assert.equal(expired.invitation.updatedBy, SEED_DB_KEYS.users.admin);

      await expectApiFailure(server.baseUrl, "/api/invitations/accept", {
        body: {
          email: "user3@example.invalid",
          invitationCode: invitation.invitationCode,
        },
        method: "POST",
      }, 410, /expired/);
    } finally {
      await server.close();
    }
  });
});
