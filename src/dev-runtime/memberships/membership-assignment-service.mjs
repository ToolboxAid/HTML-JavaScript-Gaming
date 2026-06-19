import { SEED_DB_KEYS } from "../seed/seed-db-keys.mjs";

export const MEMBERSHIP_STATUSES = Object.freeze(["active", "pending", "canceled", "expired", "superseded"]);
export const MEMBERSHIP_SOURCES = Object.freeze(["free", "paid", "beta_invitation", "founding_paid", "admin_adjustment"]);

const FOUNDING_PLAN_CODES = new Set(["FOUNDING_CREATOR", "FOUNDING_STUDIO"]);
const PAID_PLAN_CODES = new Set(["CREATOR", "STUDIO"]);
const PLAN_DISPLAY_ORDER = Object.freeze(["FREE", "CREATOR", "STUDIO", "BETA", "FOUNDING_CREATOR", "FOUNDING_STUDIO"]);

export class MembershipAssignmentError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "MembershipAssignmentError";
    this.statusCode = statusCode;
  }
}

function tableRows(tables, tableName) {
  if (!tables || typeof tables !== "object") {
    throw new MembershipAssignmentError("Membership assignment requires database tables.", 500);
  }
  if (!Array.isArray(tables[tableName])) {
    tables[tableName] = [];
  }
  return tables[tableName];
}

function normalizedPlanCode(value) {
  const code = String(value || "").trim().toUpperCase();
  if (!code) {
    throw new MembershipAssignmentError("Membership assignment requires a plan code.");
  }
  return code;
}

function normalizedSource(value, planCode) {
  const source = String(value || "").trim().toLowerCase();
  if (source) {
    if (!MEMBERSHIP_SOURCES.includes(source)) {
      throw new MembershipAssignmentError(`Membership assignment source ${source} is not supported.`);
    }
    return source;
  }
  if (planCode === "FREE") {
    return "free";
  }
  if (planCode === "BETA") {
    return "beta_invitation";
  }
  if (FOUNDING_PLAN_CODES.has(planCode)) {
    return "founding_paid";
  }
  return "paid";
}

function timestamp(options = {}) {
  return options.now || new Date().toISOString();
}

function createKey(options = {}) {
  if (typeof options.createKey === "function") {
    return options.createKey();
  }
  throw new MembershipAssignmentError("Membership assignment requires a key generator.", 500);
}

function addOneMonth(isoTimestamp) {
  const date = new Date(isoTimestamp);
  date.setUTCMonth(date.getUTCMonth() + 1);
  return date.toISOString();
}

function activeUser(tables, userKey) {
  const key = String(userKey || "").trim();
  if (!key) {
    throw new MembershipAssignmentError("Membership assignment requires a user key.");
  }
  const user = tableRows(tables, "users").find((row) => row.key === key && row.isActive !== false);
  if (!user) {
    throw new MembershipAssignmentError(`Membership assignment user ${key} was not found.`, 404);
  }
  return user;
}

function planByCode(tables, planCode) {
  const plan = tableRows(tables, "membership_plans").find((row) => row.code === planCode && row.active !== false);
  if (!plan) {
    throw new MembershipAssignmentError(`Membership plan ${planCode} was not found.`, 404);
  }
  return plan;
}

function planByKey(tables, planKey) {
  const plan = tableRows(tables, "membership_plans").find((row) => row.key === planKey && row.active !== false);
  if (!plan) {
    throw new MembershipAssignmentError(`Membership plan key ${planKey || "missing"} was not found.`, 404);
  }
  return plan;
}

function limitsForPlan(tables, plan) {
  const limits = tableRows(tables, "membership_limits").find((row) => row.planKey === plan.key);
  if (!limits) {
    throw new MembershipAssignmentError(`Membership limits for ${plan.code} were not found.`, 500);
  }
  return limits;
}

function publicMembership(row) {
  return {
    canceledAt: row.canceledAt || "",
    createdAt: row.createdAt || "",
    createdBy: row.createdBy || "",
    endedAt: row.endedAt || "",
    externalSubscriptionId: row.externalSubscriptionId || "",
    foundingMemberKey: row.foundingMemberKey || "",
    invitationKey: row.invitationKey || "",
    key: row.key || "",
    planKey: row.planKey || "",
    renewsAt: row.renewsAt || "",
    source: row.source || "",
    startedAt: row.startedAt || "",
    status: row.status || "",
    updatedAt: row.updatedAt || "",
    updatedBy: row.updatedBy || "",
    userKey: row.userKey || "",
  };
}

function assignmentResponse(tables, membership, details = {}) {
  const plan = planByKey(tables, membership.planKey);
  return {
    foundingMember: details.foundingMember || null,
    limits: { ...limitsForPlan(tables, plan) },
    membership: publicMembership(membership),
    plan: { ...plan },
    source: membership.source,
    status: "PASS",
    supersededMemberships: details.supersededMemberships || [],
  };
}

function activeMembershipRows(tables, userKey) {
  return tableRows(tables, "user_memberships")
    .filter((row) => row.userKey === userKey && row.status === "active");
}

