import { MOCK_DB_KEYS } from "../persistence/mock-db-store.js";
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
    key: MOCK_DB_KEYS.users.user1,
    passwordSuffix: "1",
  }),
  Object.freeze({
    displayName: "User 2",
    email: "user2@example.invalid",
    key: MOCK_DB_KEYS.users.user2,
    passwordSuffix: "2",
  }),
  Object.freeze({
    displayName: "User 3",
    email: "user3@example.invalid",
    key: MOCK_DB_KEYS.users.user3,
    passwordSuffix: "3",
  }),
  Object.freeze({
    displayName: "DavidQ",
    email: "qbytes.dq@gmail.com",
    key: MOCK_DB_KEYS.users.admin,
    passwordSuffix: "$2026",
  }),
]);

const CANONICAL_EMAILS = new Set(DEV_CREATOR_IDENTITIES.map((identity) => identity.email.toLowerCase()));
const CANONICAL_KEYS = new Set(DEV_CREATOR_IDENTITIES.map((identity) => identity.key));
const DEV_PASSWORD_PREFIX = ["GF", "S"].join("");
const LEGACY_DEV_AUTH_USER_IDS = new Set(["user-1", "user-2", "user-3", "davidq", "davidq-admin"]);
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
    description: "Deprecated compatibility role. Authenticated accounts use creator.",
    isActive: false,
    isSystemRole: false,
    name: "Deprecated User",
    roleSlug: "user",
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
  const key = normalizedId(user.key);
  if (CANONICAL_KEYS.has(key) || isCanonicalDevIdentityEmail(email)) {
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

async function upsertAuthIdentity(authProvider, identity, existingByEmail, dryRun) {
  const existingUser = existingByEmail.get(identity.email.toLowerCase());
  if (dryRun) {
    return {
      action: existingUser ? "would-update" : "would-create",
      authProviderUserId: maskId(authUserId(existingUser)),
      email: identity.email,
    };
  }
  if (existingUser) {
    const payload = await authProvider.updateAccount({
      authProviderUserId: authUserId(existingUser),
      email: identity.email,
      password: requestedDevPassword(identity),
      userMetadata: {
        display_name: identity.displayName,
        name: identity.displayName,
      },
    });
    return {
      action: "updated",
      authProviderUserId: maskId(authUserId(payload) || authUserId(existingUser)),
      email: identity.email,
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
    password: requestedDevPassword(identity),
    userMetadata: {
      display_name: identity.displayName,
      name: identity.displayName,
    },
  });
  return {
    action: "created",
    authProviderUserId: maskId(authUserId(updated) || createdUserId),
    email: identity.email,
  };
}

function canonicalUserRows(authUsers) {
  const byEmail = authUsersByEmail(authUsers);
  return DEV_CREATOR_IDENTITIES.map((identity) => {
    const authId = authUserId(byEmail.get(identity.email.toLowerCase()));
    if (!authId) {
      throw new Error(`Supabase DEV identity sync could not resolve Auth user id for ${identity.email}.`);
    }
    return {
      authProvider: SUPABASE_AUTH_PROVIDER_ID,
      authProviderUserId: authId,
      displayName: identity.displayName,
      email: identity.email,
      isActive: true,
      key: identity.key,
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
  const userRole = afterRoles.find((role) => role.roleSlug === "user");
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
  const creatorAssignments = DEV_CREATOR_IDENTITIES.map((identity) => {
    const appUser = publicByEmail.get(identity.email.toLowerCase());
    return {
      assigned: Boolean(appUser && creatorRole && userRolePairs.has(`${appUser.key}\u0000${creatorRole.key}`)),
      email: identity.email,
      roleSlug: "creator",
    };
  });
  const davidq = publicByEmail.get("qbytes.dq@gmail.com");
  const davidqAdminAssignment = Boolean(davidq && adminRole && userRolePairs.has(`${davidq.key}\u0000${adminRole.key}`));
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
  if (!creatorRole || !adminRole || !activeRoleBySlug.get("guest")) {
    failures.push("required-role-missing");
  }
  if (userRole && userRole.isActive !== false) {
    failures.push("legacy-user-role-not-deprecated");
  }
  if (unexpectedManagedAuthUsers.length || unexpectedManagedPublicUsers.length) {
    failures.push("managed-extra-test-identity-remaining");
  }
  return {
    creatorAssignments,
    davidqAdminAssignmentPreserved: davidqAdminAssignment,
    failures,
    identityEvidence,
    legacyUserRoleDeprecated: !userRole || userRole.isActive === false,
    requiredRolesActive: {
      admin: Boolean(adminRole),
      creator: Boolean(creatorRole),
      guest: Boolean(activeRoleBySlug.get("guest")),
    },
    status: failures.length ? "FAIL" : "PASS",
    unexpectedManagedAuthUsers,
    unexpectedManagedPublicUsers,
  };
}

export async function syncSupabaseDevCreatorIdentities({
  authProvider = new SupabaseAuthProviderAdapter(),
  databaseProvider = new SupabasePostgresProviderAdapter(),
  dryRun = false,
  env = process.env,
} = {}) {
  assertDevOnlyAuthTestCleanupEnvironment(env);
  const beforeAuthUsers = await authProvider.listAllAdminUsers();
  const beforePublicUsers = await databaseProvider.getUsers();
  const beforeCounts = identityCounts({ authUsers: beforeAuthUsers, publicUsers: beforePublicUsers });

  const existingByEmail = authUsersByEmail(beforeAuthUsers);
  const authUpsertRecords = [];
  for (const identity of DEV_CREATOR_IDENTITIES) {
    authUpsertRecords.push(await upsertAuthIdentity(authProvider, identity, existingByEmail, dryRun));
  }

  const authUsersForIdentity = dryRun ? beforeAuthUsers : await authProvider.listAllAdminUsers();
  const initialized = dryRun
    ? {
      dryRun: true,
      initialized: {
        roles: DEV_ROLE_DEFINITIONS.length,
        user_roles: DEV_CREATOR_IDENTITIES.length,
        users: DEV_CREATOR_IDENTITIES.length,
      },
      written: {
        roles: 0,
        user_roles: 0,
        users: 0,
      },
    }
    : await databaseProvider.initializeIdentity({
      actorKey: MOCK_DB_KEYS.users.admin,
      roles: DEV_ROLE_DEFINITIONS,
      userRoles: DEV_CREATOR_IDENTITIES.map((identity) => ({
        roleSlug: "creator",
        userKey: identity.key,
      })),
      users: canonicalUserRows(authUsersForIdentity),
    });

  const usersForCleanup = await databaseProvider.getUsers();
  const rolesForCleanup = await databaseProvider.getRoles();
  const userRolesForCleanup = await databaseProvider.getUserRoles();
  const publicCleanupCandidates = usersForCleanup.filter(isManagedExtraPublicUser);
  const publicCleanup = await deleteManagedPublicUsers({
    auditUserKey: MOCK_DB_KEYS.users.admin,
    authProvider,
    candidates: publicCleanupCandidates,
    databaseProvider,
    dryRun,
    roles: rolesForCleanup,
    userRoles: userRolesForCleanup,
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
    status: dryRun ? "DRY_RUN" : verification.status,
    testDataCreated: authUpsertRecords.filter((record) => record.action === "created").length,
    testDataDeleted: publicCleanup.deletedRecords.length + authOnlyDeletedRecords.length,
    verification,
  };
}
