export class ProjectTeamError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "ProjectTeamError";
    this.statusCode = statusCode;
  }
}

export const PROJECT_MEMBER_ROLES = Object.freeze(["owner", "editor", "viewer"]);
export const PROJECT_MEMBER_STATUSES = Object.freeze(["active", "invited", "removed"]);

function tableRows(tables, tableName) {
  if (!tables || typeof tables !== "object") {
    throw new ProjectTeamError("Project team service requires database tables.", 500);
  }
  if (!Array.isArray(tables[tableName])) {
    throw new ProjectTeamError(`${tableName} table is required for project teams.`, 500);
  }
  return tables[tableName];
}

function timestamp(options = {}) {
  return options.now || new Date().toISOString();
}

function createKey(options = {}) {
  if (typeof options.createKey !== "function") {
    throw new ProjectTeamError("Project team service requires a key generator.", 500);
  }
  return options.createKey();
}

function requiredString(value, label) {
  const text = String(value || "").trim();
  if (!text) {
    throw new ProjectTeamError(`Project team ${label} is required.`);
  }
  return text;
}

function activeUser(tables, userKey, label = "user") {
  const key = requiredString(userKey, label);
  const user = tableRows(tables, "users").find((row) => row.key === key && row.isActive !== false);
  if (!user) {
    throw new ProjectTeamError(`Project team ${label} ${key} was not found.`, 404);
  }
  return user;
}

function normalizedRole(value) {
  const role = String(value || "editor").trim().toLowerCase();
  if (!PROJECT_MEMBER_ROLES.includes(role)) {
    throw new ProjectTeamError(`Project member role ${role || "missing"} is not supported.`);
  }
  return role;
}

function normalizedStatus(value) {
  const status = String(value || "invited").trim().toLowerCase();
  if (!PROJECT_MEMBER_STATUSES.includes(status)) {
    throw new ProjectTeamError(`Project member status ${status || "missing"} is not supported.`);
  }
  return status;
}

function activeMembershipForUser(tables, userKey) {
  const activeRows = tableRows(tables, "user_memberships")
    .filter((row) => row.userKey === userKey && row.status === "active");
  if (activeRows.length === 0) {
    throw new ProjectTeamError(`Active membership for project owner ${userKey} was not found. Team collaboration requires an active membership.`, 403);
  }
  if (activeRows.length > 1) {
    throw new ProjectTeamError(`Project owner ${userKey} has multiple active memberships.`, 409);
  }
  const membership = activeRows[0];
  const plan = tableRows(tables, "membership_plans").find((row) => row.key === membership.planKey && row.active !== false);
  if (!plan) {
    throw new ProjectTeamError(`Membership plan ${membership.planKey || "missing"} was not found for project teams.`, 404);
  }
  const limits = tableRows(tables, "membership_limits").find((row) => row.planKey === plan.key);
  if (!limits) {
    throw new ProjectTeamError(`Membership limits for ${plan.code} were not found for project teams.`, 500);
  }
  return {
    limits: { ...limits },
    membership: { ...membership },
    plan: { ...plan },
  };
}

function projectMembers(tables, projectKey) {
  return tableRows(tables, "project_members").filter((row) => row.projectKey === projectKey);
}

function activeProjectMembers(tables, projectKey) {
  return projectMembers(tables, projectKey).filter((row) => row.status === "active");
}

function invitedProjectMembers(tables, projectKey) {
  return projectMembers(tables, projectKey).filter((row) => row.status === "invited");
}

function reservedProjectMembers(tables, projectKey) {
  return projectMembers(tables, projectKey).filter((row) => row.status === "active" || row.status === "invited");
}

