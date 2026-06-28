import {
  MarketplaceEntitlementError,
  assertMarketplacePermission,
  readMarketplaceEntitlements,
} from "./marketplace-entitlement-service.mjs";

export class MarketplaceRevenueError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "MarketplaceRevenueError";
    this.statusCode = statusCode;
  }
}

const MONEY_INPUTS = Object.freeze([
  "saleAmountCents",
  "processingFeesCents",
  "taxesCents",
  "refundsCents",
  "chargebacksCents",
  "requiredDeductionsCents",
]);

const DEDUCTION_FIELDS = Object.freeze([
  Object.freeze({ field: "processingFeesCents", label: "Processing fees" }),
  Object.freeze({ field: "taxesCents", label: "Taxes" }),
  Object.freeze({ field: "refundsCents", label: "Refunds" }),
  Object.freeze({ field: "chargebacksCents", label: "Chargebacks" }),
  Object.freeze({ field: "requiredDeductionsCents", label: "Required deductions" }),
]);

function timestamp(options = {}) {
  return options.now || new Date().toISOString();
}

function integerMoneyInput(body, field) {
  if (!Object.hasOwn(body, field)) {
    throw new MarketplaceRevenueError(`Marketplace revenue calculation requires explicit ${field}.`);
  }
  const value = Number(body[field]);
  if (!Number.isInteger(value) || value < 0) {
    throw new MarketplaceRevenueError(`${field} must be a non-negative integer cent amount.`);
  }
  return value;
}

function moneyInputs(body) {
  return Object.fromEntries(MONEY_INPUTS.map((field) => [field, integerMoneyInput(body, field)]));
}

function percentLabel(bps) {
  const value = Number(bps || 0) / 100;
  return `${Number.isInteger(value) ? value : value.toFixed(2)}%`;
}

function deductionRows(inputs) {
  return DEDUCTION_FIELDS.map((entry) => ({
    ...entry,
    amountCents: inputs[entry.field],
  }));
}

function shareBpsFromEntitlements(entitlements) {
  const bps = Number(entitlements.activeMembership?.plan?.revenueShareBps);
  if (!Number.isInteger(bps) || bps < 0 || bps > 10000) {
    throw new MarketplaceRevenueError("Active membership revenue share is missing or invalid.", 500);
  }
  return bps;
}

export function readMarketplaceSellerRevenueModel(tables, body = {}) {
  const entitlements = readMarketplaceEntitlements(tables, body);
  const sellAllowed = entitlements.permissions.sell.allowed === true;
  const revenueShareBps = sellAllowed ? shareBpsFromEntitlements(entitlements) : 0;
  return {
    deductionCategories: DEDUCTION_FIELDS.map((entry) => ({ ...entry })),
    eligible: sellAllowed,
    previewAvailable: false,
    previewDiagnostic: "Revenue previews require explicit sale, fee, tax, refund, chargeback, and deduction inputs.",
    revenueShareBps,
    shareLabel: sellAllowed ? `${percentLabel(revenueShareBps)} of Net Revenue` : "",
    sourceField: "membership_plans.revenueShareBps",
    sourceTables: ["membership_plans", "membership_limits", "user_memberships"],
    status: sellAllowed ? "PASS" : "WARN",
  };
}

export function calculateMarketplaceRevenue(tables, body = {}, options = {}) {
  try {
    assertMarketplacePermission(tables, {
      action: "sell",
      userKey: body.sellerUserKey || body.userKey,
    });
  } catch (error) {
    if (error instanceof MarketplaceEntitlementError) {
      throw new MarketplaceRevenueError(error.message, error.statusCode || 403);
    }
    throw error;
  }
  const inputs = moneyInputs(body);
  const entitlements = readMarketplaceEntitlements(tables, { userKey: body.sellerUserKey || body.userKey });
  const revenueShareBps = shareBpsFromEntitlements(entitlements);
  const deductionsTotalCents = DEDUCTION_FIELDS.reduce((total, entry) => total + inputs[entry.field], 0);
  const netRevenueCents = inputs.saleAmountCents - deductionsTotalCents;
  const payableNetRevenueCents = Math.max(0, netRevenueCents);
  const creatorRevenueCents = Math.floor(payableNetRevenueCents * revenueShareBps / 10000);
  const platformRevenueCents = payableNetRevenueCents - creatorRevenueCents;
  return {
    calculationTimestamp: timestamp(options),
    creatorRevenueCents,
    deductions: deductionRows(inputs),
    deductionsTotalCents,
    grossSaleAmountCents: inputs.saleAmountCents,
    negativeNetRevenueAdjustmentCents: Math.min(0, netRevenueCents),
    netRevenueCents,
    payableNetRevenueCents,
    platformRevenueCents,
    revenueShareBps,
    sellerUserKey: body.sellerUserKey || body.userKey,
    sourceField: "membership_plans.revenueShareBps",
    sourceTables: ["membership_plans", "membership_limits", "user_memberships"],
    status: "PASS",
  };
}

