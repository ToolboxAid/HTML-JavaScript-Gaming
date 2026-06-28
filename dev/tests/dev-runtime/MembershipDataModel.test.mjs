import test from "node:test";
import assert from "node:assert/strict";
import { SUPABASE_POSTGRES_PRODUCT_TABLES } from "../../../api/auth/provider-contract-stubs.mjs";
import { getMockDbTableSchemas } from "../../../api/persistence/mock-db-store.js";
import { SEED_DB_KEYS } from "../../../api/seed/seed-db-keys.mjs";
import { createServerSeedTables } from "../../../api/seed/server-seed-loader.mjs";

const PLAN_FIELDS = [
  "key",
  "code",
  "displayName",
  "monthlyPriceCents",
  "currency",
  "billingInterval",
  "isPublic",
  "requiresInvitation",
  "isFounding",
  "basePlanCode",
  "revenueShareBps",
  "purchasedCreditBonusBps",
  "active",
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
];

const LIMIT_FIELDS = [
  "key",
  "planKey",
  "storageMb",
  "monthlyAiCredits",
  "publishExperienceLimit",
  "maxTeamMembers",
  "collaborationEnabled",
  "marketplaceBrowseEnabled",
  "marketplaceBuyEnabled",
  "marketplaceFreeDownloadEnabled",
  "marketplaceSellEnabled",
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
];

const FOUNDING_MEMBER_FIELDS = [
  "key",
  "userKey",
  "planKey",
  "sequenceNumber",
  "lockedMonthlyPriceCents",
  "active",
  "assignedAt",
  "endedAt",
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
];

const EXPECTED = {
  BETA: {
    basePlanCode: "STUDIO",
    displayName: "Beta",
    foundingMemberLimit: 0,
    isFounding: false,
    isPublic: false,
    key: SEED_DB_KEYS.membershipPlans.beta,
    limitsKey: SEED_DB_KEYS.membershipLimits.beta,
    monthlyPriceCents: 0,
    purchasedCreditBonusBps: 1000,
    requiresInvitation: true,
    revenueShareBps: 8000,
    limits: {
      analyticsTier: "advanced",
      collaborationEnabled: true,
      marketplaceSellEnabled: true,
      maxTeamMembers: 10,
      monthlyAiCredits: 400,
      publishExperienceLimit: null,
      storageMb: 4096,
    },
  },
  CREATOR: {
    basePlanCode: "",
    displayName: "Creator",
    foundingMemberLimit: 0,
    isFounding: false,
    isPublic: true,
    key: SEED_DB_KEYS.membershipPlans.creator,
    limitsKey: SEED_DB_KEYS.membershipLimits.creator,
    monthlyPriceCents: 900,
    purchasedCreditBonusBps: 0,
    requiresInvitation: false,
    revenueShareBps: 8000,
    limits: {
      analyticsTier: "creator",
      collaborationEnabled: true,
      marketplaceSellEnabled: true,
      maxTeamMembers: 3,
      monthlyAiCredits: 100,
      publishExperienceLimit: null,
      storageMb: 1024,
    },
  },
  FOUNDING_CREATOR: {
    basePlanCode: "CREATOR",
    displayName: "Founding Creator",
    foundingMemberLimit: 100,
    isFounding: true,
    isPublic: false,
    key: SEED_DB_KEYS.membershipPlans.foundingCreator,
    limitsKey: SEED_DB_KEYS.membershipLimits.foundingCreator,
    monthlyPriceCents: 500,
    purchasedCreditBonusBps: 0,
    requiresInvitation: false,
    revenueShareBps: 8000,
    limits: {
      analyticsTier: "creator",
      collaborationEnabled: true,
      marketplaceSellEnabled: true,
      maxTeamMembers: 3,
      monthlyAiCredits: 100,
      publishExperienceLimit: null,
      storageMb: 1024,
    },
  },
  FOUNDING_STUDIO: {
    basePlanCode: "STUDIO",
    displayName: "Founding Studio",
    foundingMemberLimit: 100,
    isFounding: true,
    isPublic: false,
    key: SEED_DB_KEYS.membershipPlans.foundingStudio,
    limitsKey: SEED_DB_KEYS.membershipLimits.foundingStudio,
    monthlyPriceCents: 1000,
    purchasedCreditBonusBps: 1000,
    requiresInvitation: false,
    revenueShareBps: 8000,
    limits: {
      analyticsTier: "advanced",
      collaborationEnabled: true,
      marketplaceSellEnabled: true,
      maxTeamMembers: 10,
      monthlyAiCredits: 400,
      publishExperienceLimit: null,
      storageMb: 4096,
    },
  },
  FREE: {
    basePlanCode: "",
    displayName: "Free",
    foundingMemberLimit: 0,
    isFounding: false,
    isPublic: true,
    key: SEED_DB_KEYS.membershipPlans.free,
    limitsKey: SEED_DB_KEYS.membershipLimits.free,
    monthlyPriceCents: 0,
    purchasedCreditBonusBps: 0,
    requiresInvitation: false,
    revenueShareBps: 0,
    limits: {
      analyticsTier: "none",
      collaborationEnabled: false,
      marketplaceSellEnabled: false,
      maxTeamMembers: 1,
      monthlyAiCredits: 0,
      publishExperienceLimit: 1,
      storageMb: 250,
    },
  },
  STUDIO: {
    basePlanCode: "",
    displayName: "Studio",
    foundingMemberLimit: 0,
    isFounding: false,
    isPublic: true,
    key: SEED_DB_KEYS.membershipPlans.studio,
    limitsKey: SEED_DB_KEYS.membershipLimits.studio,
    monthlyPriceCents: 1900,
    purchasedCreditBonusBps: 1000,
    requiresInvitation: false,
    revenueShareBps: 8000,
    limits: {
      analyticsTier: "advanced",
      collaborationEnabled: true,
      marketplaceSellEnabled: true,
      maxTeamMembers: 10,
      monthlyAiCredits: 400,
      publishExperienceLimit: null,
      storageMb: 4096,
    },
  },
};

