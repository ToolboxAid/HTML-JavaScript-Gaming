export class MarketplaceEntitlementError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "MarketplaceEntitlementError";
    this.statusCode = statusCode;
  }
}

const ACTION_FIELD = Object.freeze({
  browse: "marketplaceBrowseEnabled",
  buy: "marketplaceBuyEnabled",
  freeDownload: "marketplaceFreeDownloadEnabled",
  sell: "marketplaceSellEnabled",
});

function tableRows(tables, tableName) {
  if (!tables || typeof tables !== "object") {
    throw new MarketplaceEntitlementError("Marketplace entitlements require database tables.", 500);
  }
  if (!Array.isArray(tables[tableName])) {
    tables[tableName] = [];
  }
  return tables[tableName];
}

function activeUser(tables, userKey) {
  if (!userKey) {
    return null;
  }
  const user = tableRows(tables, "users").find((row) => row.key === userKey && row.isActive !== false);
  if (!user) {
    throw new MarketplaceEntitlementError(`Marketplace user ${userKey} was not found.`, 404);
  }
  return user;
}

function activeMembershipSnapshot(tables, userKey) {
  if (!userKey) {
    return null;
  }
  activeUser(tables, userKey);
  const memberships = tableRows(tables, "user_memberships")
    .filter((row) => row.userKey === userKey && row.status === "active");
  if (memberships.length === 0) {
    return {
      diagnostic: `Active membership for ${userKey} was not found. Selling requires Creator or higher membership.`,
      missing: true,
    };
  }
  if (memberships.length > 1) {
    throw new MarketplaceEntitlementError(`User ${userKey} has multiple active memberships.`, 409);
  }
  const membership = memberships[0];
  const plan = tableRows(tables, "membership_plans").find((row) => row.key === membership.planKey && row.active !== false);
  if (!plan) {
    throw new MarketplaceEntitlementError(`Membership plan ${membership.planKey || "missing"} was not found.`, 404);
  }
  const limits = tableRows(tables, "membership_limits").find((row) => row.planKey === plan.key);
  if (!limits) {
    throw new MarketplaceEntitlementError(`Membership limits for ${plan.code} were not found.`, 500);
  }
  return {
    limits: { ...limits },
    membership: { ...membership },
    plan: { ...plan },
  };
}

function deniedForGuest(action) {
  if (action === "browse") {
    return "Marketplace browsing is available without signing in.";
  }
  if (action === "sell") {
    return "Sign in with Creator or higher membership to sell marketplace assets.";
  }
  return "Sign in with a platform account to use this marketplace action.";
}

function allowedDiagnostic(action) {
  if (action === "sell") {
    return "Active membership allows selling marketplace assets.";
  }
  if (action === "freeDownload") {
    return "Active membership allows downloading free marketplace assets.";
  }
  if (action === "buy") {
    return "Active membership allows buying marketplace assets.";
  }
  return "Marketplace browsing is available.";
}

function deniedDiagnostic(action, snapshot) {
  if (snapshot?.missing) {
    return snapshot.diagnostic;
  }
  if (!snapshot) {
    return deniedForGuest(action);
  }
  if (action === "sell") {
    return "Creator or higher membership is required to sell marketplace assets.";
  }
  return "Marketplace action is unavailable for the active membership.";
}

function permission(action, snapshot) {
  if (action === "browse") {
    return {
      allowed: true,
      diagnostic: allowedDiagnostic(action),
      requiredMembership: "",
      sourceField: ACTION_FIELD[action],
    };
  }
  const allowed = Boolean(snapshot?.limits?.[ACTION_FIELD[action]]);
  return {
    allowed,
    diagnostic: allowed ? allowedDiagnostic(action) : deniedDiagnostic(action, snapshot),
    requiredMembership: action === "sell" ? "Creator or higher" : "Platform account",
    sourceField: ACTION_FIELD[action],
  };
}

function normalizedAction(value) {
  const action = String(value || "").trim();
  if (action === "free-download" || action === "free_download") {
    return "freeDownload";
  }
  if (Object.hasOwn(ACTION_FIELD, action)) {
    return action;
  }
  throw new MarketplaceEntitlementError(`Marketplace action ${action || "missing"} is not supported.`, 400);
}

export function readMarketplaceEntitlements(tables, body = {}) {
  const userKey = String(body.userKey || "").trim();
  const snapshot = activeMembershipSnapshot(tables, userKey);
  const permissions = {
    browse: permission("browse", snapshot),
    buy: permission("buy", snapshot),
    freeDownload: permission("freeDownload", snapshot),
    sell: permission("sell", snapshot),
  };
  return {
    activeMembership: snapshot?.missing ? null : snapshot,
    authenticated: Boolean(userKey),
    currentUserKey: userKey,
    permissions,
    sourceTables: ["membership_limits", "user_memberships", "membership_plans"],
    status: snapshot?.missing ? "WARN" : "PASS",
  };
}

export function assertMarketplacePermission(tables, body = {}) {
  const action = normalizedAction(body.action);
  const entitlements = readMarketplaceEntitlements(tables, body);
  const currentPermission = entitlements.permissions[action];
  if (!currentPermission?.allowed) {
    throw new MarketplaceEntitlementError(currentPermission?.diagnostic || "Marketplace action is not allowed.", 403);
  }
  return {
    action,
    permission: currentPermission,
    status: "PASS",
  };
}

