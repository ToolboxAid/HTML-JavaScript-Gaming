import { resolveActiveUserMembership } from "../memberships/membership-assignment-service.mjs";
import { SEED_DB_KEYS } from "../seed/seed-db-keys.mjs";

export class AiCreditError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AiCreditError";
    this.statusCode = statusCode;
  }
}

function tableRows(tables, tableName) {
  if (!tables || typeof tables !== "object") {
    throw new AiCreditError("AI credit service requires database tables.", 500);
  }
  if (!Array.isArray(tables[tableName])) {
    tables[tableName] = [];
  }
  return tables[tableName];
}

function timestamp(options = {}) {
  return options.now || new Date().toISOString();
}

function createKey(options = {}) {
  if (typeof options.createKey === "function") {
    return options.createKey();
  }
  throw new AiCreditError("AI credit service requires a key generator.", 500);
}

function periodEnd(periodStart) {
  const date = new Date(periodStart);
  date.setUTCMonth(date.getUTCMonth() + 1);
  return date.toISOString();
}

function totalBalance(row) {
  return Number(row.includedBalance || 0) + Number(row.purchasedBalance || 0) + Number(row.bonusBalance || 0);
}

function displayAccount(row) {
  if (!row) {
    return null;
  }
  return {
    ...row,
    totalBalance: totalBalance(row),
  };
}

function sortedActivePacks(tables, bonusBps) {
  return tableRows(tables, "ai_credit_packs")
    .filter((row) => row.active !== false)
    .map((row) => {
      const credits = Number(row.credits || 0);
      const bonusCredits = Math.floor(credits * Number(bonusBps || 0) / 10000);
      return {
        ...row,
        bonusCredits,
        effectiveCredits: credits + bonusCredits,
      };
    })
    .sort((left, right) => Number(left.credits || 0) - Number(right.credits || 0));
}

function actionByKey(tables) {
  return new Map(tableRows(tables, "ai_actions").map((row) => [row.key, row]));
}

function recentUsageRows(tables, userKey, limit = 10) {
  const actions = actionByKey(tables);
  return tableRows(tables, "ai_usage_log")
    .filter((row) => row.userKey === userKey)
    .map((row) => {
      const action = row.actionKey ? actions.get(row.actionKey) : null;
      return {
        ...row,
        actionCode: action?.code || "",
        actionName: action?.displayName || "",
        actionCost: action ? Number(action.creditCost || 0) : null,
      };
    })
    .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")))
    .slice(0, limit);
}

function assertExistingActiveMembership(tables, userKey) {
  const activeRows = tableRows(tables, "user_memberships")
    .filter((row) => row.userKey === userKey && row.status === "active");
  if (activeRows.length === 0) {
    throw new AiCreditError(`Active membership for ${userKey} was not found.`, 404);
  }
}

function activeAction(tables, actionCode) {
  const code = String(actionCode || "").trim().toUpperCase();
  if (!code) {
    throw new AiCreditError("AI action debit requires an action code.");
  }
  const action = tableRows(tables, "ai_actions").find((row) => row.code === code && row.active !== false);
  if (!action) {
    throw new AiCreditError(`AI action ${code} was not found.`, 404);
  }
  return action;
}

function activePack(tables, packCode) {
  const code = String(packCode || "").trim().toUpperCase();
  if (!code) {
    throw new AiCreditError("AI credit purchase requires a pack code.");
  }
  const pack = tableRows(tables, "ai_credit_packs").find((row) => row.code === code && row.active !== false);
  if (!pack) {
    throw new AiCreditError(`AI credit pack ${code} was not found.`, 404);
  }
  return pack;
}

function usageLog(tables, body, options = {}) {
  const value = timestamp(options);
  const row = {
    actionKey: body.actionKey || "",
    balanceAfter: body.balanceAfter,
    createdAt: value,
    createdBy: options.actorKey || body.userKey || SEED_DB_KEYS.users.admin,
    creditDelta: body.creditDelta,
    key: createKey(options),
    sourceKey: body.sourceKey || "",
    sourceType: body.sourceType,
    userKey: body.userKey,
  };
  tableRows(tables, "ai_usage_log").push(row);
  return row;
}

function creditAccount(tables, userKey, options = {}) {
  const key = String(userKey || "").trim();
  if (!key) {
    throw new AiCreditError("AI credit account requires a user key.");
  }
  let row = tableRows(tables, "user_ai_credits").find((account) => account.userKey === key);
  if (row) {
    return row;
  }
  const value = timestamp(options);
  row = {
    bonusBalance: 0,
    createdAt: value,
    createdBy: options.actorKey || SEED_DB_KEYS.users.admin,
    includedBalance: 0,
    key: createKey(options),
    periodEnd: periodEnd(value),
    periodStart: value,
    purchasedBalance: 0,
    updatedAt: value,
    updatedBy: options.actorKey || SEED_DB_KEYS.users.admin,
    userKey: key,
  };
  tableRows(tables, "user_ai_credits").push(row);
  return row;
}

function updateAudit(row, options = {}) {
  row.updatedAt = timestamp(options);
  row.updatedBy = options.actorKey || SEED_DB_KEYS.users.admin;
}

