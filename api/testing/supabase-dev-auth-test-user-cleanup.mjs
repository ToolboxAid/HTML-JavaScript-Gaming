import { SEED_DB_KEYS } from "../seed/seed-db-keys.mjs";
import {
  SUPABASE_AUTH_PROVIDER_ID,
  SupabaseAuthProviderAdapter,
  SupabasePostgresProviderAdapter,
} from "../auth/provider-contract-stubs.mjs";

const DEV_ONLY_ENV_VALUES = Object.freeze(["dev", "development", "local", "test", ""]);
const DEV_TEST_EMAIL_PATTERN = /^(codex|playwright)-[a-z0-9._+-]+@example\.test$/i;
const STATIC_DEV_USER_KEYS = Object.freeze([
  SEED_DB_KEYS.users.admin,
  SEED_DB_KEYS.users.user1,
  SEED_DB_KEYS.users.user2,
  SEED_DB_KEYS.users.user3,
]);

function envMode(env) {
  return String(env.GAMEFOUNDRY_ENV || env.GAMEFOUNDRY_DEPLOYMENT_ENV || env.NODE_ENV || "").trim().toLowerCase();
}

export function assertDevOnlyAuthTestCleanupEnvironment(env = process.env) {
  const mode = envMode(env);
  if (!DEV_ONLY_ENV_VALUES.includes(mode)) {
    throw new Error(`Supabase auth test user cleanup is DEV-only. Refusing to run for environment mode "${mode}".`);
  }
}

export function isSupabaseDevAuthTestUser(user = {}) {
  const email = String(user.email || "").trim();
  if (!DEV_TEST_EMAIL_PATTERN.test(email)) {
    return false;
  }
  if (STATIC_DEV_USER_KEYS.includes(String(user.key || ""))) {
    return false;
  }
  return user.authProvider === SUPABASE_AUTH_PROVIDER_ID && Boolean(String(user.authProviderUserId || "").trim());
}

function recordRef(user) {
  return {
    authProviderUserId: String(user.authProviderUserId || ""),
    email: String(user.email || ""),
    userKey: String(user.key || ""),
  };
}

function userKeySet(users) {
  return new Set(users.map((user) => String(user.key || "")).filter(Boolean));
}

function collectAuditDependencyRecords({ candidateKeys, roles, userRoles }) {
  const roleRecords = roles
    .map((role) => ({
      fields: ["createdBy", "updatedBy"].filter((field) => candidateKeys.has(String(role[field] || ""))),
      rowKey: String(role.key || ""),
      table: "roles",
    }))
    .filter((record) => record.fields.length);
  const userRoleRecords = userRoles
    .filter((row) => !candidateKeys.has(String(row.userKey || "")))
    .map((row) => ({
      fields: ["createdBy", "updatedBy"].filter((field) => candidateKeys.has(String(row[field] || ""))),
      rowKey: String(row.key || ""),
      table: "user_roles",
      userKey: String(row.userKey || ""),
    }))
    .filter((record) => record.fields.length);
  return [...roleRecords, ...userRoleRecords];
}

function auditDependenciesForUser({ candidateKeys, roles, userKey, userRoles }) {
  const roleRecords = roles
    .map((role) => ({
      fields: ["createdBy", "updatedBy"].filter((field) => String(role[field] || "") === userKey),
      rowKey: String(role.key || ""),
      table: "roles",
    }))
    .filter((record) => record.fields.length);
  const userRoleRecords = userRoles
    .filter((row) => !candidateKeys.has(String(row.userKey || "")))
    .map((row) => ({
      fields: ["createdBy", "updatedBy"].filter((field) => String(row[field] || "") === userKey),
      rowKey: String(row.key || ""),
      table: "user_roles",
      userKey: String(row.userKey || ""),
    }))
    .filter((record) => record.fields.length);
  return { roleRecords, userRoleRecords };
}

function countReassignedFields(result) {
  return (Array.isArray(result?.createdBy) ? result.createdBy.length : 0)
    + (Array.isArray(result?.updatedBy) ? result.updatedBy.length : 0);
}

