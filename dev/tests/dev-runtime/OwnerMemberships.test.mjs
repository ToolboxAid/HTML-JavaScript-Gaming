import http from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { createLocalApiRouter } from "../../../api/server/local-api-router.mjs";
import { assignUserMembership } from "../../../api/memberships/membership-assignment-service.mjs";
import {
  OwnerMembershipSettingsError,
  readOwnerMembershipSettings,
  updateOwnerMembershipSettings,
} from "../../../api/memberships/owner-membership-settings-service.mjs";
import { readMembershipCatalog } from "../../../api/memberships/membership-assignment-service.mjs";
import { readMarketplaceSellerRevenueModel } from "../../../api/marketplace/marketplace-revenue-service.mjs";
import {
  ensureProjectOwnerMember,
  readProjectTeamState,
} from "../../../api/teams/project-team-service.mjs";
import { SEED_DB_KEYS, makeSeedUlid } from "../../../api/seed/seed-db-keys.mjs";
import { createServerSeedTables } from "../../../api/seed/server-seed-loader.mjs";

const OWNER_SESSION = Object.freeze({
  isOwner: true,
  userKey: SEED_DB_KEYS.users.admin,
});

const CREATOR_SESSION = Object.freeze({
  isOwner: false,
  userKey: SEED_DB_KEYS.users.user1,
});

function createKeyFactory(start = 8000) {
  let sequence = start;
  return () => makeSeedUlid(sequence++);
}

function options(start = 8000) {
  return {
    actorKey: SEED_DB_KEYS.users.admin,
    createKey: createKeyFactory(start),
    now: "2026-06-18T12:00:00.000Z",
    session: OWNER_SESSION,
  };
}

function planByCode(tables, planCode) {
  return tables.membership_plans.find((row) => row.code === planCode);
}

function limitsForPlan(tables, planCode) {
  const plan = planByCode(tables, planCode);
  return tables.membership_limits.find((row) => row.planKey === plan.key);
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
        error: error instanceof Error ? error.message : String(error || "Owner membership test server error."),
        ok: false,
      }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start Owner membership API server."));
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

async function apiPayload(baseUrl, pathName, request = {}) {
  const init = request.body === undefined
    ? request
    : {
      ...request,
      body: JSON.stringify(request.body),
      headers: {
        "content-type": "application/json",
        ...(request.headers || {}),
      },
    };
  const response = await fetch(`${baseUrl}${pathName}`, init);
  const payload = await response.json();
  return { payload, status: response.status };
}

async function apiJson(baseUrl, pathName, request = {}) {
  const { payload, status } = await apiPayload(baseUrl, pathName, request);
  assert.equal(status, 200, `${pathName} should return 200: ${payload.error || ""}`);
  assert.equal(payload.ok, true);
  return payload.data;
}

test("Owner can update Creator price and audit fields from DB-backed plan records", () => {
  const tables = createServerSeedTables();
  const updated = updateOwnerMembershipSettings(tables, {
    plan: { monthlyPriceCents: 1100 },
    planCode: "CREATOR",
  }, options());

  assert.equal(planByCode(tables, "CREATOR").monthlyPriceCents, 1100);
  assert.equal(planByCode(tables, "CREATOR").updatedBy, SEED_DB_KEYS.users.admin);
  assert.equal(planByCode(tables, "CREATOR").updatedAt, "2026-06-18T12:00:00.000Z");
  assert.equal(updated.updatedPlanCode, "CREATOR");

  const catalog = readMembershipCatalog(tables, {}, options());
  const creator = catalog.plans.find((entry) => entry.plan.code === "CREATOR");
  assert.equal(creator.plan.monthlyPriceCents, 1100);
});

test("Owner can update Studio team limit and team service reads the updated limit", () => {
  const tables = createServerSeedTables();
  updateOwnerMembershipSettings(tables, {
    limits: { maxTeamMembers: 12 },
    planCode: "STUDIO",
  }, options(8100));
  assert.equal(limitsForPlan(tables, "STUDIO").maxTeamMembers, 12);

  assignUserMembership(tables, {
    externalSubscriptionId: "sub_studio_owner_limit",
    planCode: "STUDIO",
    source: "paid",
    userKey: SEED_DB_KEYS.users.user2,
  }, options(8200));
  ensureProjectOwnerMember(tables, {
    ownerUserKey: SEED_DB_KEYS.users.user2,
    projectKey: "project-studio-owner-limit",
  }, options(8300));
  const team = readProjectTeamState(tables, { projectKey: "project-studio-owner-limit" });
  assert.equal(team.maxTeamMembers, 12);
});