function debitFromBalances(account, amount) {
  let remaining = amount;
  const includedDebit = Math.min(account.includedBalance, remaining);
  account.includedBalance -= includedDebit;
  remaining -= includedDebit;
  const purchasedDebit = Math.min(account.purchasedBalance, remaining);
  account.purchasedBalance -= purchasedDebit;
  remaining -= purchasedDebit;
  const bonusDebit = Math.min(account.bonusBalance, remaining);
  account.bonusBalance -= bonusDebit;
  remaining -= bonusDebit;
  if (remaining > 0) {
    throw new AiCreditError("AI credit debit could not be balanced.", 500);
  }
}

export function grantMonthlyAiCredits(tables, body = {}, options = {}) {
  const active = resolveActiveUserMembership(tables, { userKey: body.userKey }, options);
  const monthlyCredits = Number(active.limits.monthlyAiCredits || 0);
  const account = creditAccount(tables, body.userKey, options);
  account.includedBalance = monthlyCredits;
  account.periodStart = timestamp(options);
  account.periodEnd = periodEnd(account.periodStart);
  updateAudit(account, options);
  if (monthlyCredits > 0) {
    usageLog(tables, {
      balanceAfter: totalBalance(account),
      creditDelta: monthlyCredits,
      sourceKey: active.membership.key,
      sourceType: "monthly_grant",
      userKey: body.userKey,
    }, options);
  }
  return {
    account: { ...account },
    activeMembership: active,
    grantedCredits: monthlyCredits,
    status: "PASS",
  };
}

export function purchaseAiCreditPack(tables, body = {}, options = {}) {
  const pack = activePack(tables, body.packCode);
  const active = resolveActiveUserMembership(tables, { userKey: body.userKey }, options);
  const bonusBps = Number(active.plan.purchasedCreditBonusBps || 0);
  const bonusCredits = Math.floor(Number(pack.credits || 0) * bonusBps / 10000);
  const account = creditAccount(tables, body.userKey, options);
  account.purchasedBalance += Number(pack.credits || 0);
  account.bonusBalance += bonusCredits;
  updateAudit(account, options);
  usageLog(tables, {
    balanceAfter: totalBalance(account),
    creditDelta: Number(pack.credits || 0),
    sourceKey: pack.key,
    sourceType: "purchase",
    userKey: body.userKey,
  }, options);
  if (bonusCredits > 0) {
    usageLog(tables, {
      balanceAfter: totalBalance(account),
      creditDelta: bonusCredits,
      sourceKey: active.plan.key,
      sourceType: "studio_bonus",
      userKey: body.userKey,
    }, options);
  }
  return {
    account: { ...account },
    bonusCredits,
    pack: { ...pack },
    status: "PASS",
  };
}

export function debitAiCreditsForAction(tables, body = {}, options = {}) {
  const action = activeAction(tables, body.actionCode);
  const cost = Number(action.creditCost || 0);
  const account = creditAccount(tables, body.userKey, options);
  if (totalBalance(account) < cost) {
    throw new AiCreditError(`Insufficient AI credits for ${action.code}.`, 402);
  }
  debitFromBalances(account, cost);
  updateAudit(account, options);
  usageLog(tables, {
    actionKey: action.key,
    balanceAfter: totalBalance(account),
    creditDelta: -cost,
    sourceKey: action.key,
    sourceType: "action_debit",
    userKey: body.userKey,
  }, options);
  return {
    account: { ...account },
    action: { ...action },
    debitedCredits: cost,
    status: "PASS",
  };
}

export function readAiCreditDisplay(tables, body = {}, options = {}) {
  const userKey = String(body.userKey || "").trim();
  if (!userKey) {
    throw new AiCreditError("Sign in required to view AI credits.", 401);
  }
  assertExistingActiveMembership(tables, userKey);
  const active = resolveActiveUserMembership(tables, { userKey }, options);
  const account = tableRows(tables, "user_ai_credits").find((row) => row.userKey === userKey) || null;
  const bonusBps = Number(active.plan.purchasedCreditBonusBps || 0);
  const monthlyCredits = Number(active.limits.monthlyAiCredits || 0);
  return {
    account: displayAccount(account),
    accountDiagnostic: account
      ? "Loaded AI credit balance from user_ai_credits."
      : "No AI credit balance record exists yet. Run the monthly grant or purchase flow before displaying a numeric balance.",
    activeMembership: active,
    currentUserKey: userKey,
    monthlyGrant: {
      credits: monthlyCredits,
      periodEnd: account?.periodEnd || "",
      periodStart: account?.periodStart || "",
    },
    packs: sortedActivePacks(tables, bonusBps),
    planBonusBps: bonusBps,
    sourceTables: [
      "user_ai_credits",
      "ai_usage_log",
      "ai_credit_packs",
      "ai_actions",
      "membership_plans",
      "membership_limits",
      "user_memberships",
    ],
    status: account ? "PASS" : "WARN",
    usage: recentUsageRows(tables, userKey, options.usageLimit || 10),
  };
}
