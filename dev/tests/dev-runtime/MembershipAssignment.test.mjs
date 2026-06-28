import http from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { createLocalApiRouter } from "../../../api/server/local-api-router.mjs";
import { assignUserMembership, resolveActiveUserMembership, MembershipAssignmentError } from "../../../api/memberships/membership-assignment-service.mjs";
import { SEED_DB_KEYS, makeSeedUlid } from "../../../api/seed/seed-db-keys.mjs";
import { createServerSeedTables } from "../../../api/seed/server-seed-loader.mjs";

function createKeyFactory(start = 500) {
  let sequence = start;
  return () => makeSeedUlid(sequence++);
}

function testOptions(start = 500) {
  return {
    actorKey: SEED_DB_KEYS.users.admin,
    createKey: createKeyFactory(start),
    now: "2026-06-18T12:00:00.000Z",
  };
}

function activeMemberships(tables, userKey) {
  return (tables.user_memberships || []).filter((row) => row.userKey === userKey && row.status === "active");
}

function addSyntheticUser(tables, sequence, email = `founding-${sequence}@example.invalid`) {
  const userKey = makeSeedUlid(700 + sequence);
  tables.users.push({
    authProvider: "supabase-auth",
    authProviderUserId: `synthetic-${sequence}`,
    createdAt: "2026-06-18T12:00:00.000Z",
    createdBy: SEED_DB_KEYS.users.admin,
    displayName: `Synthetic ${sequence}`,
    email,
    isActive: true,
    key: userKey,
    updatedAt: "2026-06-18T12:00:00.000Z",
    updatedBy: SEED_DB_KEYS.users.admin,
  });
  return userKey;
}

function addAcceptedBetaInvitation(tables, userKey, key = makeSeedUlid(850)) {
  tables.invitations.push({
    acceptedAt: "2026-06-18T12:00:00.000Z",
    acceptedBy: userKey,
    createdAt: "2026-06-18T12:00:00.000Z",
    createdBy: SEED_DB_KEYS.users.admin,
    email: "user2@example.invalid",
    expiresAt: "2026-07-18T12:00:00.000Z",
    invitationCode: `beta-code-${key}`,
    invitedBy: SEED_DB_KEYS.users.admin,
    key,
    planKey: "BETA",
    status: "accepted",
    updatedAt: "2026-06-18T12:00:00.000Z",
    updatedBy: userKey,
  });
  return key;
}

function assertMembershipOnlyReferencesPlanAndSource(row) {
  assert.equal(Object.hasOwn(row, "monthlyPriceCents"), false);
  assert.equal(Object.hasOwn(row, "storageMb"), false);
  assert.equal(Object.hasOwn(row, "monthlyAiCredits"), false);
  assert.equal(Object.hasOwn(row, "revenueShareBps"), false);
  assert.equal(Object.hasOwn(row, "marketplaceSellEnabled"), false);
}

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
        error: error instanceof Error ? error.message : String(error || "Membership assignment test server error."),
        ok: false,
      }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start membership assignment API server."));
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

test("seeded users resolve to explicit Free memberships and new users receive Free through assignment", () => {
  const tables = createServerSeedTables();
  [SEED_DB_KEYS.users.user1, SEED_DB_KEYS.users.user2, SEED_DB_KEYS.users.user3, SEED_DB_KEYS.users.admin].forEach((userKey) => {
    const resolved = resolveActiveUserMembership(tables, { userKey }, testOptions());
    assert.equal(resolved.plan.code, "FREE");
    assert.equal(resolved.membership.source, "free");
    assert.equal(activeMemberships(tables, userKey).length, 1);
    assertMembershipOnlyReferencesPlanAndSource(resolved.membership);
  });

  const newUserKey = addSyntheticUser(tables, 1);
  assert.equal(activeMemberships(tables, newUserKey).length, 0);
  const resolvedNewUser = resolveActiveUserMembership(tables, { userKey: newUserKey }, testOptions(600));
  assert.equal(resolvedNewUser.plan.code, "FREE");
  assert.equal(resolvedNewUser.membership.status, "active");
  assert.equal(activeMemberships(tables, newUserKey).length, 1);
});

test("paid Creator and Studio assignments supersede active history and expose plan limits", () => {
  const tables = createServerSeedTables();
  const creator = assignUserMembership(tables, {
    externalSubscriptionId: "sub_creator_001",
    planCode: "CREATOR",
    source: "paid",
    userKey: SEED_DB_KEYS.users.user1,
  }, testOptions(610));

  assert.equal(creator.plan.code, "CREATOR");
  assert.equal(creator.plan.monthlyPriceCents, 900);
  assert.equal(creator.limits.storageMb, 1024);
  assert.equal(creator.limits.maxTeamMembers, 3);
  assert.equal(creator.limits.marketplaceSellEnabled, true);
  assert.equal(creator.membership.externalSubscriptionId, "sub_creator_001");
  assert.notEqual(creator.membership.renewsAt, "");
  assert.equal(creator.supersededMemberships.length, 1);
  assert.equal(creator.supersededMemberships[0].source, "free");
  assertMembershipOnlyReferencesPlanAndSource(creator.membership);

  const studio = assignUserMembership(tables, {
    externalSubscriptionId: "sub_studio_001",
    planCode: "STUDIO",
    source: "paid",
    userKey: SEED_DB_KEYS.users.user1,
  }, testOptions(620));
  assert.equal(studio.plan.code, "STUDIO");
  assert.equal(studio.plan.purchasedCreditBonusBps, 1000);
  assert.equal(studio.limits.monthlyAiCredits, 400);
  assert.equal(activeMemberships(tables, SEED_DB_KEYS.users.user1).length, 1);
  assert.equal(tables.user_memberships.filter((row) => row.userKey === SEED_DB_KEYS.users.user1 && row.status === "superseded").length, 2);
});