function byCode(rows) {
  return new Map(rows.map((row) => [row.code, row]));
}

function limitForPlan(limits, plan) {
  return limits.find((limit) => limit.planKey === plan.key);
}

function assertAudit(row) {
  assert.match(row.createdAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.match(row.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(row.createdBy, SEED_DB_KEYS.users.admin);
  assert.equal(row.updatedBy, SEED_DB_KEYS.users.admin);
}

test("membership table schemas include required plan, limit, and founding member fields", () => {
  const schemas = getMockDbTableSchemas();
  PLAN_FIELDS.forEach((field) => {
    assert.equal(schemas.membership_plans.includes(field), true, `membership_plans should include ${field}`);
  });
  LIMIT_FIELDS.forEach((field) => {
    assert.equal(schemas.membership_limits.includes(field), true, `membership_limits should include ${field}`);
  });
  FOUNDING_MEMBER_FIELDS.forEach((field) => {
    assert.equal(schemas.founding_members.includes(field), true, `founding_members should include ${field}`);
  });
  assert.equal(schemas.membership_plans.includes("foundingMemberLimit"), true);
  assert.equal(schemas.membership_limits.includes("analyticsTier"), true);
});

test("seeded membership plans and limits match the approved business model", () => {
  const tables = createServerSeedTables();
  const plans = tables.membership_plans || [];
  const limits = tables.membership_limits || [];
  const plansByCode = byCode(plans);

  assert.deepEqual([...plansByCode.keys()].sort(), Object.keys(EXPECTED).sort());
  assert.equal(limits.length, plans.length);
  plans.forEach(assertAudit);
  limits.forEach(assertAudit);

  Object.entries(EXPECTED).forEach(([code, expected]) => {
    const plan = plansByCode.get(code);
    assert.ok(plan, `${code} plan should exist`);
    assert.equal(plan.key, expected.key);
    assert.equal(plan.code, code);
    assert.equal(plan.displayName, expected.displayName);
    assert.equal(plan.monthlyPriceCents, expected.monthlyPriceCents);
    assert.equal(plan.currency, "USD");
    assert.equal(plan.billingInterval, "month");
    assert.equal(plan.isPublic, expected.isPublic);
    assert.equal(plan.requiresInvitation, expected.requiresInvitation);
    assert.equal(plan.isFounding, expected.isFounding);
    assert.equal(plan.basePlanCode, expected.basePlanCode);
    assert.equal(plan.revenueShareBps, expected.revenueShareBps);
    assert.equal(plan.purchasedCreditBonusBps, expected.purchasedCreditBonusBps);
    assert.equal(plan.foundingMemberLimit, expected.foundingMemberLimit);
    assert.equal(plan.active, true);

    const limit = limitForPlan(limits, plan);
    assert.ok(limit, `${code} limits should exist`);
    assert.equal(limit.key, expected.limitsKey);
    assert.equal(limit.storageMb, expected.limits.storageMb);
    assert.equal(limit.monthlyAiCredits, expected.limits.monthlyAiCredits);
    assert.equal(limit.publishExperienceLimit, expected.limits.publishExperienceLimit);
    assert.equal(limit.maxTeamMembers, expected.limits.maxTeamMembers);
    assert.equal(limit.collaborationEnabled, expected.limits.collaborationEnabled);
    assert.equal(limit.marketplaceBrowseEnabled, true);
    assert.equal(limit.marketplaceBuyEnabled, true);
    assert.equal(limit.marketplaceFreeDownloadEnabled, true);
    assert.equal(limit.marketplaceSellEnabled, expected.limits.marketplaceSellEnabled);
    assert.equal(limit.analyticsTier, expected.limits.analyticsTier);
  });
});

test("founding data model is ready for first-100 assignment without seeded assignments", () => {
  const tables = createServerSeedTables();
  const plansByCode = byCode(tables.membership_plans || []);
  const foundingPlans = [plansByCode.get("FOUNDING_CREATOR"), plansByCode.get("FOUNDING_STUDIO")];

  foundingPlans.forEach((plan) => {
    assert.equal(plan.isFounding, true);
    assert.equal(plan.foundingMemberLimit, 100);
    assert.equal(plan.active, true);
  });
  assert.deepEqual(tables.founding_members, []);
});

test("membership tables are registered as provider product tables", () => {
  ["membership_plans", "membership_limits", "founding_members"].forEach((tableName) => {
    assert.equal(SUPABASE_POSTGRES_PRODUCT_TABLES.includes(tableName), true, `${tableName} should be a product table`);
  });
});
