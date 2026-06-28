import test from "node:test";
import assert from "node:assert/strict";
import { SUPABASE_POSTGRES_PRODUCT_TABLES } from "../../../api/auth/provider-contract-stubs.mjs";
import { debitAiCreditsForAction, grantMonthlyAiCredits, purchaseAiCreditPack } from "../../../api/ai/ai-credit-service.mjs";
import { assignUserMembership } from "../../../api/memberships/membership-assignment-service.mjs";
import { getMockDbTableSchemas } from "../../../api/persistence/mock-db-store.js";
import { SEED_DB_KEYS, makeSeedUlid } from "../../../api/seed/seed-db-keys.mjs";
import { createServerSeedTables } from "../../../api/seed/server-seed-loader.mjs";

function createKeyFactory(start = 1500) {
  let sequence = start;
  return () => makeSeedUlid(sequence++);
}

function options(start = 1500) {
  return {
    actorKey: SEED_DB_KEYS.users.admin,
    createKey: createKeyFactory(start),
    now: "2026-06-18T12:00:00.000Z",
  };
}

function assignPlan(tables, userKey, planCode, start = 1600) {
  return assignUserMembership(tables, {
    externalSubscriptionId: `sub_${planCode.toLowerCase()}`,
    planCode,
    source: planCode.startsWith("FOUNDING_") ? "founding_paid" : "paid",
    userKey,
  }, options(start));
}

function accountFor(tables, userKey) {
  return tables.user_ai_credits.find((row) => row.userKey === userKey);
}

test("AI credit schemas, packs, actions, and provider tables are database-backed", () => {
  const schemas = getMockDbTableSchemas();
  ["ai_actions", "ai_credit_packs", "user_ai_credits", "ai_usage_log"].forEach((tableName) => {
    assert.equal(Object.hasOwn(schemas, tableName), true, `${tableName} schema should exist`);
    assert.equal(SUPABASE_POSTGRES_PRODUCT_TABLES.includes(tableName), true, `${tableName} should be a product table`);
  });

  const tables = createServerSeedTables();
  assert.deepEqual(tables.ai_credit_packs.map((row) => [row.code, row.credits, row.priceCents]), [
    ["SMALL", 100, 500],
    ["MEDIUM", 500, 2000],
    ["LARGE", 3000, 9900],
  ]);
  assert.equal(tables.ai_actions.every((row) => Number.isInteger(row.creditCost) && row.creditCost > 0), true);
});

test("monthly grants derive from active membership limits", () => {
  const tables = createServerSeedTables();
  const free = grantMonthlyAiCredits(tables, { userKey: SEED_DB_KEYS.users.user1 }, options());
  assert.equal(free.grantedCredits, 0);
  assert.equal(free.account.includedBalance, 0);

  assignPlan(tables, SEED_DB_KEYS.users.user1, "CREATOR", 1610);
  const creator = grantMonthlyAiCredits(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(1620));
  assert.equal(creator.grantedCredits, 100);
  assert.equal(creator.account.includedBalance, 100);

  assignPlan(tables, SEED_DB_KEYS.users.user1, "STUDIO", 1630);
  const studio = grantMonthlyAiCredits(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(1640));
  assert.equal(studio.grantedCredits, 400);
  assert.equal(studio.account.includedBalance, 400);
});

test("Beta receives Studio-equivalent monthly credits without paid Studio billing", () => {
  const tables = createServerSeedTables();
  tables.invitations.push({
    acceptedAt: "2026-06-18T12:00:00.000Z",
    acceptedBy: SEED_DB_KEYS.users.user2,
    createdAt: "2026-06-18T12:00:00.000Z",
    createdBy: SEED_DB_KEYS.users.admin,
    email: "user2@example.invalid",
    expiresAt: "2026-07-18T12:00:00.000Z",
    invitationCode: "beta-ai-credit",
    invitedBy: SEED_DB_KEYS.users.admin,
    key: makeSeedUlid(1701),
    planKey: "BETA",
    status: "accepted",
    updatedAt: "2026-06-18T12:00:00.000Z",
    updatedBy: SEED_DB_KEYS.users.user2,
  });
  assignUserMembership(tables, {
    invitationKey: makeSeedUlid(1701),
    planCode: "BETA",
    source: "beta_invitation",
    userKey: SEED_DB_KEYS.users.user2,
  }, options(1702));
  const beta = grantMonthlyAiCredits(tables, { userKey: SEED_DB_KEYS.users.user2 }, options(1703));
  assert.equal(beta.activeMembership.plan.code, "BETA");
  assert.equal(beta.grantedCredits, 400);
  assert.equal(beta.activeMembership.membership.externalSubscriptionId, "");
});

test("Studio and Founding Studio purchases receive bonus credits from membership plan bps", () => {
  const tables = createServerSeedTables();
  assignPlan(tables, SEED_DB_KEYS.users.user1, "STUDIO", 1800);
  const studioPurchase = purchaseAiCreditPack(tables, {
    packCode: "SMALL",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(1810));
  assert.equal(studioPurchase.pack.priceCents, 500);
  assert.equal(studioPurchase.account.purchasedBalance, 100);
  assert.equal(studioPurchase.account.bonusBalance, 10);
  assert.equal(studioPurchase.bonusCredits, 10);

  assignPlan(tables, SEED_DB_KEYS.users.user3, "FOUNDING_STUDIO", 1820);
  const foundingPurchase = purchaseAiCreditPack(tables, {
    packCode: "MEDIUM",
    userKey: SEED_DB_KEYS.users.user3,
  }, options(1830));
  assert.equal(foundingPurchase.account.purchasedBalance, 500);
  assert.equal(foundingPurchase.account.bonusBalance, 50);
  assert.equal(foundingPurchase.bonusCredits, 50);
});

test("AI action debits use action costs and write usage logs", () => {
  const tables = createServerSeedTables();
  assignPlan(tables, SEED_DB_KEYS.users.user1, "CREATOR", 1900);
  grantMonthlyAiCredits(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(1910));
  const beforeLogs = tables.ai_usage_log.length;
  const debit = debitAiCreditsForAction(tables, {
    actionCode: "TEXT_ASSIST",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(1920));
  assert.equal(debit.debitedCredits, 10);
  assert.equal(debit.account.includedBalance, 90);
  assert.equal(tables.ai_usage_log.length, beforeLogs + 1);
  const log = tables.ai_usage_log.at(-1);
  assert.equal(log.actionKey, SEED_DB_KEYS.aiActions.textAssist);
  assert.equal(log.creditDelta, -10);
  assert.equal(log.sourceType, "action_debit");
  assert.equal(log.balanceAfter, 90);
});

test("insufficient credits reject before mutation or usage log write", () => {
  const tables = createServerSeedTables();
  grantMonthlyAiCredits(tables, { userKey: SEED_DB_KEYS.users.user1 }, options(2000));
  const beforeLogs = tables.ai_usage_log.length;
  assert.throws(() => debitAiCreditsForAction(tables, {
    actionCode: "TEXT_ASSIST",
    userKey: SEED_DB_KEYS.users.user1,
  }, options(2010)), /Insufficient AI credits/);
  assert.equal(accountFor(tables, SEED_DB_KEYS.users.user1).includedBalance, 0);
  assert.equal(tables.ai_usage_log.length, beforeLogs);
});