test("Owner can update marketplace revenue share basis points and marketplace revenue reads it", () => {
  const tables = createServerSeedTables();
  updateOwnerMembershipSettings(tables, {
    plan: { revenueShareBps: 7500 },
    planCode: "CREATOR",
  }, options(8400));
  assignUserMembership(tables, {
    externalSubscriptionId: "sub_creator_revenue",
    planCode: "CREATOR",
    source: "paid",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(8500));

  const revenue = readMarketplaceSellerRevenueModel(tables, { userKey: SEED_DB_KEYS.users.user1 });
  assert.equal(revenue.revenueShareBps, 7500);
  assert.equal(revenue.sourceField, "membership_plans.revenueShareBps");
});

test("non-Owner sessions and invalid Owner edits are rejected before mutation", () => {
  const tables = createServerSeedTables();
  assert.throws(() => readOwnerMembershipSettings(tables, {
    session: CREATOR_SESSION,
  }), (error) => {
    assert.ok(error instanceof OwnerMembershipSettingsError);
    assert.equal(error.statusCode, 403);
    assert.match(error.message, /Owner role required/);
    return true;
  });
  assert.throws(() => updateOwnerMembershipSettings(tables, {
    plan: { monthlyPriceCents: -1 },
    planCode: "CREATOR",
  }, options(8600)), /Monthly price cents/);
  assert.throws(() => updateOwnerMembershipSettings(tables, {
    plan: { revenueShareBps: 10001 },
    planCode: "CREATOR",
  }, options(8700)), /Revenue share basis points/);
  assert.equal(planByCode(tables, "CREATOR").monthlyPriceCents, 900);
  assert.equal(planByCode(tables, "CREATOR").revenueShareBps, 8000);
});

test("founding locked active prices are not overwritten by founding plan price edits", () => {
  const tables = createServerSeedTables();
  const assigned = assignUserMembership(tables, {
    externalSubscriptionId: "sub_founding_locked",
    planCode: "FOUNDING_CREATOR",
    source: "founding_paid",
    userKey: SEED_DB_KEYS.users.user3,
  }, options(8800));
  assert.equal(assigned.foundingMember.lockedMonthlyPriceCents, 500);

  const updated = updateOwnerMembershipSettings(tables, {
    plan: { monthlyPriceCents: 700 },
    planCode: "FOUNDING_CREATOR",
  }, options(8900));
  assert.equal(planByCode(tables, "FOUNDING_CREATOR").monthlyPriceCents, 700);
  assert.equal(tables.founding_members[0].lockedMonthlyPriceCents, 500);
  assert.deepEqual(updated.foundingProgram.lockedActivePrices.map((entry) => entry.lockedMonthlyPriceCents), [500]);
});

test("Owner Local API reads and updates settings while non-Owners are blocked", async () => {
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
      const blocked = await apiPayload(server.baseUrl, "/api/owner/memberships/settings");
      assert.equal(blocked.status, 403);
      assert.equal(blocked.payload.ok, false);
      assert.match(blocked.payload.error, /Owner role required/);

      await apiJson(server.baseUrl, "/api/session/user", {
        body: { userKey: SEED_DB_KEYS.users.admin },
        method: "POST",
      });
      const initial = await apiJson(server.baseUrl, "/api/owner/memberships/settings");
      assert.equal(initial.status, "PASS");
      assert.equal(initial.plans.some((entry) => entry.plan.code === "CREATOR"), true);

      const updated = await apiJson(server.baseUrl, "/api/owner/memberships/settings", {
        body: {
          plan: { monthlyPriceCents: 1200 },
          planCode: "CREATOR",
        },
        method: "POST",
      });
      const creator = updated.plans.find((entry) => entry.plan.code === "CREATOR");
      assert.equal(creator.plan.monthlyPriceCents, 1200);
    } finally {
      await server.close();
    }
  });
});