function publicProjectMember(row) {
  return {
    createdAt: row.createdAt || "",
    createdBy: row.createdBy || "",
    invitedAt: row.invitedAt || "",
    invitedBy: row.invitedBy || "",
    joinedAt: row.joinedAt || "",
    key: row.key || "",
    projectKey: row.projectKey || "",
    removedAt: row.removedAt || "",
    role: row.role || "",
    status: row.status || "",
    updatedAt: row.updatedAt || "",
    updatedBy: row.updatedBy || "",
    userKey: row.userKey || "",
  };
}

function activeOwnerMember(tables, projectKey) {
  const owners = activeOwnerMembers(tables, projectKey);
  if (owners.length > 1) {
    throw new ProjectTeamError(`Project ${projectKey} has multiple active owners.`, 409);
  }
  return owners[0] || null;
}

function activeOwnerMembers(tables, projectKey) {
  return activeProjectMembers(tables, projectKey).filter((row) => row.role === "owner");
}

function requiredActiveOwnerMember(tables, projectKey) {
  const owner = activeOwnerMember(tables, projectKey);
  if (!owner) {
    throw new ProjectTeamError(`Project ${projectKey} does not have an active owner member.`, 404);
  }
  return owner;
}

function maxTeamMembers(limits, planCode) {
  const value = Number(limits.maxTeamMembers);
  if (!Number.isInteger(value) || value < 1) {
    throw new ProjectTeamError(`Membership limits for ${planCode} do not expose a valid maxTeamMembers value.`, 500);
  }
  return value;
}

function limitSummary({ activeCount, invitedCount, maxMembers, planCode }) {
  return `${planCode} membership limit is ${maxMembers} total project members; current team count is ${activeCount + invitedCount} (${activeCount} active, ${invitedCount} invited).`;
}

function teamDiagnostic({ activeCount, collaborationEnabled, invitedCount, maxMembers, planCode }) {
  const summary = limitSummary({
    activeCount,
    invitedCount,
    maxMembers,
    planCode,
  });
  if (!collaborationEnabled) {
    return `${summary} Collaboration is unavailable.`;
  }
  if (activeCount + invitedCount >= maxMembers) {
    return `${summary} team limit is reached.`;
  }
  return `${summary} Additional invitations are available.`;
}

export function readProjectTeamState(tables, body = {}) {
  const projectKey = requiredString(body.projectKey, "projectKey");
  const owner = requiredActiveOwnerMember(tables, projectKey);
  const ownerMembership = activeMembershipForUser(tables, owner.userKey);
  const activeMembers = activeProjectMembers(tables, projectKey);
  const invitedMembers = invitedProjectMembers(tables, projectKey);
  const activeCount = activeMembers.length;
  const invitedCount = invitedMembers.length;
  const maxMembers = maxTeamMembers(ownerMembership.limits, ownerMembership.plan.code);
  const collaborationEnabled = ownerMembership.limits.collaborationEnabled === true;
  const reservedSeatCount = reservedProjectMembers(tables, projectKey).length;
  const remainingSeats = Math.max(0, maxMembers - reservedSeatCount);
  const canInvite = collaborationEnabled && reservedSeatCount < maxMembers;
  return {
    activeCount,
    canInvite,
    collaborationEnabled,
    diagnostic: teamDiagnostic({
      activeCount,
      collaborationEnabled,
      invitedCount,
      maxMembers,
      planCode: ownerMembership.plan.code,
    }),
    invitedCount,
    limitDiagnostic: limitSummary({
      activeCount,
      invitedCount,
      maxMembers,
      planCode: ownerMembership.plan.code,
    }),
    maxTeamMembers: maxMembers,
    owner: publicProjectMember(owner),
    ownerMembership,
    projectKey,
    remainingSeats,
    reservedSeatCount,
    sourceTables: ["project_members", "user_memberships", "membership_plans", "membership_limits"],
    status: canInvite ? "PASS" : "WARN",
  };
}

