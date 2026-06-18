const PLAN_DISPLAY_ORDER = Object.freeze(["FREE", "CREATOR", "STUDIO", "BETA", "FOUNDING_CREATOR", "FOUNDING_STUDIO"]);

export class OwnerAiCreditSettingsError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "OwnerAiCreditSettingsError";
    this.statusCode = statusCode;
  }
}

function tableRows(tables, tableName) {
  if (!tables || typeof tables !== "object") {
    throw new OwnerAiCreditSettingsError("Owner AI credit settings require database tables.", 500);
  }
  if (!Array.isArray(tables[tableName])) {
    throw new OwnerAiCreditSettingsError(`${tableName} table is required for Owner AI credit settings.`, 500);
  }
  return tables[tableName];
}

function requireOwnerSession(session = {}) {
  if (session.isOwner !== true || !session.userKey) {
    throw new OwnerAiCreditSettingsError("Owner role required to manage AI credit settings.", 403);
  }
  return session;
}

function timestamp(options = {}) {
  return options.now || new Date().toISOString();
}

function normalizedCode(value, label) {
  const code = String(value || "").trim().toUpperCase();
  if (!code) {
    throw new OwnerAiCreditSettingsError(`${label} code is required.`);
  }
  return code;
}

function normalizedText(value, label) {
  const text = String(value || "").trim();
  if (!text) {
    throw new OwnerAiCreditSettingsError(`${label} is required.`);
  }
  return text;
}

function integerField(value, label, options = {}) {
  const number = Number(value);
  const min = Number.isInteger(options.min) ? options.min : 0;
  const max = Number.isInteger(options.max) ? options.max : Number.MAX_SAFE_INTEGER;
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new OwnerAiCreditSettingsError(`${label} must be an integer from ${min} to ${max}.`);
  }
  return number;
}

function basisPoints(value, label) {
  return integerField(value, label, { max: 10000, min: 0 });
}

function booleanField(value, label) {
  if (typeof value !== "boolean") {
    throw new OwnerAiCreditSettingsError(`${label} must be true or false.`);
  }
  return value;
}

function applyAudit(row, actorKey, value) {
  row.updatedAt = value;
  row.updatedBy = actorKey;
}

function planSort(left, right) {
  const leftIndex = PLAN_DISPLAY_ORDER.indexOf(left.code);
  const rightIndex = PLAN_DISPLAY_ORDER.indexOf(right.code);
  return (leftIndex === -1 ? PLAN_DISPLAY_ORDER.length : leftIndex) -
    (rightIndex === -1 ? PLAN_DISPLAY_ORDER.length : rightIndex) ||
    String(left.displayName || left.code).localeCompare(String(right.displayName || right.code));
}

function planByCode(tables, planCode) {
  const code = normalizedCode(planCode, "Membership plan");
  const plan = tableRows(tables, "membership_plans").find((row) => row.code === code);
  if (!plan) {
    throw new OwnerAiCreditSettingsError(`Membership plan ${code} was not found.`, 404);
  }
  return plan;
}

function limitsForPlan(tables, plan) {
  const limits = tableRows(tables, "membership_limits").find((row) => row.planKey === plan.key);
  if (!limits) {
    throw new OwnerAiCreditSettingsError(`Membership limits for ${plan.code} were not found.`, 500);
  }
  return limits;
}

function recordByKeyOrCode(rows, body, label) {
  const key = String(body.key || "").trim();
  const code = String(body.code || "").trim().toUpperCase();
  const record = rows.find((row) => key && row.key === key) || rows.find((row) => code && row.code === code);
  if (!record) {
    throw new OwnerAiCreditSettingsError(`${label} ${key || code || "missing"} was not found.`, 404);
  }
  return record;
}

function assertUniqueCode(rows, record, code, label) {
  const duplicate = rows.find((row) => row.key !== record.key && row.code === code);
  if (duplicate) {
    throw new OwnerAiCreditSettingsError(`Duplicate ${label} code ${code} is not allowed.`);
  }
}

function readMonthlyGrants(tables) {
  return tableRows(tables, "membership_plans")
    .slice()
    .sort(planSort)
    .map((plan) => ({
      displayName: plan.displayName || plan.code,
      monthlyAiCredits: limitsForPlan(tables, plan).monthlyAiCredits,
      planCode: plan.code,
      planKey: plan.key,
    }));
}

