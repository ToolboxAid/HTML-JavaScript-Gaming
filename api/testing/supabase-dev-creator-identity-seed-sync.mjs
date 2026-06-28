import {
  SUPABASE_AUTH_PROVIDER_ID,
  SupabaseAuthProviderAdapter,
  SupabasePostgresProviderAdapter,
} from "../auth/provider-contract-stubs.mjs";
import { assertDevOnlyAuthTestCleanupEnvironment } from "./supabase-dev-auth-test-user-cleanup.mjs";

export const DEV_CREATOR_IDENTITIES = Object.freeze([
  Object.freeze({
    displayName: "User 1",
    email: "user1@example.invalid",
    passwordSuffix: "1!!",
  }),
  Object.freeze({
    displayName: "User 2",
    email: "user2@example.invalid",
    passwordSuffix: "2!!",
  }),
  Object.freeze({
    displayName: "User 3",
    email: "user3@example.invalid",
    passwordSuffix: "3!!",
  }),
  Object.freeze({
    displayName: "DavidQ",
    email: "qbytes.dq@gmail.com",
    passwordSuffix: "$2026",
  }),
]);

const CANONICAL_EMAILS = new Set(DEV_CREATOR_IDENTITIES.map((identity) => identity.email.toLowerCase()));
const DAVIDQ_DEV_EMAIL = "qbytes.dq@gmail.com";
const DEV_PASSWORD_PREFIX = ["GF", "S"].join("");
const LEGACY_DEV_AUTH_USER_IDS = new Set(["user-1", "user-2", "user-3", "davidq", "davidq-admin"]);
const KNOWN_STALE_ROLE_KEYS = Object.freeze(["01KV6FVP0ASR2RRR9WXCBKTV6C"]);
const DEV_ROLE_DEFINITIONS = Object.freeze([
  Object.freeze({
    description: "Authenticated game creator.",
    isActive: true,
    isSystemRole: false,
    name: "Creator",
    roleSlug: "creator",
  }),
  Object.freeze({
    description: "Unauthenticated visitor and starter flow role.",
    isActive: true,
    isSystemRole: false,
    name: "Guest",
    roleSlug: "guest",
  }),
  Object.freeze({
    description: "Administrative account.",
    isActive: true,
    isSystemRole: false,
    name: "Admin",
    roleSlug: "admin",
  }),
  Object.freeze({
    description: "Owner account with platform-level stewardship access.",
    isActive: true,
    isSystemRole: false,
    name: "Owner",
    roleSlug: "owner",
  }),
]);

function normalizedEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizedId(value) {
  return String(value || "").trim();
}

