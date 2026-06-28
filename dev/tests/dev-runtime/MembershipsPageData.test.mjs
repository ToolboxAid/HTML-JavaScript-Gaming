import http from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { createLocalApiRouter } from "../../../api/server/local-api-router.mjs";
import { assignUserMembership, readMembershipCatalog } from "../../../api/memberships/membership-assignment-service.mjs";
import { SEED_DB_KEYS, makeSeedUlid } from "../../../api/seed/seed-db-keys.mjs";
import { createServerSeedTables } from "../../../api/seed/server-seed-loader.mjs";

function createKeyFactory(start = 1200) {
  let sequence = start;
  return () => makeSeedUlid(sequence++);
}

function options(start = 1200) {
  return {
    actorKey: SEED_DB_KEYS.users.admin,
    createKey: createKeyFactory(start),
    now: "2026-06-18T12:00:00.000Z",
  };
}

function planEntry(catalog, code) {
  return catalog.plans.find((entry) => entry.plan.code === code);
}

function addAcceptedBetaInvitation(tables, userKey) {
  const key = makeSeedUlid(1301);
  tables.invitations.push({
    acceptedAt: "2026-06-18T12:00:00.000Z",
    acceptedBy: userKey,
    createdAt: "2026-06-18T12:00:00.000Z",
    createdBy: SEED_DB_KEYS.users.admin,
    email: "user2@example.invalid",
    expiresAt: "2026-07-18T12:00:00.000Z",
    invitationCode: "accepted-beta-memberships-page",
    invitedBy: SEED_DB_KEYS.users.admin,
    key,
    planKey: "BETA",
    status: "accepted",
    updatedAt: "2026-06-18T12:00:00.000Z",
    updatedBy: userKey,
  });
  return key;
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
        error: error instanceof Error ? error.message : String(error || "Membership catalog test server error."),
        ok: false,
      }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start membership catalog API server."));
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

async function apiJson(baseUrl, pathName, options = {}) {
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
  assert.equal(response.status, 200, `${pathName} should return HTTP 200: ${payload.error || ""}`);
  assert.equal(payload.ok, true, `${pathName} should return ok: ${payload.error || ""}`);
  return payload.data;
}

test("membership catalog returns DB-backed plan values without an active session", () => {
  const tables = createServerSeedTables();
  const catalog = readMembershipCatalog(tables);
  assert.equal(catalog.active, null);
  assert.deepEqual(catalog.sourceTables, ["membership_plans", "membership_limits", "user_memberships", "founding_members", "invitations"]);
  assert.deepEqual(catalog.plans.map((entry) => entry.plan.code), [
    "FREE",
    "CREATOR",
    "STUDIO",
    "BETA",
    "FOUNDING_CREATOR",
    "FOUNDING_STUDIO",
  ]);
  assert.equal(planEntry(catalog, "FREE").plan.monthlyPriceCents, 0);
  assert.equal(planEntry(catalog, "FREE").limits.storageMb, 250);
  assert.equal(planEntry(catalog, "CREATOR").plan.revenueShareBps, 8000);
  assert.equal(planEntry(catalog, "STUDIO").plan.purchasedCreditBonusBps, 1000);
  assert.equal(planEntry(catalog, "BETA").availability.kind, "invitation-only");
  assert.equal(planEntry(catalog, "FOUNDING_CREATOR").availability.showLockedPrice, false);
});

test("membership catalog reflects Free, paid, Beta, and Founding active states", () => {
  const tables = createServerSeedTables();
  const free = readMembershipCatalog(tables, { userKey: SEED_DB_KEYS.users.user1 }, options());
  assert.equal(free.active.plan.code, "FREE");
  assert.equal(planEntry(free, "FREE").isActivePlan, true);

  assignUserMembership(tables, {
    externalSubscriptionId: "sub_creator_catalog",
    planCode: "CREATOR",
    source: "paid",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(1210));
  const creator = readMembershipCatalog(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(1220));
  assert.equal(creator.active.plan.code, "CREATOR");
  assert.equal(creator.active.limits.maxTeamMembers, 3);

  assignUserMembership(tables, {
    externalSubscriptionId: "sub_studio_catalog",
    planCode: "STUDIO",
    source: "paid",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(1230));
  const studio = readMembershipCatalog(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(1240));
  assert.equal(studio.active.plan.code, "STUDIO");
  assert.equal(studio.active.limits.monthlyAiCredits, 400);

  const invitationKey = addAcceptedBetaInvitation(tables, SEED_DB_KEYS.users.user2);
  assignUserMembership(tables, {
    invitationKey,
    planCode: "BETA",
    source: "beta_invitation",
    userKey: SEED_DB_KEYS.users.user2,
  }, options(1250));
  const beta = readMembershipCatalog(tables, { userKey: SEED_DB_KEYS.users.user2 }, options(1260));
  assert.equal(beta.active.plan.code, "BETA");
  assert.equal(planEntry(beta, "BETA").availability.actionLabel, "Invitation Only");

  assignUserMembership(tables, {
    externalSubscriptionId: "sub_founding_catalog",
    planCode: "FOUNDING_STUDIO",
    source: "founding_paid",
    userKey: SEED_DB_KEYS.users.user3,
  }, options(1270));
  const founding = readMembershipCatalog(tables, { userKey: SEED_DB_KEYS.users.user3 }, options(1280));
  assert.equal(founding.active.plan.code, "FOUNDING_STUDIO");
  assert.equal(planEntry(founding, "FOUNDING_STUDIO").availability.showLockedPrice, true);
});

test("membership catalog fails visibly for duplicate active membership data", () => {
  const tables = createServerSeedTables();
  tables.user_memberships.push({
    ...tables.user_memberships.find((row) => row.userKey === SEED_DB_KEYS.users.admin),
    key: makeSeedUlid(1399),
  });
  assert.throws(() => readMembershipCatalog(tables, { userKey: SEED_DB_KEYS.users.admin }, options(1290)), /multiple active memberships/);
});

test("Local API membership catalog uses selected session membership", async () => {
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
      await apiJson(server.baseUrl, "/api/admin/memberships/assign", {
        body: {
          externalSubscriptionId: "sub_catalog_route_creator",
          planCode: "CREATOR",
          source: "paid",
          userKey: SEED_DB_KEYS.users.user1,
        },
        method: "POST",
      });
      await apiJson(server.baseUrl, "/api/session/user", {
        body: { userKey: SEED_DB_KEYS.users.user1 },
        method: "POST",
      });
      const catalog = await apiJson(server.baseUrl, "/api/memberships/catalog");
      assert.equal(catalog.active.plan.code, "CREATOR");
      assert.equal(catalog.plans.length, 6);
      assert.equal(catalog.currentUserKey, SEED_DB_KEYS.users.user1);
    } finally {
      await server.close();
    }
  });
});
