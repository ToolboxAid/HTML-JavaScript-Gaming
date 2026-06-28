import http from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { createLocalApiRouter } from "../../../api/server/local-api-router.mjs";
import {
  debitAiCreditsForAction,
  grantMonthlyAiCredits,
  purchaseAiCreditPack,
  readAiCreditDisplay,
} from "../../../api/ai/ai-credit-service.mjs";
import { assignUserMembership } from "../../../api/memberships/membership-assignment-service.mjs";
import {
  OwnerAiCreditSettingsError,
  readOwnerAiCreditSettings,
  updateOwnerAiCreditSettings,
} from "../../../api/ai/owner-ai-credit-settings-service.mjs";
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

function createKeyFactory(start = 9000) {
  let sequence = start;
  return () => makeSeedUlid(sequence++);
}

function options(start = 9000) {
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

function packByCode(tables, packCode) {
  return tables.ai_credit_packs.find((row) => row.code === packCode);
}

function actionByCode(tables, actionCode) {
  return tables.ai_actions.find((row) => row.code === actionCode);
}

function assignMembership(tables, userKey, planCode, start = 9100) {
  return assignUserMembership(tables, {
    externalSubscriptionId: `sub_${userKey}_${planCode}`.toLowerCase(),
    planCode,
    source: planCode === "FREE" ? "system" : "paid",
    userKey,
  }, options(start));
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
        error: error instanceof Error ? error.message : String(error || "Owner AI credit test server error."),
        ok: false,
      }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start Owner AI credit API server."));
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

test("Owner can update Small pack price and AI credit display reads the updated value", () => {
  const tables = createServerSeedTables();
  const updated = updateOwnerAiCreditSettings(tables, {
    kind: "pack",
    pack: {
      code: "SMALL",
      priceCents: 650,
    },
  }, options());

  assert.equal(packByCode(tables, "SMALL").priceCents, 650);
  assert.equal(packByCode(tables, "SMALL").updatedBy, SEED_DB_KEYS.users.admin);
  assert.equal(packByCode(tables, "SMALL").updatedAt, "2026-06-18T12:00:00.000Z");
  assert.equal(updated.diagnostic, "Updated SMALL AI credit pack.");

  assignMembership(tables, SEED_DB_KEYS.users.user1, "CREATOR", 9100);
  const display = readAiCreditDisplay(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(9200));
  assert.equal(display.packs.find((pack) => pack.code === "SMALL").priceCents, 650);
});

test("Owner can update Large pack credits and Studio display reflects bonus-effective credits", () => {
  const tables = createServerSeedTables();
  updateOwnerAiCreditSettings(tables, {
    kind: "pack",
    pack: {
      code: "LARGE",
      credits: 4000,
    },
  }, options(9300));

  assignMembership(tables, SEED_DB_KEYS.users.user2, "STUDIO", 9400);
  const display = readAiCreditDisplay(tables, { userKey: SEED_DB_KEYS.users.user2 }, options(9500));
  const largePack = display.packs.find((pack) => pack.code === "LARGE");
  assert.equal(largePack.credits, 4000);
  assert.equal(largePack.bonusCredits, 400);
  assert.equal(largePack.effectiveCredits, 4400);
});

test("Owner can update AI action cost and debits use the updated cost", () => {
  const tables = createServerSeedTables();
  updateOwnerAiCreditSettings(tables, {
    action: {
      code: "IMAGE_PROMPT",
      creditCost: 33,
    },
    kind: "action",
  }, options(9600));

  assignMembership(tables, SEED_DB_KEYS.users.user1, "CREATOR", 9700);
  grantMonthlyAiCredits(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(9800));
  const debit = debitAiCreditsForAction(tables, {
    actionCode: "IMAGE_PROMPT",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(9900));

  assert.equal(actionByCode(tables, "IMAGE_PROMPT").creditCost, 33);
  assert.equal(debit.debitedCredits, 33);
  assert.equal(debit.account.includedBalance, 67);
});

test("Owner can update Studio purchased bonus percentage and purchases use the updated bonus", () => {
  const tables = createServerSeedTables();
  updateOwnerAiCreditSettings(tables, {
    kind: "bonus",
    planCode: "STUDIO",
    purchasedCreditBonusBps: 2000,
  }, options(10000));

  assignMembership(tables, SEED_DB_KEYS.users.user2, "STUDIO", 10100);
  const purchase = purchaseAiCreditPack(tables, {
    packCode: "MEDIUM",
    userKey: SEED_DB_KEYS.users.user2,
  }, options(10200));

  assert.equal(planByCode(tables, "STUDIO").purchasedCreditBonusBps, 2000);
  assert.equal(purchase.bonusCredits, 100);
  assert.equal(purchase.account.purchasedBalance, 500);
  assert.equal(purchase.account.bonusBalance, 100);
});

test("Owner can update monthly grants and grant service reads the updated amount", () => {
  const tables = createServerSeedTables();
  updateOwnerAiCreditSettings(tables, {
    kind: "monthlyGrant",
    monthlyAiCredits: 525,
    planCode: "STUDIO",
  }, options(10300));

  assignMembership(tables, SEED_DB_KEYS.users.user2, "STUDIO", 10400);
  const grant = grantMonthlyAiCredits(tables, { userKey: SEED_DB_KEYS.users.user2 }, options(10500));
  assert.equal(limitsForPlan(tables, "STUDIO").monthlyAiCredits, 525);
  assert.equal(grant.grantedCredits, 525);
  assert.equal(grant.account.includedBalance, 525);
});

test("non-Owner sessions and invalid Owner edits are rejected before mutation", () => {
  const tables = createServerSeedTables();
  assert.throws(() => readOwnerAiCreditSettings(tables, {
    session: CREATOR_SESSION,
  }), (error) => {
    assert.ok(error instanceof OwnerAiCreditSettingsError);
    assert.equal(error.statusCode, 403);
    assert.match(error.message, /Owner role required/);
    return true;
  });
  assert.throws(() => updateOwnerAiCreditSettings(tables, {
    kind: "pack",
    pack: { code: "SMALL", priceCents: -1 },
  }, options(10600)), /Pack price cents/);
  assert.throws(() => updateOwnerAiCreditSettings(tables, {
    kind: "pack",
    pack: { code: "MEDIUM", key: packByCode(tables, "SMALL").key },
  }, options(10700)), /Duplicate AI credit pack code MEDIUM/);
  assert.throws(() => updateOwnerAiCreditSettings(tables, {
    action: { code: "TEXT_ASSIST", key: actionByCode(tables, "IMAGE_PROMPT").key },
    kind: "action",
  }, options(10800)), /Duplicate AI action code TEXT_ASSIST/);
  assert.throws(() => updateOwnerAiCreditSettings(tables, {
    kind: "bonus",
    planCode: "STUDIO",
    purchasedCreditBonusBps: 10001,
  }, options(10900)), /Purchased credit bonus basis points/);
  assert.equal(packByCode(tables, "SMALL").priceCents, 500);
  assert.equal(packByCode(tables, "SMALL").code, "SMALL");
  assert.equal(actionByCode(tables, "IMAGE_PROMPT").code, "IMAGE_PROMPT");
  assert.equal(planByCode(tables, "STUDIO").purchasedCreditBonusBps, 1000);
});

test("Owner pricing edits do not mutate existing AI usage log rows", () => {
  const tables = createServerSeedTables();
  assignMembership(tables, SEED_DB_KEYS.users.user1, "CREATOR", 11000);
  grantMonthlyAiCredits(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(11100));
  debitAiCreditsForAction(tables, {
    actionCode: "IMAGE_PROMPT",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(11200));

  const beforeUsageLog = JSON.stringify(tables.ai_usage_log);
  updateOwnerAiCreditSettings(tables, {
    kind: "pack",
    pack: { code: "SMALL", priceCents: 675 },
  }, options(11300));
  updateOwnerAiCreditSettings(tables, {
    action: { code: "IMAGE_PROMPT", creditCost: 40 },
    kind: "action",
  }, options(11400));
  updateOwnerAiCreditSettings(tables, {
    kind: "monthlyGrant",
    monthlyAiCredits: 125,
    planCode: "CREATOR",
  }, options(11500));
  updateOwnerAiCreditSettings(tables, {
    kind: "bonus",
    planCode: "STUDIO",
    purchasedCreditBonusBps: 1500,
  }, options(11600));

  assert.equal(JSON.stringify(tables.ai_usage_log), beforeUsageLog);
});

test("Owner Local API reads and updates AI credit settings while non-Owners are blocked", async () => {
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
      const blocked = await apiPayload(server.baseUrl, "/api/owner/ai-credits/settings");
      assert.equal(blocked.status, 403);
      assert.equal(blocked.payload.ok, false);
      assert.match(blocked.payload.error, /Owner role required/);

      await apiJson(server.baseUrl, "/api/session/user", {
        body: { userKey: SEED_DB_KEYS.users.admin },
        method: "POST",
      });
      const initial = await apiJson(server.baseUrl, "/api/owner/ai-credits/settings");
      assert.equal(initial.status, "PASS");
      assert.equal(initial.packs.some((pack) => pack.code === "SMALL"), true);

      const updated = await apiJson(server.baseUrl, "/api/owner/ai-credits/settings", {
        body: {
          kind: "pack",
          pack: {
            code: "SMALL",
            priceCents: 725,
          },
        },
        method: "POST",
      });
      const smallPack = updated.packs.find((pack) => pack.code === "SMALL");
      assert.equal(smallPack.priceCents, 725);
    } finally {
      await server.close();
    }
  });
});