function maskId(value) {
  const id = normalizedId(value);
  if (!id) {
    return "";
  }
  if (id.length <= 12) {
    return `${id.slice(0, 4)}...`;
  }
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

function authUserId(user) {
  return normalizedId(user?.id || user?.user?.id || user?.authProviderUserId);
}

function authUserEmail(user) {
  return normalizedEmail(user?.email || user?.user?.email);
}

function requestedDevPassword(identity) {
  return `${DEV_PASSWORD_PREFIX}${identity.passwordSuffix}`;
}

function publicUserRef(user) {
  return {
    authProviderUserId: maskId(user.authProviderUserId),
    email: String(user.email || ""),
    userKey: String(user.key || ""),
  };
}

export function isCanonicalDevIdentityEmail(email) {
  return CANONICAL_EMAILS.has(normalizedEmail(email));
}

export function isManagedExtraDevIdentityEmail(email) {
  const value = normalizedEmail(email);
  if (!value || isCanonicalDevIdentityEmail(value)) {
    return false;
  }
  return value.startsWith("codex-")
    || value.startsWith("playwright-")
    || value.startsWith("qbytes.dq")
    || value === "admin@example.invalid";
}

function isManagedExtraPublicUser(user = {}) {
  const email = normalizedEmail(user.email);
  if (isCanonicalDevIdentityEmail(email)) {
    return false;
  }
  if (isManagedExtraDevIdentityEmail(email)) {
    return true;
  }
  return user.authProvider === "dev-static-seed"
    || LEGACY_DEV_AUTH_USER_IDS.has(normalizedId(user.authProviderUserId));
}

function authUsersByEmail(users) {
  const byEmail = new Map();
  users.forEach((user) => {
    const email = authUserEmail(user);
    if (email && !byEmail.has(email)) {
      byEmail.set(email, user);
    }
  });
  return byEmail;
}

function identityCounts({ authUsers, publicUsers }) {
  return {
    authUsers: authUsers.length,
    canonicalAuthUsers: authUsers.filter((user) => isCanonicalDevIdentityEmail(authUserEmail(user))).length,
    canonicalPublicUsers: publicUsers.filter((user) => isCanonicalDevIdentityEmail(user.email)).length,
    managedExtraAuthUsers: authUsers.filter((user) => isManagedExtraDevIdentityEmail(authUserEmail(user))).length,
    managedExtraPublicUsers: publicUsers.filter(isManagedExtraPublicUser).length,
    publicUsers: publicUsers.length,
  };
}

function userKeySet(users) {
  return new Set(users.map((user) => normalizedId(user.key)).filter(Boolean));
}

function auditDependenciesForUser({ candidateKeys, roles, userKey, userRoles }) {
  const roleRecords = roles
    .map((role) => ({
      fields: ["createdBy", "updatedBy"].filter((field) => normalizedId(role[field]) === userKey),
      rowKey: normalizedId(role.key),
      table: "roles",
    }))
    .filter((record) => record.fields.length);
  const userRoleRecords = userRoles
    .filter((row) => !candidateKeys.has(normalizedId(row.userKey)))
    .map((row) => ({
      fields: ["createdBy", "updatedBy"].filter((field) => normalizedId(row[field]) === userKey),
      rowKey: normalizedId(row.key),
      table: "user_roles",
      userKey: normalizedId(row.userKey),
    }))
    .filter((record) => record.fields.length);
  return { roleRecords, userRoleRecords };
}

function countReassignedFields(result) {
  return (Array.isArray(result?.createdBy) ? result.createdBy.length : 0)
    + (Array.isArray(result?.updatedBy) ? result.updatedBy.length : 0);
}

function roleBySlug(roles, roleSlug) {
  return roles.find((role) => normalizedId(role.roleSlug) === roleSlug && role.isActive !== false) || null;
}

function canonicalUserKeys(canonicalUsers = []) {
  return new Set(canonicalUsers.map((user) => normalizedId(user.key)).filter(Boolean));
}

function davidqUserFromCanonicalUsers(canonicalUsers = []) {
  return canonicalUsers.find((user) => normalizedEmail(user.email) === DAVIDQ_DEV_EMAIL) || null;
}

function canonicalUserRoleRequests(canonicalUsers = []) {
  const davidq = davidqUserFromCanonicalUsers(canonicalUsers);
  return [
    ...canonicalUsers
      .filter((user) => normalizedId(user.key))
      .map((user) => ({
        roleSlug: "creator",
        userKey: normalizedId(user.key),
      })),
    davidq ? {
      roleSlug: "admin",
      userKey: normalizedId(davidq.key),
    } : null,
    davidq ? {
      roleSlug: "owner",
      userKey: normalizedId(davidq.key),
    } : null,
  ].filter(Boolean);
}

function canonicalDesiredUserRolePairs(roles, canonicalUsers = []) {
  const creatorRole = roleBySlug(roles, "creator");
  const adminRole = roleBySlug(roles, "admin");
  const ownerRole = roleBySlug(roles, "owner");
  const davidq = davidqUserFromCanonicalUsers(canonicalUsers);
  return new Set([
    ...canonicalUsers
      .filter(() => creatorRole)
      .map((user) => `${normalizedId(user.key)}\u0000${creatorRole.key}`),
    adminRole && davidq ? `${normalizedId(davidq.key)}\u0000${adminRole.key}` : "",
    ownerRole && davidq ? `${normalizedId(davidq.key)}\u0000${ownerRole.key}` : "",
  ].filter(Boolean));
}

function staleCanonicalUserRoleRecords({ canonicalUsers, roles, userRoles }) {
  const validRoleKeys = new Set(roles.map((role) => normalizedId(role.key)).filter(Boolean));
  const desiredPairs = canonicalDesiredUserRolePairs(roles, canonicalUsers);
  const canonicalKeys = canonicalUserKeys(canonicalUsers);
  const staleRoleKeys = new Set(KNOWN_STALE_ROLE_KEYS);
  return userRoles
    .filter((row) => canonicalKeys.has(normalizedId(row.userKey)))
    .filter((row) => {
      const roleKey = normalizedId(row.roleKey);
      return staleRoleKeys.has(roleKey) ||
        !validRoleKeys.has(roleKey) ||
        !desiredPairs.has(`${normalizedId(row.userKey)}\u0000${roleKey}`);
    })
    .map((row) => ({
      key: normalizedId(row.key),
      reason: staleRoleKeys.has(normalizedId(row.roleKey))
        ? "known-stale-role-key"
        : validRoleKeys.has(normalizedId(row.roleKey))
          ? "unexpected-canonical-assignment"
          : "missing-role-reference",
      roleKey: normalizedId(row.roleKey),
      userKey: normalizedId(row.userKey),
    }))
    .filter((row) => row.key);
}

async function repairCanonicalUserRoles({ canonicalUsers, databaseProvider, dryRun, roles, userRoles }) {
  const staleRecords = staleCanonicalUserRoleRecords({ canonicalUsers, roles, userRoles });
  const deletedRecords = [];
  for (const record of staleRecords) {
    if (dryRun) {
      deletedRecords.push({
        ...record,
        action: "dry-run",
        deleted: 0,
      });
      continue;
    }
    const deleted = await databaseProvider.deleteUserRoleByKey(record.key);
    deletedRecords.push({
      ...record,
      action: "deleted",
      deleted: Array.isArray(deleted) ? deleted.length : 0,
    });
  }
  return {
    deletedRecords,
    knownStaleRoleKeys: KNOWN_STALE_ROLE_KEYS.slice(),
    staleRecordsFound: staleRecords.length,
    staleRoleKeyRemoved: deletedRecords.some((record) => KNOWN_STALE_ROLE_KEYS.includes(record.roleKey) && record.deleted > 0),
  };
}

async function deleteDeprecatedRoleArtifacts({ databaseProvider, dryRun, roles, userRoles }) {
  const deprecatedRoles = roles
    .filter((role) => normalizedId(role.roleSlug) === "user" && normalizedId(role.key))
    .map((role) => ({
      key: normalizedId(role.key),
      roleSlug: "user",
    }));
  const deprecatedRoleKeys = new Set(deprecatedRoles.map((role) => role.key));
  const staleRoleKeys = new Set([...KNOWN_STALE_ROLE_KEYS, ...deprecatedRoleKeys]);
  const staleUserRoles = userRoles
    .filter((row) => staleRoleKeys.has(normalizedId(row.roleKey)) && normalizedId(row.key))
    .map((row) => ({
      key: normalizedId(row.key),
      roleKey: normalizedId(row.roleKey),
      userKey: normalizedId(row.userKey),
    }));
  const deletedUserRoles = [];
  for (const row of staleUserRoles) {
    if (dryRun) {
      deletedUserRoles.push({ ...row, action: "dry-run", deleted: 0 });
      continue;
    }
    const deleted = await databaseProvider.deleteUserRoleByKey(row.key);
    deletedUserRoles.push({
      ...row,
      action: "deleted",
      deleted: Array.isArray(deleted) ? deleted.length : 0,
    });
  }
  const deletedRoles = [];
  for (const role of deprecatedRoles) {
    if (dryRun) {
      deletedRoles.push({ ...role, action: "dry-run", deleted: 0 });
      continue;
    }
    const deleted = await databaseProvider.deleteRoleByKey(role.key);
    deletedRoles.push({
      ...role,
      action: "deleted",
      deleted: Array.isArray(deleted) ? deleted.length : 0,
    });
  }
  return {
    deletedRoleRecords: deletedRoles,
    deletedUserRoleRecords: deletedUserRoles,
    removedRoleSlugs: ["user"],
    staleRoleKeysChecked: Array.from(staleRoleKeys),
  };
}

async function upsertAuthIdentity(authProvider, identity, existingByEmail, dryRun, { updatePasswords = false } = {}) {
  const existingUser = existingByEmail.get(identity.email.toLowerCase());
  if (dryRun) {
    return {
      action: existingUser ? "would-update" : "would-create",
      authProviderUserId: maskId(authUserId(existingUser)),
      email: identity.email,
      passwordUpdated: false,
    };
  }
  if (existingUser) {
    const payload = await authProvider.updateAccount({
      authProviderUserId: authUserId(existingUser),
      email: identity.email,
      password: updatePasswords ? requestedDevPassword(identity) : "",
      userMetadata: {
        display_name: identity.displayName,
        name: identity.displayName,
      },
    });
    return {
      action: "updated",
      authProviderUserId: maskId(authUserId(payload) || authUserId(existingUser)),
      email: identity.email,
      passwordUpdated: updatePasswords,
    };
  }
  const created = await authProvider.createAccount({
    email: identity.email,
    password: requestedDevPassword(identity),
  });
  const createdUserId = authUserId(created);
  const updated = await authProvider.updateAccount({
    authProviderUserId: createdUserId,
    email: identity.email,
    password: updatePasswords ? requestedDevPassword(identity) : "",
    userMetadata: {
      display_name: identity.displayName,
      name: identity.displayName,
    },
  });
  return {
    action: "created",
    authProviderUserId: maskId(authUserId(updated) || createdUserId),
    email: identity.email,
    passwordUpdated: true,
  };
}

function canonicalPublicUsersByEmail(publicUsers = []) {
  const byEmail = new Map();
  const duplicates = [];
  publicUsers.forEach((user) => {
    const email = normalizedEmail(user.email);
    if (!isCanonicalDevIdentityEmail(email)) {
      return;
    }
    if (byEmail.has(email)) {
      duplicates.push(email);
      return;
    }
    byEmail.set(email, user);
  });
  if (duplicates.length) {
    throw new Error(`Supabase DEV identity sync found duplicate database users rows for: ${Array.from(new Set(duplicates)).join(", ")}.`);
  }
  const missing = DEV_CREATOR_IDENTITIES
    .map((identity) => identity.email)
    .filter((email) => !byEmail.has(normalizedEmail(email)));
  if (missing.length) {
    throw new Error(`Supabase DEV identity sync requires existing database users rows for: ${missing.join(", ")}.`);
  }
  return byEmail;
}

function canonicalUsersFromPublicRows(publicUsersByEmail) {
  return DEV_CREATOR_IDENTITIES.map((identity) => publicUsersByEmail.get(normalizedEmail(identity.email)));
}

function canonicalUserRows(authUsers, publicUsersByEmail) {
  const byEmail = authUsersByEmail(authUsers);
  return DEV_CREATOR_IDENTITIES.map((identity) => {
    const email = normalizedEmail(identity.email);
    const publicUser = publicUsersByEmail.get(email);
    const authId = authUserId(byEmail.get(email));
    const userKey = normalizedId(publicUser?.key);
    if (!userKey) {
      throw new Error(`Supabase DEV identity sync could not resolve database users.key for ${identity.email}.`);
    }
    if (!authId) {
      throw new Error(`Supabase DEV identity sync could not resolve Auth user id for ${identity.email}.`);
    }
    return {
      ...publicUser,
      authProvider: SUPABASE_AUTH_PROVIDER_ID,
      authProviderUserId: authId,
      displayName: publicUser.displayName || identity.displayName,
      email: publicUser.email || identity.email,
      isActive: publicUser.isActive !== false,
      key: userKey,
    };
  });
}

async function deleteManagedPublicUsers({
  auditUserKey,
  authProvider,
  candidates,
  databaseProvider,
  dryRun,
  roles,
  userRoles,
}) {
  const candidateKeys = userKeySet(candidates);
  const deletedRecords = [];
  const auditReassignmentRecords = [];
  const deletedAuthIds = new Set();
  for (const user of candidates) {
    const ref = publicUserRef(user);
    if (dryRun) {
      deletedRecords.push({
        ...ref,
        action: "dry-run",
      });
      continue;
    }
    const userKey = normalizedId(user.key);
    const deletedUserRoles = await databaseProvider.deleteUserRolesForUserKey(userKey);
    const dependencies = auditDependenciesForUser({ candidateKeys, roles, userKey, userRoles });
    const roleAuditResult = dependencies.roleRecords.length
      ? await databaseProvider.reassignRoleAuditReferences({
        fromUserKey: userKey,
        toUserKey: auditUserKey,
      })
      : { createdBy: [], updatedBy: [] };
    const userRoleAuditResult = dependencies.userRoleRecords.length
      ? await databaseProvider.reassignUserRoleAuditReferences({
        fromUserKey: userKey,
        toUserKey: auditUserKey,
      })
      : { createdBy: [], updatedBy: [] };
    const roleAuditReferencesReassigned = countReassignedFields(roleAuditResult);
    const userRoleAuditReferencesReassigned = countReassignedFields(userRoleAuditResult);
    if (roleAuditReferencesReassigned || userRoleAuditReferencesReassigned) {
      auditReassignmentRecords.push({
        roleAuditReferencesReassigned,
        userKey,
        userRoleAuditReferencesReassigned,
      });
    }
    const deletedUsers = await databaseProvider.deleteUserByKey(userKey);
    const authId = normalizedId(user.authProviderUserId);
    let authResult = { deleted: false, notFound: false };
    if (user.authProvider === SUPABASE_AUTH_PROVIDER_ID && authId) {
      authResult = await authProvider.deleteTestAccount({ authProviderUserId: authId });
      deletedAuthIds.add(authId);
    }
    deletedRecords.push({
      ...ref,
      authUserDeleted: authResult.deleted === true,
      authUserNotFound: authResult.notFound === true,
      roleAuditReferencesReassigned,
      userRolesDeleted: Array.isArray(deletedUserRoles) ? deletedUserRoles.length : 0,
      userRoleAuditReferencesReassigned,
      usersDeleted: Array.isArray(deletedUsers) ? deletedUsers.length : 0,
    });
  }
  return { auditReassignmentRecords, deletedAuthIds, deletedRecords };
}

async function deleteManagedAuthUsers({ authProvider, authUsers, deletedAuthIds, dryRun }) {
  const deletedRecords = [];
  for (const user of authUsers) {
    const id = authUserId(user);
    if (!id || deletedAuthIds.has(id) || !isManagedExtraDevIdentityEmail(authUserEmail(user))) {
      continue;
    }
    if (dryRun) {
      deletedRecords.push({
        action: "dry-run",
        authProviderUserId: maskId(id),
        email: authUserEmail(user),
      });
      continue;
    }
    const authResult = await authProvider.deleteTestAccount({ authProviderUserId: id });
    deletedRecords.push({
      action: "deleted-auth-only",
      authProviderUserId: maskId(id),
      authUserDeleted: authResult.deleted === true,
      authUserNotFound: authResult.notFound === true,
      email: authUserEmail(user),
    });
  }
  return deletedRecords;
}

function syncVerification({ afterAuthUsers, afterPublicUsers, afterRoles, afterUserRoles }) {
  const authByEmail = authUsersByEmail(afterAuthUsers);
  const publicByEmail = new Map(afterPublicUsers.map((user) => [normalizedEmail(user.email), user]));
  const activeRoleBySlug = new Map(afterRoles
    .filter((role) => role.isActive !== false)
    .map((role) => [String(role.roleSlug || ""), role]));
  const userRolePairs = new Set(afterUserRoles.map((row) => `${row.userKey}\u0000${row.roleKey}`));
  const creatorRole = activeRoleBySlug.get("creator");
  const adminRole = activeRoleBySlug.get("admin");
  const ownerRole = activeRoleBySlug.get("owner");
  const userRole = afterRoles.find((role) => role.roleSlug === "user");
  const roleSlugByKey = new Map(afterRoles.map((role) => [String(role.key || ""), String(role.roleSlug || "")]));
  const deprecatedRoleKeys = new Set(afterRoles
    .filter((role) => String(role.roleSlug || "") === "user")
    .map((role) => normalizedId(role.key))
    .filter(Boolean));
  const identityEvidence = DEV_CREATOR_IDENTITIES.map((identity) => {
    const auth = authByEmail.get(identity.email.toLowerCase());
    const appUser = publicByEmail.get(identity.email.toLowerCase());
    return {
      authProviderUserId: maskId(appUser?.authProviderUserId),
      authUserPresent: Boolean(authUserId(auth)),
      displayName: appUser?.displayName || "",
      email: identity.email,
      publicUserKey: appUser?.key || "",
      publicUserPresent: Boolean(appUser),
      synced: Boolean(authUserId(auth)) &&
        Boolean(appUser) &&
        appUser.authProvider === SUPABASE_AUTH_PROVIDER_ID &&
        appUser.authProviderUserId === authUserId(auth),
    };
  });
  const canonicalUsers = identityEvidence
    .map((record) => publicByEmail.get(normalizedEmail(record.email)))
    .filter(Boolean);
  const canonicalKeys = canonicalUserKeys(canonicalUsers);
  const desiredPairs = canonicalDesiredUserRolePairs(afterRoles, canonicalUsers);
  const creatorAssignments = DEV_CREATOR_IDENTITIES.map((identity) => {
    const appUser = publicByEmail.get(identity.email.toLowerCase());
    return {
      assigned: Boolean(appUser && creatorRole && userRolePairs.has(`${appUser.key}\u0000${creatorRole.key}`)),
      email: identity.email,
      roleSlug: "creator",
    };
  });
  const davidq = publicByEmail.get(DAVIDQ_DEV_EMAIL);
  const davidqAdminAssignment = Boolean(davidq && adminRole && userRolePairs.has(`${davidq.key}\u0000${adminRole.key}`));
  const davidqOwnerAssignment = Boolean(davidq && ownerRole && userRolePairs.has(`${davidq.key}\u0000${ownerRole.key}`));
  const roleEvidence = {
    davidqAdmin: davidqAdminAssignment,
    davidqCreator: creatorAssignments.find((record) => record.email === DAVIDQ_DEV_EMAIL)?.assigned === true,
    davidqOwner: davidqOwnerAssignment,
    user1Creator: creatorAssignments.find((record) => record.email === "user1@example.invalid")?.assigned === true,
    user2Creator: creatorAssignments.find((record) => record.email === "user2@example.invalid")?.assigned === true,
    user3Creator: creatorAssignments.find((record) => record.email === "user3@example.invalid")?.assigned === true,
  };
  const nonDavidqAdminAssignments = afterUserRoles
    .filter((row) => adminRole && row.roleKey === adminRole.key && row.userKey !== davidq?.key)
    .map((row) => String(row.userKey || ""));
  const nonDavidqOwnerAssignments = afterUserRoles
    .filter((row) => ownerRole && row.roleKey === ownerRole.key && row.userKey !== davidq?.key)
    .map((row) => String(row.userKey || ""));
  const missingRoleReferenceUserRoles = afterUserRoles
    .filter((row) => normalizedId(row.roleKey) && !roleSlugByKey.has(normalizedId(row.roleKey)))
    .map((row) => ({
      roleKey: normalizedId(row.roleKey),
      userKey: normalizedId(row.userKey),
      userRoleKey: normalizedId(row.key),
    }));
  const staleRequestedRoleReferences = afterUserRoles
    .filter((row) => {
      const roleKey = normalizedId(row.roleKey);
      return KNOWN_STALE_ROLE_KEYS.includes(roleKey) || deprecatedRoleKeys.has(roleKey);
    })
    .map((row) => ({
      roleKey: normalizedId(row.roleKey),
      userKey: normalizedId(row.userKey),
      userRoleKey: normalizedId(row.key),
    }));
  const unexpectedCanonicalAssignments = afterUserRoles
    .filter((row) => canonicalKeys.has(normalizedId(row.userKey)))
    .filter((row) => !desiredPairs.has(`${normalizedId(row.userKey)}\u0000${normalizedId(row.roleKey)}`))
    .map((row) => ({
      roleKey: normalizedId(row.roleKey),
      roleSlug: roleSlugByKey.get(normalizedId(row.roleKey)) || "",
      userKey: normalizedId(row.userKey),
      userRoleKey: normalizedId(row.key),
    }));
  const unexpectedManagedAuthUsers = afterAuthUsers
    .filter((user) => isManagedExtraDevIdentityEmail(authUserEmail(user)))
    .map((user) => ({ authProviderUserId: maskId(authUserId(user)), email: authUserEmail(user) }));
  const unexpectedManagedPublicUsers = afterPublicUsers
    .filter(isManagedExtraPublicUser)
    .map(publicUserRef);
  const failures = [];
  if (identityEvidence.some((record) => !record.synced)) {
    failures.push("canonical-auth-public-users-not-synced");
  }
  if (creatorAssignments.some((record) => !record.assigned)) {
    failures.push("creator-role-assignment-missing");
  }
  if (!creatorRole || !adminRole || !activeRoleBySlug.get("guest") || !ownerRole) {
    failures.push("required-role-missing");
  }
  if (userRole) {
    failures.push("legacy-user-role-remaining");
  }
  if (unexpectedManagedAuthUsers.length || unexpectedManagedPublicUsers.length) {
    failures.push("managed-extra-test-identity-remaining");
  }
  if (!davidqAdminAssignment) {
    failures.push("davidq-admin-role-missing");
  }
  if (!davidqOwnerAssignment) {
    failures.push("davidq-owner-role-missing");
  }
  if (nonDavidqAdminAssignments.length) {
    failures.push("unexpected-seeded-admin-assignment");
  }
  if (nonDavidqOwnerAssignments.length) {
    failures.push("unexpected-seeded-owner-assignment");
  }
  if (missingRoleReferenceUserRoles.length || staleRequestedRoleReferences.length) {
    failures.push("stale-user-role-reference-remaining");
  }
  if (unexpectedCanonicalAssignments.length) {
    failures.push("unexpected-canonical-role-assignment");
  }
  return {
    creatorAssignments,
    davidqAdminAssignmentPreserved: davidqAdminAssignment,
    davidqOwnerAssignmentPreserved: davidqOwnerAssignment,
    failures,
    identityEvidence,
    legacyUserRoleDeleted: !userRole,
    missingRoleReferenceUserRoles,
    requiredRolesActive: {
      admin: Boolean(adminRole),
      creator: Boolean(creatorRole),
      guest: Boolean(activeRoleBySlug.get("guest")),
      owner: Boolean(ownerRole),
    },
    nonDavidqAdminAssignments,
    nonDavidqOwnerAssignments,
    roleEvidence,
    status: failures.length ? "FAIL" : "PASS",
    staleRequestedRoleReferences,
    unexpectedCanonicalAssignments,
    unexpectedManagedAuthUsers,
    unexpectedManagedPublicUsers,
  };
}

export async function syncSupabaseDevCreatorIdentities({
  authProvider = new SupabaseAuthProviderAdapter(),
  databaseProvider = new SupabasePostgresProviderAdapter(),
  dryRun = false,
  env = process.env,
  updatePasswords = false,
} = {}) {
  assertDevOnlyAuthTestCleanupEnvironment(env);
  const beforeAuthUsers = await authProvider.listAllAdminUsers();
  const beforePublicUsers = await databaseProvider.getUsers();
  const publicUsersByEmail = canonicalPublicUsersByEmail(beforePublicUsers);
  const canonicalPublicUsers = canonicalUsersFromPublicRows(publicUsersByEmail);
  const davidqPublicUser = davidqUserFromCanonicalUsers(canonicalPublicUsers);
  if (!davidqPublicUser) {
    throw new Error(`Supabase DEV identity sync requires existing database users row for ${DAVIDQ_DEV_EMAIL}.`);
  }
  const beforeCounts = identityCounts({ authUsers: beforeAuthUsers, publicUsers: beforePublicUsers });

  const existingByEmail = authUsersByEmail(beforeAuthUsers);
  const authUpsertRecords = [];
  for (const identity of DEV_CREATOR_IDENTITIES) {
    authUpsertRecords.push(await upsertAuthIdentity(authProvider, identity, existingByEmail, dryRun, { updatePasswords }));
  }

  const authUsersForIdentity = dryRun ? beforeAuthUsers : await authProvider.listAllAdminUsers();
  const canonicalUsers = canonicalUserRows(authUsersForIdentity, publicUsersByEmail);
  const userRoleRequests = canonicalUserRoleRequests(canonicalUsers);
  const initialized = dryRun
    ? {
      dryRun: true,
      initialized: {
        roles: DEV_ROLE_DEFINITIONS.length,
        user_roles: userRoleRequests.length,
        users: canonicalUsers.length,
      },
      written: {
        roles: 0,
        user_roles: 0,
        users: 0,
      },
    }
    : await databaseProvider.initializeIdentity({
      actorKey: davidqPublicUser.key,
      roles: DEV_ROLE_DEFINITIONS,
      userRoles: userRoleRequests,
      users: canonicalUsers,
    });

  const usersForCleanup = await databaseProvider.getUsers();
  const rolesForCleanup = await databaseProvider.getRoles();
  const userRolesForCleanup = await databaseProvider.getUserRoles();
  const userRoleRepair = await repairCanonicalUserRoles({
    canonicalUsers,
    databaseProvider,
    dryRun,
    roles: rolesForCleanup,
    userRoles: userRolesForCleanup,
  });
  const rolesForRoleCleanup = dryRun ? rolesForCleanup : await databaseProvider.getRoles();
  const userRolesForRoleCleanup = dryRun ? userRolesForCleanup : await databaseProvider.getUserRoles();
  const roleArtifactCleanup = await deleteDeprecatedRoleArtifacts({
    databaseProvider,
    dryRun,
    roles: rolesForRoleCleanup,
    userRoles: userRolesForRoleCleanup,
  });
  const rolesForPublicCleanup = dryRun ? rolesForCleanup : await databaseProvider.getRoles();
  const userRolesForPublicCleanup = dryRun ? userRolesForCleanup : await databaseProvider.getUserRoles();
  const publicCleanupCandidates = usersForCleanup.filter(isManagedExtraPublicUser);
  const publicCleanup = await deleteManagedPublicUsers({
    auditUserKey: davidqPublicUser.key,
    authProvider,
    candidates: publicCleanupCandidates,
    databaseProvider,
    dryRun,
    roles: rolesForPublicCleanup,
    userRoles: userRolesForPublicCleanup,
  });

  const authUsersForCleanup = dryRun ? beforeAuthUsers : await authProvider.listAllAdminUsers();
  const authOnlyDeletedRecords = await deleteManagedAuthUsers({
    authProvider,
    authUsers: authUsersForCleanup,
    deletedAuthIds: publicCleanup.deletedAuthIds,
    dryRun,
  });

  const afterAuthUsers = dryRun ? beforeAuthUsers : await authProvider.listAllAdminUsers();
  const afterPublicUsers = await databaseProvider.getUsers();
  const afterRoles = await databaseProvider.getRoles();
  const afterUserRoles = await databaseProvider.getUserRoles();
  const afterCounts = identityCounts({ authUsers: afterAuthUsers, publicUsers: afterPublicUsers });
  const verification = syncVerification({ afterAuthUsers, afterPublicUsers, afterRoles, afterUserRoles });

  return {
    afterCounts,
    authUpsertRecords,
    beforeCounts,
    deletedRecords: [
      ...publicCleanup.deletedRecords,
      ...authOnlyDeletedRecords,
    ],
    dryRun,
    identityInitialization: initialized,
    roleArtifactCleanup,
    status: dryRun ? "DRY_RUN" : verification.status,
    testDataCreated: authUpsertRecords.filter((record) => record.action === "created").length,
    testDataDeleted: publicCleanup.deletedRecords.length + authOnlyDeletedRecords.length,
    userRoleRepair,
    verification,
  };
}
