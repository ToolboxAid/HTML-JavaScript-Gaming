import http from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import {
  adminOperationsHealth,
  createLocalApiRouter,
} from "../../src/dev-runtime/server/local-api-router.mjs";
import {
  debitAiCreditsForAction,
  grantMonthlyAiCredits,
} from "../../src/dev-runtime/ai/ai-credit-service.mjs";
import { assignUserMembership } from "../../src/dev-runtime/memberships/membership-assignment-service.mjs";
import { SEED_DB_KEYS, makeSeedUlid } from "../../src/dev-runtime/seed/seed-db-keys.mjs";
import { createServerSeedTables } from "../../src/dev-runtime/seed/server-seed-loader.mjs";

function createKeyFactory(start = 12000) {
  let sequence = start;
  return () => makeSeedUlid(sequence++);
}

function options(start = 12000) {
  return {
    actorKey: SEED_DB_KEYS.users.admin,
    createKey: createKeyFactory(start),
    now: "2026-06-18T12:00:00.000Z",
  };
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
        error: error instanceof Error ? error.message : String(error || "Admin health operations test server error."),
        ok: false,
      }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start Admin health operations API server."));
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

test("Admin can view operational health while Creator sessions are blocked", async () => {
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
      const blocked = await apiPayload(server.baseUrl, "/api/admin/system-health/status");
      assert.equal(blocked.status, 403);
      assert.match(blocked.payload.error, /Admin role required/);

      await apiJson(server.baseUrl, "/api/session/user", {
        body: { userKey: SEED_DB_KEYS.users.admin },
        method: "POST",
      });
      const health = await apiJson(server.baseUrl, "/api/admin/system-health/status");
      assert.equal(Array.isArray(health.operationsHealth.summaryRows), true);
      assert.deepEqual(
        health.operationsHealth.summaryRows.map((row) => row.area),
        [
          "Membership operations",
          "Invitation support",
          "AI credit monitoring",
          "Marketplace revenue health",
          "Team enforcement health",
          "Required DB configuration",
        ],
      );
      const healthText = JSON.stringify(health.operationsHealth);
      assert.equal(healthText.includes("monthlyPriceCents"), false);
      assert.equal(healthText.includes("priceCents"), false);
      assert.equal(health.secretEditingAllowed, false);
    } finally {
      await server.close();
    }
  });
});

test("missing membership limits and AI credit packs produce visible operational issues", () => {
  const tables = createServerSeedTables();
  const studioPlan = tables.membership_plans.find((row) => row.code === "STUDIO");
  tables.membership_limits = tables.membership_limits.filter((row) => row.planKey !== studioPlan.key);
  tables.ai_credit_packs = tables.ai_credit_packs.filter((row) => row.code !== "LARGE");

  const health = adminOperationsHealth(tables);
  assert.equal(health.memberships.status, "FAIL");
  assert.equal(health.aiCredits.status, "FAIL");
  assert.equal(health.memberships.missingLimitPlanCodes.includes("STUDIO"), true);
  assert.equal(health.aiCredits.missingPackCodes.includes("LARGE"), true);
  assert.equal(health.configIssues.some((row) => /membership_limits row is missing for STUDIO/.test(row.issue)), true);
  assert.equal(health.configIssues.some((row) => /Required AI credit pack LARGE is missing/.test(row.issue)), true);
});

test("invitation status counts are accurate for Admin support", () => {
  const tables = createServerSeedTables();
  const betaPlan = tables.membership_plans.find((row) => row.code === "BETA");
  tables.invitations.push(
    {
      acceptedAt: "",
      acceptedBy: "",
      createdAt: "2026-06-18T12:00:00.000Z",
      createdBy: SEED_DB_KEYS.users.admin,
      email: "pending@example.invalid",
      expiresAt: "2026-07-18T12:00:00.000Z",
      invitationCode: "PENDING-001",
      invitedBy: SEED_DB_KEYS.users.admin,
      key: makeSeedUlid(12100),
      planKey: betaPlan.key,
      status: "pending",
      updatedAt: "2026-06-18T12:00:00.000Z",
      updatedBy: SEED_DB_KEYS.users.admin,
    },
    {
      acceptedAt: "2026-06-18T12:30:00.000Z",
      acceptedBy: SEED_DB_KEYS.users.user1,
      createdAt: "2026-06-18T12:10:00.000Z",
      createdBy: SEED_DB_KEYS.users.admin,
      email: "accepted@example.invalid",
      expiresAt: "2026-07-18T12:10:00.000Z",
      invitationCode: "ACCEPTED-001",
      invitedBy: SEED_DB_KEYS.users.admin,
      key: makeSeedUlid(12101),
      planKey: betaPlan.key,
      status: "accepted",
      updatedAt: "2026-06-18T12:30:00.000Z",
      updatedBy: SEED_DB_KEYS.users.user1,
    },
  );

  const health = adminOperationsHealth(tables);
  assert.equal(health.invitations.countsByStatus.pending, 1);
  assert.equal(health.invitations.countsByStatus.accepted, 1);
  assert.deepEqual(health.invitations.statusOptions, ["accepted", "pending"]);
});

test("AI usage summaries match ai_usage_log rows", () => {
  const tables = createServerSeedTables();
  assignUserMembership(tables, {
    externalSubscriptionId: "sub_admin_health_ai",
    planCode: "CREATOR",
    source: "paid",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(12200));
  grantMonthlyAiCredits(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(12300));
  debitAiCreditsForAction(tables, {
    actionCode: "TEXT_ASSIST",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(12400));

  const health = adminOperationsHealth(tables);
  assert.equal(health.aiCredits.usageCount, tables.ai_usage_log.length);
  assert.equal(health.aiCredits.monthlyGrantCount, 1);
  assert.equal(health.aiCredits.debitCount, 1);
  assert.equal(health.aiCredits.rows.some((row) => row.actionCode === "TEXT_ASSIST" && row.creditDelta < 0), true);
  assert.equal(health.aiCredits.actionOptions.includes("TEXT_ASSIST"), true);
});
