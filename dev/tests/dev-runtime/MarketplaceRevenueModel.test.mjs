import test from "node:test";
import assert from "node:assert/strict";
import { calculateMarketplaceRevenue, readMarketplaceSellerRevenueModel } from "../../../api/marketplace/marketplace-revenue-service.mjs";
import { assignUserMembership } from "../../../api/memberships/membership-assignment-service.mjs";
import { SEED_DB_KEYS, makeSeedUlid } from "../../../api/seed/seed-db-keys.mjs";
import { createServerSeedTables } from "../../../api/seed/server-seed-loader.mjs";

function createKeyFactory(start = 1800) {
  let sequence = start;
  return () => makeSeedUlid(sequence++);
}

function options(start = 1800) {
  return {
    actorKey: SEED_DB_KEYS.users.admin,
    createKey: createKeyFactory(start),
    now: "2026-06-18T12:00:00.000Z",
  };
}

function assignCreator(tables) {
  return assignUserMembership(tables, {
    externalSubscriptionId: "sub_creator_revenue_model",
    planCode: "CREATOR",
    source: "paid",
    userKey: SEED_DB_KEYS.users.user1,
  }, options());
}

function revenueInput(overrides = {}) {
  return {
    chargebacksCents: 0,
    processingFeesCents: 0,
    refundsCents: 0,
    requiredDeductionsCents: 0,
    saleAmountCents: 10000,
    sellerUserKey: SEED_DB_KEYS.users.user1,
    taxesCents: 0,
    ...overrides,
  };
}

test("seller revenue model reads 80 percent share from membership plan bps", () => {
  const tables = createServerSeedTables();
  assignCreator(tables);
  const model = readMarketplaceSellerRevenueModel(tables, { userKey: SEED_DB_KEYS.users.user1 });
  assert.equal(model.revenueShareBps, 8000);
  assert.equal(model.shareLabel, "80% of Net Revenue");
  assert.equal(model.sourceField, "membership_plans.revenueShareBps");
  assert.deepEqual(model.deductionCategories.map((row) => row.field), [
    "processingFeesCents",
    "taxesCents",
    "refundsCents",
    "chargebacksCents",
    "requiredDeductionsCents",
  ]);
});

test("creator payout is calculated from Net Revenue, not gross sale amount", () => {
  const tables = createServerSeedTables();
  assignCreator(tables);
  const revenue = calculateMarketplaceRevenue(tables, revenueInput({
    processingFeesCents: 300,
    taxesCents: 700,
  }), options(1810));
  assert.equal(revenue.grossSaleAmountCents, 10000);
  assert.equal(revenue.deductionsTotalCents, 1000);
  assert.equal(revenue.netRevenueCents, 9000);
  assert.equal(revenue.revenueShareBps, 8000);
  assert.equal(revenue.creatorRevenueCents, 7200);
  assert.equal(revenue.platformRevenueCents, 1800);
});

test("refunds reduce Net Revenue before creator payout", () => {
  const tables = createServerSeedTables();
  assignCreator(tables);
  const revenue = calculateMarketplaceRevenue(tables, revenueInput({
    refundsCents: 2000,
  }), options(1820));
  assert.equal(revenue.netRevenueCents, 8000);
  assert.equal(revenue.creatorRevenueCents, 6400);
  assert.equal(revenue.deductions.find((row) => row.field === "refundsCents").amountCents, 2000);
});

test("chargebacks and required deductions reduce Net Revenue before creator payout", () => {
  const tables = createServerSeedTables();
  assignCreator(tables);
  const revenue = calculateMarketplaceRevenue(tables, revenueInput({
    chargebacksCents: 5000,
    requiredDeductionsCents: 1000,
  }), options(1830));
  assert.equal(revenue.netRevenueCents, 4000);
  assert.equal(revenue.creatorRevenueCents, 3200);
  assert.equal(revenue.deductions.find((row) => row.field === "chargebacksCents").amountCents, 5000);
});

test("negative Net Revenue does not create a positive creator payout", () => {
  const tables = createServerSeedTables();
  assignCreator(tables);
  const revenue = calculateMarketplaceRevenue(tables, revenueInput({
    refundsCents: 2000,
    saleAmountCents: 1000,
  }), options(1840));
  assert.equal(revenue.netRevenueCents, -1000);
  assert.equal(revenue.payableNetRevenueCents, 0);
  assert.equal(revenue.creatorRevenueCents, 0);
  assert.equal(revenue.platformRevenueCents, 0);
  assert.equal(revenue.negativeNetRevenueAdjustmentCents, -1000);
});

test("Free users cannot create marketplace seller revenue", () => {
  const tables = createServerSeedTables();
  assert.throws(() => calculateMarketplaceRevenue(tables, revenueInput(), options(1850)), /Creator or higher/);
});