function validateSourceForPlan(plan, source, body) {
  if (plan.code === "FREE" && source !== "free" && source !== "admin_adjustment") {
    throw new MembershipAssignmentError("Free membership assignment must use source free.");
  }
  if (PAID_PLAN_CODES.has(plan.code) && source !== "paid" && source !== "admin_adjustment") {
    throw new MembershipAssignmentError(`${plan.code} membership assignment requires source paid.`);
  }
  if (PAID_PLAN_CODES.has(plan.code) && source === "paid" && !String(body.externalSubscriptionId || "").trim()) {
    throw new MembershipAssignmentError(`${plan.code} paid assignment requires an external subscription id.`);
  }
  if (plan.code === "BETA" && source !== "beta_invitation") {
    throw new MembershipAssignmentError("Beta membership assignment requires source beta_invitation.");
  }
  if (FOUNDING_PLAN_CODES.has(plan.code) && source !== "founding_paid") {
    throw new MembershipAssignmentError(`${plan.code} assignment requires source founding_paid.`);
  }
  if (FOUNDING_PLAN_CODES.has(plan.code) && !String(body.externalSubscriptionId || "").trim()) {
    throw new MembershipAssignmentError(`${plan.code} founding assignment requires paid eligibility through an external subscription id.`);
  }
}

function acceptedBetaInvitation(tables, user, body) {
  const invitationKey = String(body.invitationKey || "").trim();
  if (!invitationKey) {
    throw new MembershipAssignmentError("Beta membership assignment requires an invitation key.");
  }
  const invitation = tableRows(tables, "invitations").find((row) => row.key === invitationKey);
  if (!invitation) {
    throw new MembershipAssignmentError(`Beta invite ${invitationKey} was not found.`, 404);
  }
  if (invitation.planKey !== "BETA") {
    throw new MembershipAssignmentError("Beta membership assignment requires a BETA invitation.");
  }
  if (invitation.status !== "accepted") {
    throw new MembershipAssignmentError("Beta membership assignment requires an accepted invitation.", 409);
  }
  if (invitation.acceptedBy !== user.key) {
    throw new MembershipAssignmentError("Beta membership assignment invitation must be accepted by the assigned user.", 409);
  }
  return invitation;
}

function nextFoundingSequence(tables, requestedPlan) {
  const limit = Number(requestedPlan.foundingMemberLimit || 0);
  if (!Number.isInteger(limit) || limit < 1) {
    throw new MembershipAssignmentError(`${requestedPlan.code} does not expose a valid founding member limit.`, 500);
  }
  const used = new Set(tableRows(tables, "founding_members")
    .map((row) => Number(row.sequenceNumber))
    .filter((sequenceNumber) => Number.isInteger(sequenceNumber) && sequenceNumber >= 1 && sequenceNumber <= limit));
  if (used.size >= limit) {
    throw new MembershipAssignmentError("Founding membership capacity is exhausted.", 409);
  }
  for (let sequenceNumber = 1; sequenceNumber <= limit; sequenceNumber += 1) {
    if (!used.has(sequenceNumber)) {
      return sequenceNumber;
    }
  }
  throw new MembershipAssignmentError("Founding membership capacity is exhausted.", 409);
}

function createFoundingMember(tables, user, plan, body, options) {
  const value = timestamp(options);
  const foundingMember = {
    active: true,
    assignedAt: value,
    createdAt: value,
    createdBy: options.actorKey,
    endedAt: "",
    key: createKey(options),
    lockedMonthlyPriceCents: plan.monthlyPriceCents,
    planKey: plan.key,
    sequenceNumber: nextFoundingSequence(tables, plan),
    updatedAt: value,
    updatedBy: options.actorKey,
    userKey: user.key,
  };
  tableRows(tables, "founding_members").push(foundingMember);
  return foundingMember;
}

function endFoundingMember(tables, foundingMemberKey, value, actorKey) {
  if (!foundingMemberKey) {
    return;
  }
  const foundingMember = tableRows(tables, "founding_members").find((row) => row.key === foundingMemberKey);
  if (!foundingMember) {
    return;
  }
  foundingMember.active = false;
  foundingMember.endedAt = value;
  foundingMember.updatedAt = value;
  foundingMember.updatedBy = actorKey;
}

function supersedeActiveMemberships(tables, userKey, value, actorKey) {
  const superseded = activeMembershipRows(tables, userKey);
  superseded.forEach((row) => {
    row.status = "superseded";
    row.endedAt = value;
    row.updatedAt = value;
    row.updatedBy = actorKey;
    endFoundingMember(tables, row.foundingMemberKey, value, actorKey);
  });
  return superseded.map(publicMembership);
}

function membershipRenewal(plan, source, value) {
  if ((source === "paid" || source === "founding_paid") && plan.monthlyPriceCents > 0) {
    return addOneMonth(value);
  }
  return "";
}

