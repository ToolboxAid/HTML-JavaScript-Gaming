const PLAN_DISPLAY_ORDER = Object.freeze(["FREE", "CREATOR", "STUDIO", "BETA", "FOUNDING_CREATOR", "FOUNDING_STUDIO"]);
const PLAN_BOOLEAN_FIELDS = Object.freeze(["active", "isPublic", "requiresInvitation", "isFounding"]);
const LIMIT_BOOLEAN_FIELDS = Object.freeze([
  "collaborationEnabled",
  "marketplaceBrowseEnabled",
  "marketplaceBuyEnabled",
  "marketplaceFreeDownloadEnabled",
  "marketplaceSellEnabled",
]);

export class OwnerMembershipSettingsError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "OwnerMembershipSettingsError";
    this.statusCode = statusCode;
  }
}

function tableRows(tables, tableName) {
  if (!tables || typeof tables !== "object") {
    throw new OwnerMembershipSettingsError("Owner membership settings require database tables.", 500);
  }
  if (!Array.isArray(tables[tableName])) {
    throw new OwnerMembershipSettingsError(`${tableName} table is required for Owner membership settings.`, 500);
  }
  return tables[tableName];
}

function requireOwnerSession(session = {}) {
  if (session.isOwner !== true || !session.userKey) {
    throw new OwnerMembershipSettingsError("Owner role required to manage membership settings.", 403);
  }
  return session;
}

function timestamp(options = {}) {
  return options.now || new Date().toISOString();
}

function normalizedPlanCode(value) {
  const planCode = String(value || "").trim().toUpperCase();
  if (!planCode) {
    throw new OwnerMembershipSettingsError("Owner membership update requires a plan code.");
  }
  return planCode;
}

function integerField(value, label, options = {}) {
  if ((value === "" || value === null || value === undefined) && options.nullable === true) {
    return null;
  }
  const number = Number(value);
  const min = Number.isInteger(options.min) ? options.min : 0;
  const max = Number.isInteger(options.max) ? options.max : Number.MAX_SAFE_INTEGER;
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new OwnerMembershipSettingsError(`${label} must be an integer from ${min} to ${max}.`);
  }
  return number;
}

function basisPoints(value, label) {
  return integerField(value, label, { max: 10000, min: 0 });
}

function booleanField(value, label) {
  if (typeof value !== "boolean") {
    throw new OwnerMembershipSettingsError(`${label} must be true or false.`);
  }
  return value;
}

function planByCode(tables, planCode) {
  const plan = tableRows(tables, "membership_plans").find((row) => row.code === planCode);
  if (!plan) {
    throw new OwnerMembershipSettingsError(`Membership plan ${planCode} was not found.`, 404);
  }
  return plan;
}

function limitsForPlan(tables, plan) {
  const limits = tableRows(tables, "membership_limits").find((row) => row.planKey === plan.key);
  if (!limits) {
    throw new OwnerMembershipSettingsError(`Membership limits for ${plan.code} were not found.`, 500);
  }
  return limits;
}

function planSort(left, right) {
  const leftIndex = PLAN_DISPLAY_ORDER.indexOf(left.code);
  const rightIndex = PLAN_DISPLAY_ORDER.indexOf(right.code);
  return (leftIndex === -1 ? PLAN_DISPLAY_ORDER.length : leftIndex) -
    (rightIndex === -1 ? PLAN_DISPLAY_ORDER.length : rightIndex) ||
    String(left.displayName || left.code).localeCompare(String(right.displayName || right.code));
}

function publicPlanEntry(tables, plan) {
  return {
    limits: { ...limitsForPlan(tables, plan) },
    plan: { ...plan },
  };
}

function activeFoundingPrices(tables, plansByKey) {
  return tableRows(tables, "founding_members")
    .filter((row) => row.active === true)
    .sort((left, right) => Number(left.sequenceNumber || 0) - Number(right.sequenceNumber || 0))
    .map((row) => ({
      key: row.key || "",
      lockedMonthlyPriceCents: row.lockedMonthlyPriceCents,
      planCode: plansByKey.get(row.planKey)?.code || "",
      planKey: row.planKey || "",
      sequenceNumber: row.sequenceNumber,
      userKey: row.userKey || "",
    }));
}