function readBonusPlans(tables) {
  return tableRows(tables, "membership_plans")
    .slice()
    .sort(planSort)
    .map((plan) => ({
      displayName: plan.displayName || plan.code,
      planCode: plan.code,
      planKey: plan.key,
      purchasedCreditBonusBps: plan.purchasedCreditBonusBps,
    }));
}

export function readOwnerAiCreditSettings(tables, options = {}) {
  const session = requireOwnerSession(options.session);
  return {
    actions: tableRows(tables, "ai_actions")
      .map((row) => ({ ...row }))
      .sort((left, right) => String(left.code || "").localeCompare(String(right.code || ""))),
    bonusPlans: readBonusPlans(tables),
    monthlyGrants: readMonthlyGrants(tables),
    ownerUserKey: session.userKey,
    packs: tableRows(tables, "ai_credit_packs")
      .map((row) => ({ ...row }))
      .sort((left, right) => Number(left.credits || 0) - Number(right.credits || 0)),
    sourceTables: ["ai_actions", "ai_credit_packs", "membership_limits", "membership_plans"],
    status: "PASS",
  };
}

export function updateOwnerAiCreditSettings(tables, body = {}, options = {}) {
  const session = requireOwnerSession(options.session);
  const kind = String(body.kind || "").trim();
  const value = timestamp(options);
  if (kind === "pack") {
    const rows = tableRows(tables, "ai_credit_packs");
    const pack = recordByKeyOrCode(rows, body.pack || {}, "AI credit pack");
    const code = normalizedCode(body.pack?.code ?? pack.code, "AI credit pack");
    assertUniqueCode(rows, pack, code, "AI credit pack");
    pack.code = code;
    pack.displayName = normalizedText(body.pack?.displayName ?? pack.displayName, "AI credit pack display name");
    pack.credits = integerField(body.pack?.credits ?? pack.credits, "Pack credits", { min: 0 });
    pack.priceCents = integerField(body.pack?.priceCents ?? pack.priceCents, "Pack price cents", { min: 0 });
    pack.active = booleanField(body.pack?.active ?? pack.active, "Pack active state");
    applyAudit(pack, session.userKey, value);
    return {
      ...readOwnerAiCreditSettings(tables, { session }),
      audit: { updatedAt: value, updatedBy: session.userKey },
      diagnostic: `Updated ${pack.code} AI credit pack.`,
      updatedKind: kind,
    };
  }
  if (kind === "action") {
    const rows = tableRows(tables, "ai_actions");
    const action = recordByKeyOrCode(rows, body.action || {}, "AI action");
    const code = normalizedCode(body.action?.code ?? action.code, "AI action");
    assertUniqueCode(rows, action, code, "AI action");
    action.code = code;
    action.displayName = normalizedText(body.action?.displayName ?? action.displayName, "AI action display name");
    action.creditCost = integerField(body.action?.creditCost ?? action.creditCost, "AI action cost", { min: 0 });
    action.active = booleanField(body.action?.active ?? action.active, "AI action active state");
    applyAudit(action, session.userKey, value);
    return {
      ...readOwnerAiCreditSettings(tables, { session }),
      audit: { updatedAt: value, updatedBy: session.userKey },
      diagnostic: `Updated ${action.code} AI action.`,
      updatedKind: kind,
    };
  }
  if (kind === "monthlyGrant") {
    const plan = planByCode(tables, body.planCode);
    const limits = limitsForPlan(tables, plan);
    limits.monthlyAiCredits = integerField(body.monthlyAiCredits, "Monthly AI credits", { min: 0 });
    applyAudit(limits, session.userKey, value);
    return {
      ...readOwnerAiCreditSettings(tables, { session }),
      audit: { updatedAt: value, updatedBy: session.userKey },
      diagnostic: `Updated ${plan.code} monthly AI credits.`,
      updatedKind: kind,
    };
  }
  if (kind === "bonus") {
    const plan = planByCode(tables, body.planCode);
    plan.purchasedCreditBonusBps = basisPoints(body.purchasedCreditBonusBps, "Purchased credit bonus basis points");
    applyAudit(plan, session.userKey, value);
    return {
      ...readOwnerAiCreditSettings(tables, { session }),
      audit: { updatedAt: value, updatedBy: session.userKey },
      diagnostic: `Updated ${plan.code} purchased credit bonus.`,
      updatedKind: kind,
    };
  }
  throw new OwnerAiCreditSettingsError("Owner AI credit update kind must be pack, action, monthlyGrant, or bonus.");
}