export function ensureProjectOwnerMember(tables, body = {}, options = {}) {
  const projectKey = requiredString(body.projectKey, "projectKey");
  const owner = activeUser(tables, body.ownerUserKey || body.userKey, "ownerUserKey");
  activeMembershipForUser(tables, owner.key);
  const existingOwner = activeOwnerMember(tables, projectKey);
  if (existingOwner && existingOwner.userKey !== owner.key) {
    throw new ProjectTeamError(`Project ${projectKey} already has a different active owner.`, 409);
  }
  if (existingOwner) {
    return {
      member: publicProjectMember(existingOwner),
      status: "PASS",
      team: readProjectTeamState(tables, { projectKey }),
    };
  }
  const value = timestamp(options);
  const actorKey = String(options.actorKey || owner.key).trim() || owner.key;
  const member = {
    createdAt: value,
    createdBy: actorKey,
    invitedAt: value,
    invitedBy: owner.key,
    joinedAt: value,
    key: createKey(options),
    projectKey,
    removedAt: "",
    role: "owner",
    status: "active",
    updatedAt: value,
    updatedBy: actorKey,
    userKey: owner.key,
  };
  tableRows(tables, "project_members").push(member);
  return {
    member: publicProjectMember(member),
    status: "PASS",
    team: readProjectTeamState(tables, { projectKey }),
  };
}

function nonRemovedMemberForUser(tables, projectKey, userKey) {
  return projectMembers(tables, projectKey)
    .find((row) => row.userKey === userKey && row.status !== "removed");
}

function activeInviterMember(tables, projectKey, invitedBy) {
  const inviter = activeUser(tables, invitedBy, "invitedBy");
  const member = activeProjectMembers(tables, projectKey).find((row) => row.userKey === inviter.key);
  if (!member) {
    throw new ProjectTeamError(`Project team inviter ${inviter.key} is not an active project member.`, 403);
  }
  return member;
}

export function addProjectMember(tables, body = {}, options = {}) {
  const projectKey = requiredString(body.projectKey, "projectKey");
  const user = activeUser(tables, body.userKey, "userKey");
  const role = normalizedRole(body.role);
  const status = normalizedStatus(body.status);
  if (role === "owner") {
    throw new ProjectTeamError("Project owner members must be created through ensureProjectOwnerMember.");
  }
  if (status === "removed") {
    throw new ProjectTeamError("Project member add cannot create removed records.");
  }
  const invitedBy = requiredString(body.invitedBy || body.inviterUserKey, "invitedBy");
  activeInviterMember(tables, projectKey, invitedBy);
  const team = readProjectTeamState(tables, { projectKey });
  if (!team.canInvite) {
    throw new ProjectTeamError(team.diagnostic, 403);
  }
  if (nonRemovedMemberForUser(tables, projectKey, user.key)) {
    throw new ProjectTeamError(`Project ${projectKey} already has an active or invited member for ${user.key}.`, 409);
  }
  const value = timestamp(options);
  const actorKey = String(options.actorKey || invitedBy).trim() || invitedBy;
  const member = {
    createdAt: value,
    createdBy: actorKey,
    invitedAt: value,
    invitedBy,
    joinedAt: status === "active" ? value : "",
    key: createKey(options),
    projectKey,
    removedAt: "",
    role,
    status,
    updatedAt: value,
    updatedBy: actorKey,
    userKey: user.key,
  };
  tableRows(tables, "project_members").push(member);
  return {
    member: publicProjectMember(member),
    status: "PASS",
    team: readProjectTeamState(tables, { projectKey }),
  };
}

export function inviteProjectMember(tables, body = {}, options = {}) {
  return addProjectMember(tables, {
    ...body,
    status: "invited",
  }, options);
}

function requiredProjectMember(tables, projectKey, body = {}) {
  const memberKey = String(body.memberKey || body.projectMemberKey || "").trim();
  const userKey = String(body.userKey || "").trim();
  const member = projectMembers(tables, projectKey)
    .find((row) => memberKey ? row.key === memberKey : row.userKey === userKey && row.status !== "removed");
  if (!member) {
    throw new ProjectTeamError(`Project member ${memberKey || userKey || "missing"} was not found.`, 404);
  }
  return member;
}