export function assignUserMembership(tables, body = {}, options = {}) {
  const value = timestamp(options);
  const actorKey = String(options.actorKey || SEED_DB_KEYS.users.admin).trim();
  const user = activeUser(tables, body.userKey);
  const planCode = normalizedPlanCode(body.planCode || body.code);
  const plan = planByCode(tables, planCode);
  const source = normalizedSource(body.source, plan.code);
  validateSourceForPlan(plan, source, body);
  const betaInvitation = plan.code === "BETA" ? acceptedBetaInvitation(tables, user, body) : null;
  const foundingMember = FOUNDING_PLAN_CODES.has(plan.code)
    ? createFoundingMember(tables, user, plan, body, { ...options, actorKey })
    : null;
  const supersededMemberships = supersedeActiveMemberships(tables, user.key, value, actorKey);
  const membership = {
    canceledAt: "",
    createdAt: value,
    createdBy: actorKey,
    endedAt: "",
    externalSubscriptionId: String(body.externalSubscriptionId || "").trim(),
    foundingMemberKey: foundingMember?.key || "",
    invitationKey: betaInvitation?.key || "",
    key: createKey(options),
    planKey: plan.key,
    renewsAt: membershipRenewal(plan, source, value),
    source,
    startedAt: value,
    status: "active",
    updatedAt: value,
    updatedBy: actorKey,
    userKey: user.key,
  };
  tableRows(tables, "user_memberships").push(membership);
  return assignmentResponse(tables, membership, {
    foundingMember,
    supersededMemberships,
  });
}

export function resolveActiveUserMembership(tables, body = {}, options = {}) {
  const user = activeUser(tables, body.userKey);
  const activeRows = activeMembershipRows(tables, user.key);
  if (activeRows.length > 1) {
    throw new MembershipAssignmentError(`User ${user.key} has multiple active memberships.`, 409);
  }
  if (activeRows.length === 0) {
    return assignUserMembership(tables, {
      planCode: "FREE",
      source: "free",
      userKey: user.key,
    }, options);
  }
  return assignmentResponse(tables, activeRows[0]);
}

function planAvailability(plan, activePlanCode, options = {}) {
  if (plan.code === "BETA") {
    return {
      actionLabel: "Invitation Only",
      actionReason: "Beta access requires an accepted invitation.",
      disabled: true,
      kind: "invitation-only",
      showLockedPrice: false,
    };
  }
  if (FOUNDING_PLAN_CODES.has(plan.code)) {
    const activeFounding = activePlanCode === plan.code;
    return {
      actionLabel: activeFounding ? "Active Founding Plan" : "Founding Members",
      actionReason: activeFounding
        ? "Locked founding price is active while this membership remains active."
        : "Locked founding pricing is visible for active founding members.",
      disabled: true,
      kind: "founding-active-only",
      showLockedPrice: activeFounding || options.isAdmin === true || options.isOwner === true,
    };
  }
  if (plan.code === "FREE") {
    return {
      actionLabel: activePlanCode === "FREE" ? "Current Plan" : "Included",
      actionReason: "Free membership is available without checkout.",
      disabled: true,
      kind: "included",
      showLockedPrice: true,
    };
  }
  return {
    actionLabel: "Checkout Coming Soon",
    actionReason: "Paid checkout is not implemented in this PR.",
    disabled: true,
    kind: "future-checkout",
    showLockedPrice: true,
  };
}

function pendingBetaInvitationsForUser(tables, userKey) {
  const user = tableRows(tables, "users").find((row) => row.key === userKey && row.isActive !== false);
  if (!user) {
    return [];
  }
  const email = String(user.email || "").trim().toLowerCase();
  return tableRows(tables, "invitations")
    .filter((row) => row.planKey === "BETA" && row.status === "pending" && String(row.email || "").trim().toLowerCase() === email)
    .map((row) => ({
      email: row.email || "",
      expiresAt: row.expiresAt || "",
      key: row.key || "",
      status: row.status || "",
    }));
}

export function readMembershipCatalog(tables, body = {}, options = {}) {
  const userKey = String(body.userKey || "").trim();
  const active = userKey
    ? resolveActiveUserMembership(tables, { userKey }, options)
    : null;
  const activePlanCode = active?.plan?.code || "";
  const plans = tableRows(tables, "membership_plans")
    .filter((plan) => plan.active !== false)
    .sort((left, right) => {
      const leftIndex = PLAN_DISPLAY_ORDER.indexOf(left.code);
      const rightIndex = PLAN_DISPLAY_ORDER.indexOf(right.code);
      return (leftIndex === -1 ? PLAN_DISPLAY_ORDER.length : leftIndex) -
        (rightIndex === -1 ? PLAN_DISPLAY_ORDER.length : rightIndex);
    })
    .map((plan) => ({
      availability: planAvailability(plan, activePlanCode, options),
      isActivePlan: plan.code === activePlanCode,
      limits: { ...limitsForPlan(tables, plan) },
      plan: { ...plan },
    }));
  return {
    active,
    pendingBetaInvitations: userKey ? pendingBetaInvitationsForUser(tables, userKey) : [],
    plans,
    sourceTables: ["membership_plans", "membership_limits", "user_memberships", "founding_members", "invitations"],
    status: "PASS",
  };
}