test("Beta assignment requires an accepted matching invitation", () => {
  const tables = createServerSeedTables();
  const invitationKey = addAcceptedBetaInvitation(tables, SEED_DB_KEYS.users.user2);
  const beta = assignUserMembership(tables, {
    invitationKey,
    planCode: "BETA",
    source: "beta_invitation",
    userKey: SEED_DB_KEYS.users.user2,
  }, testOptions(630));
  assert.equal(beta.plan.code, "BETA");
  assert.equal(beta.membership.invitationKey, invitationKey);
  assert.equal(beta.limits.maxTeamMembers, 10);
  assert.equal(activeMemberships(tables, SEED_DB_KEYS.users.user2).length, 1);

  assert.throws(() => assignUserMembership(tables, {
    invitationKey,
    planCode: "BETA",
    source: "beta_invitation",
    userKey: SEED_DB_KEYS.users.user3,
  }, testOptions(640)), /accepted by the assigned user/);

  const pendingInvitationKey = makeSeedUlid(851);
  tables.invitations.push({
    acceptedAt: "",
    acceptedBy: "",
    createdAt: "2026-06-18T12:00:00.000Z",
    createdBy: SEED_DB_KEYS.users.admin,
    email: "user3@example.invalid",
    expiresAt: "2026-07-18T12:00:00.000Z",
    invitationCode: "pending-beta-code",
    invitedBy: SEED_DB_KEYS.users.admin,
    key: pendingInvitationKey,
    planKey: "BETA",
    status: "pending",
    updatedAt: "2026-06-18T12:00:00.000Z",
    updatedBy: SEED_DB_KEYS.users.admin,
  });
  assert.throws(() => assignUserMembership(tables, {
    invitationKey: pendingInvitationKey,
    planCode: "BETA",
    source: "beta_invitation",
    userKey: SEED_DB_KEYS.users.user3,
  }, testOptions(650)), /accepted invitation/);
});

test("Founding assignment allocates first-100 sequence numbers and rejects exhausted capacity", () => {
  const tables = createServerSeedTables();
  const options = testOptions(900);
  for (let index = 1; index <= 100; index += 1) {
    const userKey = addSyntheticUser(tables, index);
    const assigned = assignUserMembership(tables, {
      externalSubscriptionId: `sub_founding_${index}`,
      planCode: index % 2 === 0 ? "FOUNDING_STUDIO" : "FOUNDING_CREATOR",
      source: "founding_paid",
      userKey,
    }, options);
    assert.equal(assigned.foundingMember.sequenceNumber, index);
    assert.equal(assigned.foundingMember.lockedMonthlyPriceCents, assigned.plan.monthlyPriceCents);
  }

  assert.equal(new Set(tables.founding_members.map((row) => row.sequenceNumber)).size, 100);
  assert.equal(Math.max(...tables.founding_members.map((row) => row.sequenceNumber)), 100);
  const exhaustedUserKey = addSyntheticUser(tables, 101);
  assert.throws(() => assignUserMembership(tables, {
    externalSubscriptionId: "sub_founding_exhausted",
    planCode: "FOUNDING_CREATOR",
    source: "founding_paid",
    userKey: exhaustedUserKey,
  }, options), /capacity is exhausted/);
});

test("duplicate active memberships fail visibly during resolution", () => {
  const tables = createServerSeedTables();
  tables.user_memberships.push({
    ...tables.user_memberships.find((row) => row.userKey === SEED_DB_KEYS.users.user3),
    key: makeSeedUlid(990),
  });
  assert.throws(() => resolveActiveUserMembership(tables, {
    userKey: SEED_DB_KEYS.users.user3,
  }, testOptions(700)), (error) => {
    assert.ok(error instanceof MembershipAssignmentError);
    assert.equal(error.statusCode, 409);
    assert.match(error.message, /multiple active memberships/);
    return true;
  });
});

test("Admin Local API routes expose active membership diagnostics and assignment failures", async () => {
  await withEnv({
    GAMEFOUNDRY_SUPABASE_ANON_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_URL: undefined,
  }, async () => {
    const server = await startApiServer();
    try {
      await apiJson(server.baseUrl, "/api/session/user", {
        body: { userKey: SEED_DB_KEYS.users.admin },
        method: "POST",
      });
      const active = await apiJson(server.baseUrl, `/api/admin/memberships/active?userKey=${encodeURIComponent(SEED_DB_KEYS.users.user1)}`);
      assert.equal(active.plan.code, "FREE");
      assert.equal(active.sourceTable, "user_memberships");

      const assigned = await apiJson(server.baseUrl, "/api/admin/memberships/assign", {
        body: {
          externalSubscriptionId: "sub_route_creator",
          planCode: "CREATOR",
          source: "paid",
          userKey: SEED_DB_KEYS.users.user1,
        },
        method: "POST",
      });
      assert.equal(assigned.plan.code, "CREATOR");
      assert.equal(assigned.membership.source, "paid");
      assert.equal(assigned.supersededMemberships.length, 1);

      const failed = await apiPayload(server.baseUrl, "/api/admin/memberships/assign", {
        body: {
          planCode: "BETA",
          source: "beta_invitation",
          userKey: SEED_DB_KEYS.users.user1,
        },
        method: "POST",
      });
      assert.equal(failed.status, 400);
      assert.equal(failed.payload.ok, false);
      assert.match(failed.payload.error, /requires an invitation key/);
    } finally {
      await server.close();
    }
  });
});
