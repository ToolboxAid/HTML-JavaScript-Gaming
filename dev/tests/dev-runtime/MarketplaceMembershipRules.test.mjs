import http from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { createLocalApiRouter } from "../../../api/server/local-api-router.mjs";
import { assertMarketplacePermission, readMarketplaceEntitlements } from "../../../api/marketplace/marketplace-entitlement-service.mjs";
import { assignUserMembership } from "../../../api/memberships/membership-assignment-service.mjs";
import { SEED_DB_KEYS, makeSeedUlid } from "../../../api/seed/seed-db-keys.mjs";
import { createServerSeedTables } from "../../../api/seed/server-seed-loader.mjs";

function createKeyFactory(start = 1700) {
  let sequence = start;
  return () => makeSeedUlid(sequence++);
}

function options(start = 1700) {
  return {
    actorKey: SEED_DB_KEYS.users.admin,
    createKey: createKeyFactory(start),
    now: "2026-06-18T12:00:00.000Z",
  };
}

function addAcceptedBetaInvitation(tables, userKey) {
  const key = makeSeedUlid(1780);
  tables.invitations.push({
    acceptedAt: "2026-06-18T12:00:00.000Z",
    acceptedBy: userKey,
    createdAt: "2026-06-18T12:00:00.000Z",
    createdBy: SEED_DB_KEYS.users.admin,
    email: "user2@example.invalid",
    expiresAt: "2026-07-18T12:00:00.000Z",
    invitationCode: "accepted-beta-marketplace-rules",
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
        error: error instanceof Error ? error.message : String(error || "Marketplace entitlement test server error."),
        ok: false,
      }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start marketplace entitlement API server."));
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

test("Free membership can browse, buy, and download free marketplace assets but cannot sell", () => {
  const tables = createServerSeedTables();
  const entitlements = readMarketplaceEntitlements(tables, { userKey: SEED_DB_KEYS.users.user1 });
  assert.equal(entitlements.activeMembership.plan.code, "FREE");
  assert.equal(entitlements.permissions.browse.allowed, true);
  assert.equal(entitlements.permissions.buy.allowed, true);
  assert.equal(entitlements.permissions.freeDownload.allowed, true);
  assert.equal(entitlements.permissions.sell.allowed, false);
  assert.equal(entitlements.permissions.sell.sourceField, "marketplaceSellEnabled");
  assert.match(entitlements.permissions.sell.diagnostic, /Creator or higher/);
  assert.throws(() => assertMarketplacePermission(tables, {
    action: "sell",
    userKey: SEED_DB_KEYS.users.user1,
  }), /Creator or higher/);
});

test("Creator, Studio, Beta, and Founding users can sell from membership limits", () => {
  const tables = createServerSeedTables();
  assignUserMembership(tables, {
    externalSubscriptionId: "sub_creator_marketplace_rules",
    planCode: "CREATOR",
    source: "paid",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(1710));
  assert.equal(readMarketplaceEntitlements(tables, { userKey: SEED_DB_KEYS.users.user1 }).permissions.sell.allowed, true);

  assignUserMembership(tables, {
    externalSubscriptionId: "sub_studio_marketplace_rules",
    planCode: "STUDIO",
    source: "paid",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(1720));
  assert.equal(readMarketplaceEntitlements(tables, { userKey: SEED_DB_KEYS.users.user1 }).permissions.sell.allowed, true);

  const invitationKey = addAcceptedBetaInvitation(tables, SEED_DB_KEYS.users.user2);
  assignUserMembership(tables, {
    invitationKey,
    planCode: "BETA",
    source: "beta_invitation",
    userKey: SEED_DB_KEYS.users.user2,
  }, options(1730));
  assert.equal(readMarketplaceEntitlements(tables, { userKey: SEED_DB_KEYS.users.user2 }).permissions.sell.allowed, true);

  assignUserMembership(tables, {
    externalSubscriptionId: "sub_founding_creator_marketplace_rules",
    planCode: "FOUNDING_CREATOR",
    source: "founding_paid",
    userKey: SEED_DB_KEYS.users.user3,
  }, options(1740));
  assert.equal(readMarketplaceEntitlements(tables, { userKey: SEED_DB_KEYS.users.user3 }).permissions.sell.allowed, true);

  assignUserMembership(tables, {
    externalSubscriptionId: "sub_founding_studio_marketplace_rules",
    planCode: "FOUNDING_STUDIO",
    source: "founding_paid",
    userKey: SEED_DB_KEYS.users.user3,
  }, options(1750));
  const foundingStudio = assertMarketplacePermission(tables, {
    action: "sell",
    userKey: SEED_DB_KEYS.users.user3,
  });
  assert.equal(foundingStudio.status, "PASS");
});

test("missing active membership blocks sell with actionable diagnostics", () => {
  const tables = createServerSeedTables();
  tables.user_memberships = tables.user_memberships.filter((row) => row.userKey !== SEED_DB_KEYS.users.user1);
  const entitlements = readMarketplaceEntitlements(tables, { userKey: SEED_DB_KEYS.users.user1 });
  assert.equal(entitlements.status, "WARN");
  assert.equal(entitlements.activeMembership, null);
  assert.equal(entitlements.permissions.browse.allowed, true);
  assert.equal(entitlements.permissions.sell.allowed, false);
  assert.match(entitlements.permissions.sell.diagnostic, /Active membership/);
  assert.match(entitlements.permissions.sell.diagnostic, /Creator or higher/);
  assert.throws(() => assertMarketplacePermission(tables, {
    action: "sell",
    userKey: SEED_DB_KEYS.users.user1,
  }), /Active membership/);
});

test("guest marketplace entitlement can browse but cannot use platform actions", () => {
  const tables = createServerSeedTables();
  const entitlements = readMarketplaceEntitlements(tables);
  assert.equal(entitlements.authenticated, false);
  assert.equal(entitlements.permissions.browse.allowed, true);
  assert.equal(entitlements.permissions.buy.allowed, false);
  assert.equal(entitlements.permissions.freeDownload.allowed, false);
  assert.equal(entitlements.permissions.sell.allowed, false);
});

test("Local API marketplace entitlements use selected session membership", async () => {
  await withEnv({
    GAMEFOUNDRY_SUPABASE_ANON_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: undefined,
    GAMEFOUNDRY_SUPABASE_URL: undefined,
  }, async () => {
    const server = await startApiServer();
    try {
      await apiJson(server.baseUrl, "/api/session/user", {
        body: { userKey: SEED_DB_KEYS.users.user1 },
        method: "POST",
      });
      const entitlements = await apiJson(server.baseUrl, "/api/marketplace/entitlements");
      assert.equal(entitlements.authenticated, true);
      assert.equal(entitlements.currentUserKey, SEED_DB_KEYS.users.user1);
      assert.equal(entitlements.permissions.buy.allowed, true);
      assert.equal(entitlements.permissions.freeDownload.allowed, true);
      assert.equal(entitlements.permissions.sell.allowed, false);
    } finally {
      await server.close();
    }
  });
});