function resolveAuditUserKey({ auditDependencyRecords, auditUserKey, users }) {
  if (!auditDependencyRecords.length) {
    return "";
  }
  const key = String(auditUserKey || "").trim();
  if (!key) {
    throw new Error("Supabase auth test cleanup found shared account audit references. Provide a surviving non-test DEV users.key as auditUserKey before deleting referenced test users.");
  }
  const user = users.find((candidate) => String(candidate.key || "") === key);
  if (!user) {
    throw new Error(`Supabase auth test cleanup auditUserKey "${key}" was not found in users.`);
  }
  if (isSupabaseDevAuthTestUser(user)) {
    throw new Error("Supabase auth test cleanup auditUserKey must reference a non-test DEV user.");
  }
  return key;
}

function cleanupSummary({
  auditDependencyRecords,
  auditReassignmentRecords,
  auditUserKey,
  createdRecords,
  deletedRecords,
  dryRun,
  skippedRecords,
}) {
  return {
    auditDependencyRecords,
    auditReassignmentRecords,
    auditReassignmentRequired: Boolean(auditDependencyRecords.length),
    auditUserKey,
    createdRecords,
    deletedRecords,
    dryRun,
    skippedRecords,
    status: "PASS",
    testDataCandidates: deletedRecords.length,
    testDataCreated: createdRecords.length,
    testDataDeleted: dryRun ? 0 : deletedRecords.length,
    testDataSkipped: skippedRecords.length,
  };
}

export async function cleanupSupabaseDevAuthTestUsers({
  auditUserKey = "",
  authProvider = new SupabaseAuthProviderAdapter(),
  databaseProvider = new SupabasePostgresProviderAdapter(),
  dryRun = false,
  env = process.env,
} = {}) {
  assertDevOnlyAuthTestCleanupEnvironment(env);
  const users = await databaseProvider.getUsers();
  const candidates = users.filter(isSupabaseDevAuthTestUser);
  const roles = await databaseProvider.getRoles();
  const userRoles = await databaseProvider.getUserRoles();
  const candidateKeys = userKeySet(candidates);
  const auditDependencyRecords = collectAuditDependencyRecords({ candidateKeys, roles, userRoles });
  const resolvedAuditUserKey = auditUserKey
    ? resolveAuditUserKey({ auditDependencyRecords, auditUserKey, users })
    : "";
  const skippedRecords = users
    .filter((user) => !isSupabaseDevAuthTestUser(user))
    .map((user) => ({
      email: String(user.email || ""),
      reason: "not-dev-auth-test-user",
      userKey: String(user.key || ""),
    }));

  if (dryRun) {
    return cleanupSummary({
      auditDependencyRecords,
      auditReassignmentRecords: [],
      auditUserKey: resolvedAuditUserKey,
      createdRecords: [],
      deletedRecords: candidates.map((user) => ({
        ...recordRef(user),
        action: "dry-run",
      })),
      dryRun: true,
      skippedRecords,
    });
  }

  const auditKey = resolveAuditUserKey({ auditDependencyRecords, auditUserKey, users });
  const deletedRecords = [];
  const auditReassignmentRecords = [];
  for (const user of candidates) {
    const ref = recordRef(user);
    const deletedUserRoles = await databaseProvider.deleteUserRolesForUserKey(ref.userKey);
    const dependencies = auditDependenciesForUser({ candidateKeys, roles, userKey: ref.userKey, userRoles });
    const roleAuditResult = dependencies.roleRecords.length
      ? await databaseProvider.reassignRoleAuditReferences({
        fromUserKey: ref.userKey,
        toUserKey: auditKey,
      })
      : { createdBy: [], updatedBy: [] };
    const userRoleAuditResult = dependencies.userRoleRecords.length
      ? await databaseProvider.reassignUserRoleAuditReferences({
        fromUserKey: ref.userKey,
        toUserKey: auditKey,
      })
      : { createdBy: [], updatedBy: [] };
    const roleAuditReferencesReassigned = countReassignedFields(roleAuditResult);
    const userRoleAuditReferencesReassigned = countReassignedFields(userRoleAuditResult);
    if (roleAuditReferencesReassigned || userRoleAuditReferencesReassigned) {
      auditReassignmentRecords.push({
        roleAuditReferencesReassigned,
        userKey: ref.userKey,
        userRoleAuditReferencesReassigned,
      });
    }
    const deletedUsers = await databaseProvider.deleteUserByKey(ref.userKey);
    const authResult = await authProvider.deleteTestAccount({
      authProviderUserId: ref.authProviderUserId,
    });
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

  return cleanupSummary({
    auditDependencyRecords,
    auditReassignmentRecords,
    auditUserKey: auditKey,
    createdRecords: [],
    deletedRecords,
    dryRun: false,
    skippedRecords,
  });
}