export function joinProjectMember(tables, body = {}, options = {}) {
  const projectKey = requiredString(body.projectKey, "projectKey");
  const member = requiredProjectMember(tables, projectKey, body);
  if (member.status !== "invited") {
    throw new ProjectTeamError(`Project member ${member.key} is not an invited member.`, 409);
  }
  const team = readProjectTeamState(tables, { projectKey });
  if (!team.collaborationEnabled) {
    throw new ProjectTeamError(team.diagnostic, 403);
  }
  if (team.activeCount >= team.maxTeamMembers) {
    throw new ProjectTeamError(`${team.limitDiagnostic} Invitation cannot be accepted because the active member limit is reached.`, 403);
  }
  const value = timestamp(options);
  const actorKey = String(options.actorKey || member.userKey).trim() || member.userKey;
  member.status = "active";
  member.joinedAt = value;
  member.updatedAt = value;
  member.updatedBy = actorKey;
  return {
    member: publicProjectMember(member),
    status: "PASS",
    team: readProjectTeamState(tables, { projectKey }),
  };
}

export function changeProjectMemberRole(tables, body = {}, options = {}) {
  const projectKey = requiredString(body.projectKey, "projectKey");
  const role = normalizedRole(body.role);
  const member = requiredProjectMember(tables, projectKey, body);
  if (member.status !== "active") {
    throw new ProjectTeamError(`Project member ${member.key} must be active before role changes are allowed.`, 409);
  }
  if (member.role === "owner" && role !== "owner" && activeOwnerMembers(tables, projectKey).length <= 1) {
    throw new ProjectTeamError("Project role change must preserve at least one active owner.", 409);
  }
  if (member.role !== "owner" && role === "owner") {
    throw new ProjectTeamError("Project ownership transfer is not implemented in this PR.", 409);
  }
  const value = timestamp(options);
  const actorKey = String(options.actorKey || body.changedBy || member.updatedBy || member.userKey).trim();
  member.role = role;
  member.updatedAt = value;
  member.updatedBy = actorKey;
  return {
    member: publicProjectMember(member),
    status: "PASS",
    team: readProjectTeamState(tables, { projectKey }),
  };
}

export function assertProjectMemberAccess(tables, body = {}) {
  const projectKey = requiredString(body.projectKey, "projectKey");
  const userKey = requiredString(body.userKey, "userKey");
  const member = projectMembers(tables, projectKey).find((row) => row.userKey === userKey);
  if (!member || member.status !== "active") {
    throw new ProjectTeamError(`Project access denied for ${userKey}; project member status is ${member?.status || "missing"}.`, 403);
  }
  const allowedRoles = Array.isArray(body.allowedRoles) ? body.allowedRoles.map(normalizedRole) : [];
  if (allowedRoles.length && !allowedRoles.includes(member.role)) {
    throw new ProjectTeamError(`Project access denied for ${userKey}; role ${member.role} is not allowed.`, 403);
  }
  return {
    member: publicProjectMember(member),
    projectKey,
    status: "PASS",
  };
}

export function removeProjectMember(tables, body = {}, options = {}) {
  const projectKey = requiredString(body.projectKey, "projectKey");
  const member = requiredProjectMember(tables, projectKey, body);
  if (member.role === "owner") {
    throw new ProjectTeamError("Project owner member cannot be removed by the team foundation service.", 409);
  }
  const value = timestamp(options);
  const actorKey = String(options.actorKey || body.removedBy || member.updatedBy || member.userKey).trim();
  member.status = "removed";
  member.removedAt = value;
  member.updatedAt = value;
  member.updatedBy = actorKey;
  return {
    member: publicProjectMember(member),
    status: "PASS",
    team: readProjectTeamState(tables, { projectKey }),
  };
}