function foundingProgramState(tables) {
  const foundingPlans = tableRows(tables, "membership_plans").filter((row) => row.isFounding === true);
  const capacityLimit = foundingPlans.reduce((limit, plan) => Math.max(limit, Number(plan.foundingMemberLimit || 0)), 0);
  const foundingMembers = tableRows(tables, "founding_members");
  const plansByKey = new Map(tableRows(tables, "membership_plans").map((plan) => [plan.key, plan]));
  return {
    activeCount: foundingMembers.filter((row) => row.active === true).length,
    assignedSequenceCount: new Set(foundingMembers
      .map((row) => Number(row.sequenceNumber))
      .filter((sequenceNumber) => Number.isInteger(sequenceNumber) && sequenceNumber > 0)).size,
    capacityLimit,
    lockedActivePrices: activeFoundingPrices(tables, plansByKey),
  };
}

function planPatch(body = {}) {
  const patch = {};
  if (Object.hasOwn(body, "monthlyPriceCents")) {
    patch.monthlyPriceCents = integerField(body.monthlyPriceCents, "Monthly price cents", { min: 0 });
  }
  if (Object.hasOwn(body, "revenueShareBps")) {
    patch.revenueShareBps = basisPoints(body.revenueShareBps, "Revenue share basis points");
  }
  if (Object.hasOwn(body, "purchasedCreditBonusBps")) {
    patch.purchasedCreditBonusBps = basisPoints(body.purchasedCreditBonusBps, "Purchased credit bonus basis points");
  }
  PLAN_BOOLEAN_FIELDS.forEach((field) => {
    if (Object.hasOwn(body, field)) {
      patch[field] = booleanField(body[field], field);
    }
  });
  return patch;
}

function limitPatch(plan, body = {}) {
  const patch = {};
  if (Object.hasOwn(body, "storageMb")) {
    patch.storageMb = integerField(body.storageMb, "Storage MB", { min: 0 });
  }
  if (Object.hasOwn(body, "monthlyAiCredits")) {
    patch.monthlyAiCredits = integerField(body.monthlyAiCredits, "Monthly AI credits", { min: 0 });
  }
  if (Object.hasOwn(body, "publishExperienceLimit")) {
    patch.publishExperienceLimit = integerField(body.publishExperienceLimit, "Publish limit", { min: 0, nullable: true });
  }
  if (Object.hasOwn(body, "maxTeamMembers")) {
    patch.maxTeamMembers = integerField(body.maxTeamMembers, "Team limit", { min: 1 });
  }
  LIMIT_BOOLEAN_FIELDS.forEach((field) => {
    if (Object.hasOwn(body, field)) {
      patch[field] = booleanField(body[field], field);
    }
  });
  if (plan.code === "FREE" && Object.hasOwn(patch, "publishExperienceLimit") && patch.publishExperienceLimit !== 1) {
    throw new OwnerMembershipSettingsError("Free membership publish limit must remain 1.");
  }
  return patch;
}

function applyPatch(row, patch, audit) {
  Object.assign(row, patch, {
    updatedAt: audit.updatedAt,
    updatedBy: audit.updatedBy,
  });
}

export function readOwnerMembershipSettings(tables, options = {}) {
  const session = requireOwnerSession(options.session);
  const plans = tableRows(tables, "membership_plans")
    .slice()
    .sort(planSort)
    .map((plan) => publicPlanEntry(tables, plan));
  return {
    foundingProgram: foundingProgramState(tables),
    ownerUserKey: session.userKey,
    plans,
    sourceTables: ["membership_plans", "membership_limits", "founding_members"],
    status: "PASS",
  };
}

export function updateOwnerMembershipSettings(tables, body = {}, options = {}) {
  const session = requireOwnerSession(options.session);
  const planCode = normalizedPlanCode(body.planCode || body.code);
  const plan = planByCode(tables, planCode);
  const limits = limitsForPlan(tables, plan);
  const planChanges = planPatch(body.plan || {});
  const limitChanges = limitPatch(plan, body.limits || {});
  const audit = {
    updatedAt: timestamp(options),
    updatedBy: session.userKey,
  };
  if (Object.keys(planChanges).length) {
    applyPatch(plan, planChanges, audit);
  }
  if (Object.keys(limitChanges).length) {
    applyPatch(limits, limitChanges, audit);
  }
  return {
    ...readOwnerMembershipSettings(tables, { session }),
    audit,
    diagnostic: `Updated ${plan.code} membership settings.`,
    updatedPlanCode: plan.code,
  };
}
