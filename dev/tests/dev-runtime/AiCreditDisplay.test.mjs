import http from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { createLocalApiRouter } from "../../../api/server/local-api-router.mjs";
import { grantMonthlyAiCredits, debitAiCreditsForAction, readAiCreditDisplay } from "../../../api/ai/ai-credit-service.mjs";
import { assignUserMembership } from "../../../api/memberships/membership-assignment-service.mjs";
import { SEED_DB_KEYS, makeSeedUlid } from "../../../api/seed/seed-db-keys.mjs";
import { createServerSeedTables } from "../../../api/seed/server-seed-loader.mjs";

function createKeyFactory(start = 1500) {
  let sequence = start;
  return () => makeSeedUlid(sequence++);
}

function options(start = 1500, now = "2026-06-18T12:00:00.000Z") {
  return {
    actorKey: SEED_DB_KEYS.users.admin,
    createKey: createKeyFactory(start),
    now,
  };
}

function addAcceptedBetaInvitation(tables, userKey) {
  const key = makeSeedUlid(1580);
  tables.invitations.push({
    acceptedAt: "2026-06-18T12:00:00.000Z",
    acceptedBy: userKey,
    createdAt: "2026-06-18T12:00:00.000Z",
    createdBy: SEED_DB_KEYS.users.admin,
    email: "user2@example.invalid",
    expiresAt: "2026-07-18T12:00:00.000Z",
    invitationCode: "accepted-beta-ai-credit-display",
    invitedBy: SEED_DB_KEYS.users.admin,
    key,
    planKey: "BETA",
    status: "accepted",
    updatedAt: "2026-06-18T12:00:00.000Z",
    updatedBy: userKey,
  });
  return key;
}

function tableCounts(tables) {
  return {
    ai_usage_log: tables.ai_usage_log.length,
    user_ai_credits: tables.user_ai_credits.length,
    user_memberships: tables.user_memberships.length,
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
        error: error instanceof Error ? error.message : String(error || "AI credit display test server error."),
        ok: false,
      }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start AI credit display API server."));
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

test("AI credit display reports missing balances without mutating credit tables", () => {
  const tables = createServerSeedTables();
  const before = tableCounts(tables);
  const display = readAiCreditDisplay(tables, { userKey: SEED_DB_KEYS.users.user1 }, options());
  assert.equal(display.status, "WARN");
  assert.equal(display.account, null);
  assert.match(display.accountDiagnostic, /No AI credit balance record exists yet/);
  assert.equal(display.activeMembership.plan.code, "FREE");
  assert.equal(display.monthlyGrant.credits, 0);
  assert.deepEqual(display.packs.map((pack) => [pack.code, pack.credits, pack.priceCents, pack.bonusCredits]), [
    ["SMALL", 100, 500, 0],
    ["MEDIUM", 500, 2000, 0],
    ["LARGE", 3000, 9900, 0],
  ]);
  assert.deepEqual(tableCounts(tables), before);
});

test("AI credit display derives Creator, Studio, Beta, and Founding Studio grants from membership data", () => {
  const tables = createServerSeedTables();

  assignUserMembership(tables, {
    externalSubscriptionId: "sub_creator_ai_display",
    planCode: "CREATOR",
    source: "paid",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(1510));
  grantMonthlyAiCredits(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(1520));
  const creator = readAiCreditDisplay(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(1530));
  assert.equal(creator.activeMembership.plan.code, "CREATOR");
  assert.equal(creator.monthlyGrant.credits, 100);
  assert.equal(creator.account.includedBalance, 100);

  assignUserMembership(tables, {
    externalSubscriptionId: "sub_studio_ai_display",
    planCode: "STUDIO",
    source: "paid",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(1540));
  grantMonthlyAiCredits(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(1550));
  const studio = readAiCreditDisplay(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(1560));
  assert.equal(studio.activeMembership.plan.code, "STUDIO");
  assert.equal(studio.monthlyGrant.credits, 400);
  assert.equal(studio.account.includedBalance, 400);

  const invitationKey = addAcceptedBetaInvitation(tables, SEED_DB_KEYS.users.user2);
  assignUserMembership(tables, {
    invitationKey,
    planCode: "BETA",
    source: "beta_invitation",
    userKey: SEED_DB_KEYS.users.user2,
  }, options(1570));
  grantMonthlyAiCredits(tables, { userKey: SEED_DB_KEYS.users.user2 }, options(1580));
  const beta = readAiCreditDisplay(tables, { userKey: SEED_DB_KEYS.users.user2 }, options(1590));
  assert.equal(beta.activeMembership.plan.code, "BETA");
  assert.equal(beta.monthlyGrant.credits, 400);
  assert.equal(beta.account.includedBalance, 400);

  assignUserMembership(tables, {
    externalSubscriptionId: "sub_founding_studio_ai_display",
    planCode: "FOUNDING_STUDIO",
    source: "founding_paid",
    userKey: SEED_DB_KEYS.users.user3,
  }, options(1600));
  grantMonthlyAiCredits(tables, { userKey: SEED_DB_KEYS.users.user3 }, options(1610));
  const foundingStudio = readAiCreditDisplay(tables, { userKey: SEED_DB_KEYS.users.user3 }, options(1620));
  assert.equal(foundingStudio.activeMembership.plan.code, "FOUNDING_STUDIO");
  assert.equal(foundingStudio.monthlyGrant.credits, 400);
  assert.equal(foundingStudio.planBonusBps, 1000);
});

test("AI credit display pack bonuses are driven by active membership plan data", () => {
  const tables = createServerSeedTables();
  assignUserMembership(tables, {
    externalSubscriptionId: "sub_studio_ai_pack_display",
    planCode: "STUDIO",
    source: "paid",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(1630));
  grantMonthlyAiCredits(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(1640));
  const display = readAiCreditDisplay(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(1650));
  assert.deepEqual(display.packs.map((pack) => [pack.code, pack.credits, pack.priceCents, pack.bonusCredits, pack.effectiveCredits]), [
    ["SMALL", 100, 500, 10, 110],
    ["MEDIUM", 500, 2000, 50, 550],
    ["LARGE", 3000, 9900, 300, 3300],
  ]);
});

test("AI credit display renders usage rows with action names and newest-first order", () => {
  const tables = createServerSeedTables();
  assignUserMembership(tables, {
    externalSubscriptionId: "sub_creator_ai_usage_display",
    planCode: "CREATOR",
    source: "paid",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(1660));
  grantMonthlyAiCredits(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(1670, "2026-06-18T12:00:00.000Z"));
  debitAiCreditsForAction(tables, {
    actionCode: "TEXT_ASSIST",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(1680, "2026-06-18T12:05:00.000Z"));
  const display = readAiCreditDisplay(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(1690));
  assert.equal(display.usage[0].sourceType, "action_debit");
  assert.equal(display.usage[0].actionName, "Text Assist");
  assert.equal(display.usage[0].creditDelta, -10);
  assert.equal(display.usage[0].balanceAfter, 90);
  assert.equal(display.usage[1].sourceType, "monthly_grant");
});

test("Local API AI credit display uses selected signed-in session", async () => {
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
      const display = await apiJson(server.baseUrl, "/api/ai-credits/display");
      assert.equal(display.authenticated, true);
      assert.equal(display.currentUserKey, SEED_DB_KEYS.users.user1);
      assert.equal(display.activeMembership.plan.code, "FREE");
      assert.equal(display.monthlyGrant.credits, 0);
      assert.equal(display.account, null);
    } finally {
      await server.close();
    }
  });
});

