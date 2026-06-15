import { randomBytes } from "node:crypto";
import { MOCK_DB_KEYS } from "../persistence/mock-db-store.js";

export const AUTH_PROVIDER_CONTRACT_OPERATIONS = Object.freeze([
  "getCurrentUser",
  "signIn",
  "signOut",
  "createAccount",
  "requestPasswordReset",
  "requireRole",
]);

export const POSTGRES_PROVIDER_CONTRACT_OPERATIONS = Object.freeze([
  "connect",
  "getUsers",
  "getRoles",
  "getUserRoles",
  "initializeIdentity",
  "runSiteSetup",
  "getDbViewerSnapshot",
]);

export const PROVIDER_DATA_BOUNDARY_RULE = "Browser -> API/Service Contract -> Database";

export const LOCAL_AUTH_PROVIDER_ID = "local-db";
export const LOCAL_DATABASE_PROVIDER_ID = "local-db";
export const SUPABASE_AUTH_PROVIDER_ID = "supabase-auth";
export const SUPABASE_POSTGRES_PROVIDER_ID = "supabase-postgres";

const BROWSER_SAFE_SUPABASE_ENV_KEYS = Object.freeze([
  "GAMEFOUNDRY_SUPABASE_URL",
  "GAMEFOUNDRY_SUPABASE_ANON_KEY",
]);

const SERVER_ONLY_SUPABASE_SECRET_KEYS = Object.freeze([
  "GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY",
  "GAMEFOUNDRY_SUPABASE_DATABASE_URL",
]);
const SUPABASE_POSTGRES_CONFIG_KEYS = Object.freeze([
  "GAMEFOUNDRY_SUPABASE_URL",
  "GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY",
]);
const SUPABASE_POSTGRES_SITE_SETUP_KEYS = Object.freeze([
  ...SUPABASE_POSTGRES_CONFIG_KEYS,
  "GAMEFOUNDRY_SUPABASE_DATABASE_URL",
]);
const SUPABASE_POSTGRES_TABLES = Object.freeze(["users", "roles", "user_roles"]);
const RUNTIME_ULID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const DEV_STATIC_USER_KEYS = Object.freeze([
  MOCK_DB_KEYS.users.user1,
  MOCK_DB_KEYS.users.user2,
  MOCK_DB_KEYS.users.user3,
  MOCK_DB_KEYS.users.admin,
]);

export const PROVIDER_ENVIRONMENT_VARIABLES = Object.freeze({
  browserSafeSupabase: BROWSER_SAFE_SUPABASE_ENV_KEYS,
  selectors: Object.freeze(["GAMEFOUNDRY_AUTH_PROVIDER", "GAMEFOUNDRY_DB_PROVIDER"]),
  serverOnlySupabaseCount: SERVER_ONLY_SUPABASE_SECRET_KEYS.length,
});

const SUPPORTED_AUTH_PROVIDERS = Object.freeze([LOCAL_AUTH_PROVIDER_ID, SUPABASE_AUTH_PROVIDER_ID]);
const SUPPORTED_DATABASE_PROVIDERS = Object.freeze([LOCAL_DATABASE_PROVIDER_ID, SUPABASE_POSTGRES_PROVIDER_ID]);

export const PROVIDER_SELECTION_CONTROLS = Object.freeze({
  auth: Object.freeze({
    environmentVariable: "GAMEFOUNDRY_AUTH_PROVIDER",
    supportedProviders: SUPPORTED_AUTH_PROVIDERS,
  }),
  database: Object.freeze({
    environmentVariable: "GAMEFOUNDRY_DB_PROVIDER",
    supportedProviders: SUPPORTED_DATABASE_PROVIDERS,
  }),
});

function envValue(env, key) {
  return String(env?.[key] || "").trim();
}

function missingEnvKeys(env, keys) {
  return keys.filter((key) => !envValue(env, key));
}

function requestedProvider(env, key, fallback, supportedValues) {
  const requested = envValue(env, key) || fallback;
  const supported = supportedValues.includes(requested);
  return {
    diagnostic: supported ? "" : `${key}=${requested} is not a supported provider. Use ${supportedValues.join(" or ")}.`,
    id: requested,
    requested,
    supported,
  };
}

export function supabaseAuthDiagnostic(env = process.env) {
  const missing = missingEnvKeys(env, BROWSER_SAFE_SUPABASE_ENV_KEYS);
  return missing.length
    ? `Supabase Auth provider selected but not configured. Missing browser-safe environment variables: ${missing.join(", ")}.`
    : "Supabase Auth provider adapter is configured and ready only when the auth provider selector is switched.";
}

export function supabasePostgresDiagnostic(env = process.env) {
  const missing = missingEnvKeys(env, SUPABASE_POSTGRES_CONFIG_KEYS);
  return missing.length
    ? "Supabase Postgres provider selected but not configured. Add the Supabase URL and server-only database credentials on the server; server-only details are not exposed through browser APIs."
    : "Supabase Postgres provider adapter is configured and ready only when the database provider selector is switched.";
}

function supabaseUrl(env) {
  return envValue(env, "GAMEFOUNDRY_SUPABASE_URL").replace(/\/+$/, "");
}

function supabaseAnonKey(env) {
  return envValue(env, "GAMEFOUNDRY_SUPABASE_ANON_KEY");
}

function supabaseServiceRoleKey(env) {
  return envValue(env, "GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY");
}

function authHeaders(env, accessToken = "") {
  const anonKey = supabaseAnonKey(env);
  const headers = {
    apikey: anonKey,
    authorization: `Bearer ${accessToken || anonKey}`,
    "content-type": "application/json",
  };
  return headers;
}

function postgresHeaders(env, prefer = "return=representation") {
  const serviceRoleKey = supabaseServiceRoleKey(env);
  return {
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
    "content-type": "application/json",
    prefer,
  };
}

function requireString(value, label) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    throw new Error(`Supabase Auth ${label} is required.`);
  }
  return normalized;
}

function requireIdentityString(value, label) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    throw new Error(`Supabase Postgres identity ${label} is required.`);
  }
  return normalized;
}

function optionalString(value) {
  return String(value || "").trim();
}

function normalizeAuditFields(source, actorKey, timestamp) {
  return {
    createdAt: optionalString(source.createdAt) || timestamp,
    updatedAt: optionalString(source.updatedAt) || timestamp,
    createdBy: optionalString(source.createdBy) || actorKey,
    updatedBy: optionalString(source.updatedBy) || actorKey,
  };
}

function requireTableName(tableName) {
  const normalized = String(tableName || "").trim();
  if (!SUPABASE_POSTGRES_TABLES.includes(normalized)) {
    throw new Error(`Supabase Postgres provider only supports ${SUPABASE_POSTGRES_TABLES.join(", ")} in this adapter surface.`);
  }
  return normalized;
}

async function readResponseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function createRuntimeUlid(now = Date.now()) {
  let remaining = BigInt(now);
  let encoded = "";
  for (let index = 0; index < 10; index += 1) {
    encoded = RUNTIME_ULID_ALPHABET[Number(remaining % 32n)] + encoded;
    remaining /= 32n;
  }
  return encoded + Array.from(randomBytes(16), (byte) => RUNTIME_ULID_ALPHABET[byte % 32]).join("").slice(0, 16);
}

function futureProviderMissingConfigWarnings(supabaseAuthMissing, supabasePostgresMissing) {
  const warnings = [];
  if (supabaseAuthMissing.length) {
    warnings.push(`Supabase Auth future provider is not configured. Missing browser-safe environment variables: ${supabaseAuthMissing.join(", ")}.`);
  }
  if (supabasePostgresMissing.length) {
    warnings.push("Supabase Postgres future provider is not configured. Missing browser-safe URL or server-only credentials are required; server-only details are not exposed through browser APIs.");
  }
  return warnings;
}

function configuredProviderIds(supabaseAuthMissing, supabasePostgresMissing) {
  return {
    auth: supabaseAuthMissing.length === 0
      ? [LOCAL_AUTH_PROVIDER_ID, SUPABASE_AUTH_PROVIDER_ID]
      : [LOCAL_AUTH_PROVIDER_ID],
    database: supabasePostgresMissing.length === 0
      ? [LOCAL_DATABASE_PROVIDER_ID, SUPABASE_POSTGRES_PROVIDER_ID]
      : [LOCAL_DATABASE_PROVIDER_ID],
  };
}

function providerFailure({ configDiagnostic, missingConfig, providerId, selection, supabaseProviderId }) {
  if (!selection.supported) {
    return {
      providerId: selection.requested,
      reason: "unsupported-provider",
      remediation: selection.diagnostic,
      selectedProviderAuthoritative: true,
    };
  }
  if (providerId === supabaseProviderId && missingConfig) {
    return {
      providerId,
      reason: "missing-configuration",
      remediation: configDiagnostic,
      selectedProviderAuthoritative: true,
    };
  }
  return null;
}

function preflightStatus({ ready, selected }) {
  if (ready) {
    return "PASS";
  }
  return selected ? "FAIL" : "WARN";
}

function createSupabasePreflight({
  auth,
  database,
  selectedProvidersReady,
  supabaseAuthReady,
  supabaseAuthSelected,
  supabasePostgresReadiness,
  supabasePostgresReady,
  supabasePostgresSelected,
  supabaseUrlReady,
  supabaseAnonKeyReady,
  supabaseServiceRoleReady,
}) {
  const checks = [
    {
      id: "auth-provider-selected",
      label: "Auth provider selected",
      providerId: auth.id,
      status: auth.supported ? "PASS" : "FAIL",
      summary: auth.supported
        ? `Auth provider selection is ${auth.id}.`
        : auth.diagnostic,
    },
    {
      id: "database-provider-selected",
      label: "DB provider selected",
      providerId: database.id,
      status: database.supported ? "PASS" : "FAIL",
      summary: database.supported
        ? `DB provider selection is ${database.id}.`
        : database.diagnostic,
    },
    {
      id: "supabase-url",
      label: "Supabase URL",
      status: preflightStatus({
        ready: supabaseUrlReady,
        selected: supabaseAuthSelected || supabasePostgresSelected,
      }),
      summary: supabaseUrlReady
        ? "Supabase URL is configured."
        : "Supabase URL is required before selecting Supabase Auth or Supabase Postgres.",
      visibility: "browser-safe",
    },
    {
      id: "supabase-anon-key",
      label: "Supabase anon key",
      status: preflightStatus({
        ready: supabaseAnonKeyReady,
        selected: supabaseAuthSelected,
      }),
      summary: supabaseAnonKeyReady
        ? "Supabase anon key is configured for browser-safe Auth requests."
        : "Supabase anon key is required before selecting Supabase Auth.",
      visibility: "browser-safe",
    },
    {
      id: "supabase-server-only-credential",
      label: "Supabase server-only credential",
      status: preflightStatus({
        ready: supabaseServiceRoleReady,
        selected: supabasePostgresSelected,
      }),
      summary: supabaseServiceRoleReady
        ? "Server-only Supabase database credential is configured on the server."
        : "Server-only Supabase database credential is required before selecting Supabase Postgres.",
      visibility: "server-only",
    },
    {
      id: "identity-tables-readiness",
      label: "users/roles/user_roles readiness",
      records: {
        roles: supabasePostgresReadiness.records.roles,
        user_roles: supabasePostgresReadiness.records.user_roles,
        users: supabasePostgresReadiness.records.users,
      },
      status: preflightStatus({
        ready: supabasePostgresReady,
        selected: supabasePostgresSelected,
      }),
      summary: supabasePostgresReady
        ? "Supabase identity tables are ready for users, roles, and user_roles checks."
        : "Supabase identity table readiness requires Supabase Postgres server configuration.",
    },
    {
      id: "site-setup-readiness",
      label: "Site Setup readiness",
      status: preflightStatus({
        ready: supabasePostgresReadiness.siteSetupReady,
        selected: supabasePostgresSelected,
      }),
      summary: supabasePostgresReadiness.siteSetupReady
        ? "Admin Site Setup readiness checks are available for Supabase Postgres."
        : "Admin Site Setup for Supabase requires server-only setup configuration.",
    },
  ];
  const failedChecks = checks.filter((check) => check.status === "FAIL");
  const warningChecks = checks.filter((check) => check.status === "WARN");
  return {
    checks,
    fallbackAllowed: false,
    overallStatus: failedChecks.length ? "FAIL" : warningChecks.length ? "WARN" : "PASS",
    selectedProvidersReady,
    serverOnlySecretNamesExposed: false,
    secretValuesExposed: false,
    supabaseSelected: supabaseAuthSelected || supabasePostgresSelected,
  };
}

export function createSupabasePostgresReadiness(env = process.env) {
  const adapterMissing = missingEnvKeys(env, SUPABASE_POSTGRES_CONFIG_KEYS);
  const siteSetupMissing = missingEnvKeys(env, SUPABASE_POSTGRES_SITE_SETUP_KEYS);
  const configured = adapterMissing.length === 0;
  const siteSetupReady = siteSetupMissing.length === 0;
  const blockers = [];
  if (!configured) {
    blockers.push("Add Supabase URL and server-only credentials before selecting Supabase Postgres.");
  }
  if (!siteSetupReady) {
    blockers.push("Add server-only direct SQL configuration before Admin Site Setup can run Supabase setup.");
  }
  return {
    configured,
    dbViewerReady: configured,
    providerId: SUPABASE_POSTGRES_PROVIDER_ID,
    records: {
      roles: configured,
      user_roles: configured,
      users: configured,
    },
    serverApiOwnsKeyGeneration: true,
    siteSetupReady,
    staticDevSeedUserUlidsOnly: true,
    status: configured ? "ready-when-selected" : "not-configured",
    blockers,
  };
}

export class SupabaseAuthProviderAdapter {
  constructor({ env = process.env, fetchImpl = globalThis.fetch } = {}) {
    this.env = env;
    this.fetchImpl = fetchImpl;
    this.providerId = SUPABASE_AUTH_PROVIDER_ID;
  }

  diagnostic() {
    return supabaseAuthDiagnostic(this.env);
  }

  assertConfigured() {
    const missing = missingEnvKeys(this.env, BROWSER_SAFE_SUPABASE_ENV_KEYS);
    if (missing.length) {
      throw new Error(supabaseAuthDiagnostic(this.env));
    }
    if (typeof this.fetchImpl !== "function") {
      throw new Error("Supabase Auth provider requires a server fetch implementation.");
    }
  }

  async request(path, { accessToken = "", body = null, method = "GET", operation } = {}) {
    this.assertConfigured();
    const response = await this.fetchImpl(`${supabaseUrl(this.env)}${path}`, {
      body: body === null ? undefined : JSON.stringify(body),
      headers: authHeaders(this.env, accessToken),
      method,
    });
    const payload = await readResponseJson(response);
    if (!response.ok) {
      const message = payload?.error_description || payload?.msg || payload?.message || "No Supabase Auth error message returned.";
      throw new Error(`Supabase Auth ${operation} failed with HTTP ${response.status}: ${message}`);
    }
    return payload;
  }

  async getCurrentUser({ accessToken } = {}) {
    this.assertConfigured();
    return this.request("/auth/v1/user", {
      accessToken: requireString(accessToken, "access token"),
      operation: "getCurrentUser",
    });
  }

  async signIn({ email, password } = {}) {
    this.assertConfigured();
    return this.request("/auth/v1/token?grant_type=password", {
      body: {
        email: requireString(email, "email"),
        password: requireString(password, "password"),
      },
      method: "POST",
      operation: "signIn",
    });
  }

  async signOut({ accessToken } = {}) {
    this.assertConfigured();
    return this.request("/auth/v1/logout", {
      accessToken: requireString(accessToken, "access token"),
      method: "POST",
      operation: "signOut",
    });
  }

  async createAccount({ email, password } = {}) {
    this.assertConfigured();
    return this.request("/auth/v1/signup", {
      body: {
        email: requireString(email, "email"),
        password: requireString(password, "password"),
      },
      method: "POST",
      operation: "createAccount",
    });
  }

  async requestPasswordReset({ email, redirectTo = "" } = {}) {
    this.assertConfigured();
    const body = { email: requireString(email, "email") };
    if (redirectTo) {
      body.redirect_to = redirectTo;
    }
    return this.request("/auth/v1/recover", {
      body,
      method: "POST",
      operation: "requestPasswordReset",
    });
  }

  requireRole() {
    throw new Error("Supabase Auth role checks require the future app user mapping adapter.");
  }
}

export const SupabaseAuthProviderStub = SupabaseAuthProviderAdapter;

export class SupabasePostgresProviderAdapter {
  constructor({ env = process.env, fetchImpl = globalThis.fetch, keyFactory = createRuntimeUlid } = {}) {
    this.env = env;
    this.fetchImpl = fetchImpl;
    this.keyFactory = keyFactory;
    this.providerId = SUPABASE_POSTGRES_PROVIDER_ID;
  }

  diagnostic() {
    return supabasePostgresDiagnostic(this.env);
  }

  readiness() {
    return createSupabasePostgresReadiness(this.env);
  }

  assertConfigured() {
    const readiness = this.readiness();
    if (!readiness.configured) {
      throw new Error(this.diagnostic());
    }
    if (typeof this.fetchImpl !== "function") {
      throw new Error("Supabase Postgres provider requires a server fetch implementation.");
    }
  }

  createRecordKey() {
    return this.keyFactory();
  }

  createIdentityKey(sourceKey = "") {
    const key = optionalString(sourceKey);
    return key || this.createRecordKey();
  }

  normalizeUserRecord(user = {}, actorKey, timestamp) {
    const key = this.createIdentityKey(user.key);
    return {
      key,
      displayName: optionalString(user.displayName) || "Creator",
      email: optionalString(user.email) || null,
      authProvider: optionalString(user.authProvider) || null,
      authProviderUserId: optionalString(user.authProviderUserId) || null,
      isActive: user.isActive !== false,
      ...normalizeAuditFields(user, actorKey, timestamp),
    };
  }

  normalizeRoleRecord(role = {}, actorKey, timestamp) {
    const roleSlug = requireIdentityString(role.roleSlug || role.slug, "roleSlug");
    return {
      key: this.createIdentityKey(role.key),
      roleSlug,
      name: optionalString(role.name) || roleSlug,
      description: optionalString(role.description),
      isSystemRole: role.isSystemRole === true,
      isActive: role.isActive !== false,
      ...normalizeAuditFields(role, actorKey, timestamp),
    };
  }

  normalizeUserRoleRecord(userRole = {}, roleKeyBySlug, actorKey, timestamp) {
    const roleKey = optionalString(userRole.roleKey) || roleKeyBySlug.get(optionalString(userRole.roleSlug || userRole.slug));
    return {
      key: this.createIdentityKey(userRole.key),
      userKey: requireIdentityString(userRole.userKey, "userKey"),
      roleKey: requireIdentityString(roleKey, "roleKey"),
      ...normalizeAuditFields(userRole, actorKey, timestamp),
    };
  }

  connect() {
    this.assertConfigured();
    return {
      boundary: PROVIDER_DATA_BOUNDARY_RULE,
      providerId: this.providerId,
      ready: true,
    };
  }

  async requestTable(tableName, { body = null, method = "GET", prefer = "return=representation", query = "select=*" } = {}) {
    this.assertConfigured();
    const table = requireTableName(tableName);
    const response = await this.fetchImpl(`${supabaseUrl(this.env)}/rest/v1/${encodeURIComponent(table)}?${query}`, {
      body: body === null ? undefined : JSON.stringify(body),
      headers: postgresHeaders(this.env, prefer),
      method,
    });
    const payload = await readResponseJson(response);
    if (!response.ok) {
      const message = payload?.message || payload?.hint || "No Supabase Postgres error message returned.";
      throw new Error(`Supabase Postgres ${table} request failed with HTTP ${response.status}: ${message}`);
    }
    return payload;
  }

  upsertTable(tableName, rows) {
    if (!rows.length) {
      return [];
    }
    return this.requestTable(tableName, {
      body: rows,
      method: "POST",
      prefer: "resolution=merge-duplicates,return=representation",
      query: "on_conflict=key",
    });
  }

  getUsers() {
    return this.requestTable("users");
  }

  getRoles() {
    return this.requestTable("roles");
  }

  getUserRoles() {
    return this.requestTable("user_roles");
  }

  async initializeIdentity({ actorKey = "", roles = [], userRoles = [], users = [] } = {}) {
    this.assertConfigured();
    const timestamp = new Date().toISOString();
    const normalizedUsers = users.map((user) => this.normalizeUserRecord(user, optionalString(actorKey) || optionalString(user.key), timestamp));
    const setupActorKey = optionalString(actorKey) || optionalString(normalizedUsers[0]?.key);
    if (!setupActorKey) {
      throw new Error("Supabase identity initialization requires actorKey or at least one user row.");
    }
    const finalizedUsers = normalizedUsers.map((user) => ({
      ...user,
      createdBy: optionalString(user.createdBy) || setupActorKey,
      updatedBy: optionalString(user.updatedBy) || setupActorKey,
    }));
    const normalizedRoles = roles.map((role) => this.normalizeRoleRecord(role, setupActorKey, timestamp));
    const roleKeyBySlug = new Map(normalizedRoles.map((role) => [role.roleSlug, role.key]));
    const normalizedUserRoles = userRoles.map((userRole) => this.normalizeUserRoleRecord(userRole, roleKeyBySlug, setupActorKey, timestamp));

    const writtenUsers = await this.upsertTable("users", finalizedUsers);
    const writtenRoles = await this.upsertTable("roles", normalizedRoles);
    const writtenUserRoles = await this.upsertTable("user_roles", normalizedUserRoles);

    return {
      boundary: PROVIDER_DATA_BOUNDARY_RULE,
      identityKeyModel: {
        roleKeyField: "roles.key",
        userKeyField: "users.key",
        userRoleRoleKeyField: "user_roles.roleKey",
        userRoleUserKeyField: "user_roles.userKey",
      },
      initialized: {
        roles: normalizedRoles.length,
        user_roles: normalizedUserRoles.length,
        users: finalizedUsers.length,
      },
      providerId: this.providerId,
      serverApiOwnsKeyGeneration: true,
      staticDevUserUlidExceptionUsed: finalizedUsers.some((user) => DEV_STATIC_USER_KEYS.includes(user.key)),
      written: {
        roles: Array.isArray(writtenRoles) ? writtenRoles.length : normalizedRoles.length,
        user_roles: Array.isArray(writtenUserRoles) ? writtenUserRoles.length : normalizedUserRoles.length,
        users: Array.isArray(writtenUsers) ? writtenUsers.length : finalizedUsers.length,
      },
    };
  }

  runSiteSetup() {
    this.assertConfigured();
    const readiness = this.readiness();
    if (!readiness.siteSetupReady) {
      throw new Error("Supabase Postgres Site Setup requires server-only direct SQL configuration before setup can run.");
    }
    return {
      executed: false,
      owner: "Admin -> Site Setup",
      providerId: this.providerId,
      ready: true,
    };
  }

  async getDbViewerSnapshot() {
    this.assertConfigured();
    const [users, roles, userRoles] = await Promise.all([
      this.getUsers(),
      this.getRoles(),
      this.getUserRoles(),
    ]);
    return {
      boundary: PROVIDER_DATA_BOUNDARY_RULE,
      providerId: this.providerId,
      readiness: this.readiness(),
      tables: {
        roles,
        user_roles: userRoles,
        users,
      },
    };
  }
}

export const SupabasePostgresProviderStub = SupabasePostgresProviderAdapter;

export function createProviderContractSnapshot(env = process.env) {
  const auth = requestedProvider(env, "GAMEFOUNDRY_AUTH_PROVIDER", LOCAL_AUTH_PROVIDER_ID, SUPPORTED_AUTH_PROVIDERS);
  const database = requestedProvider(env, "GAMEFOUNDRY_DB_PROVIDER", LOCAL_DATABASE_PROVIDER_ID, SUPPORTED_DATABASE_PROVIDERS);
  const diagnostics = [auth.diagnostic, database.diagnostic].filter(Boolean);
  const supabaseAuthMissing = missingEnvKeys(env, BROWSER_SAFE_SUPABASE_ENV_KEYS);
  const supabasePostgresMissing = missingEnvKeys(env, SUPABASE_POSTGRES_CONFIG_KEYS);
  const supabasePostgresReadiness = createSupabasePostgresReadiness(env);
  const supabaseAuthSelected = auth.id === SUPABASE_AUTH_PROVIDER_ID;
  const supabasePostgresSelected = database.id === SUPABASE_POSTGRES_PROVIDER_ID;
  const missingConfigWarnings = futureProviderMissingConfigWarnings(supabaseAuthMissing, supabasePostgresMissing);
  const supabaseAuthReady = supabaseAuthMissing.length === 0;
  const supabasePostgresReady = supabasePostgresReadiness.configured;
  const supabaseUrlReady = Boolean(envValue(env, "GAMEFOUNDRY_SUPABASE_URL"));
  const supabaseAnonKeyReady = Boolean(envValue(env, "GAMEFOUNDRY_SUPABASE_ANON_KEY"));
  const supabaseServiceRoleReady = Boolean(envValue(env, "GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY"));
  const providerFailures = [
    providerFailure({
      configDiagnostic: supabaseAuthDiagnostic(env),
      missingConfig: supabaseAuthMissing.length > 0,
      providerId: auth.id,
      selection: auth,
      supabaseProviderId: SUPABASE_AUTH_PROVIDER_ID,
    }),
    providerFailure({
      configDiagnostic: supabasePostgresDiagnostic(env),
      missingConfig: supabasePostgresMissing.length > 0,
      providerId: database.id,
      selection: database,
      supabaseProviderId: SUPABASE_POSTGRES_PROVIDER_ID,
    }),
  ].filter(Boolean);
  const selectedProvidersReady = providerFailures.length === 0;
  const identityOwnerProviderId = supabaseAuthSelected ? SUPABASE_AUTH_PROVIDER_ID : LOCAL_AUTH_PROVIDER_ID;
  const identityReaderProviderId = supabaseAuthSelected ? SUPABASE_POSTGRES_PROVIDER_ID : LOCAL_DATABASE_PROVIDER_ID;
  const identityConfigured = supabaseAuthSelected ? supabasePostgresReady : auth.id === LOCAL_AUTH_PROVIDER_ID;
  const supabasePreflight = createSupabasePreflight({
    auth,
    database,
    selectedProvidersReady,
    supabaseAnonKeyReady,
    supabaseAuthReady,
    supabaseAuthSelected,
    supabasePostgresReadiness,
    supabasePostgresReady,
    supabasePostgresSelected,
    supabaseServiceRoleReady,
    supabaseUrlReady,
  });

  if (supabaseAuthSelected) {
    diagnostics.push(supabaseAuthDiagnostic(env));
  }
  if (supabasePostgresSelected) {
    diagnostics.push(supabasePostgresDiagnostic(env));
  }

  return {
    activeProviders: {
      authProviderId: auth.id,
      databaseProviderId: database.id,
      diagnostic: "Selected providers are authoritative. Missing or unsupported selected providers fail visibly; no automatic Local DB fallback is used.",
      status: selectedProvidersReady ? "ready" : "failed",
    },
    activationReadiness: {
      blockers: [
        ...supabaseAuthMissing.map((key) => `Add browser-safe ${key} before selecting Supabase Auth.`),
        ...supabasePostgresReadiness.blockers,
      ],
      localDbSelected: auth.id === LOCAL_AUTH_PROVIDER_ID && database.id === LOCAL_DATABASE_PROVIDER_ID,
      readyBeforeActivation: supabaseAuthReady && supabasePostgresReady,
      selectedProvidersReady,
      siteSetupReady: supabasePostgresReadiness.siteSetupReady,
      supabaseAuthReady,
      supabasePostgresReady,
    },
    boundary: PROVIDER_DATA_BOUNDARY_RULE,
    diagnostics,
    failureContract: {
      automaticFallbackAllowed: false,
      providerChainingAllowed: false,
      selectedProviderAuthoritative: true,
    },
    identityOwnership: {
      auditFields: ["createdAt", "updatedAt", "createdBy", "updatedBy"],
      browserAuthoritativeKeysAllowed: false,
      dataMigrationActive: false,
      identityConfigured,
      ownerProviderId: identityOwnerProviderId,
      ownershipFields: ["key", "createdAt", "updatedAt", "createdBy", "updatedBy"],
      productDatabaseProviderId: database.id,
      readerProviderId: identityReaderProviderId,
      selectedAuthProviderId: auth.id,
      selectedDatabaseProviderId: database.id,
      serverApiOwnsKeyGeneration: true,
      staticDevUserUlidException: "User 1, User 2, User 3, and DavidQ admin only.",
      tables: SUPABASE_POSTGRES_TABLES.slice(),
      temporaryDevOnlyException: "Static ULIDs are allowed only for the four seeded DEV user records and required user_roles references.",
      userKeyAuthority: "users.key",
    },
    providerDiagnostics: {
      activeProvider: {
        authProviderId: auth.id,
        databaseProviderId: database.id,
      },
      configuredProviders: configuredProviderIds(supabaseAuthMissing, supabasePostgresMissing),
      missingConfigWarnings,
      providerFailures,
      selectionControls: {
        auth: {
          environmentVariable: PROVIDER_SELECTION_CONTROLS.auth.environmentVariable,
          selectedProviderId: auth.id,
          supportedProviders: PROVIDER_SELECTION_CONTROLS.auth.supportedProviders.slice(),
        },
        database: {
          environmentVariable: PROVIDER_SELECTION_CONTROLS.database.environmentVariable,
          selectedProviderId: database.id,
          supportedProviders: PROVIDER_SELECTION_CONTROLS.database.supportedProviders.slice(),
        },
      },
      requiredEnvironmentVariables: {
        browserSafeSupabase: BROWSER_SAFE_SUPABASE_ENV_KEYS.slice(),
        selectors: PROVIDER_ENVIRONMENT_VARIABLES.selectors.slice(),
        serverOnlySupabaseCount: PROVIDER_ENVIRONMENT_VARIABLES.serverOnlySupabaseCount,
      },
      secretValuesExposed: false,
      serverOnlyEnvironmentVariableNamesExposed: false,
    },
    requestedProviders: {
      authProviderId: auth.requested,
      databaseProviderId: database.requested,
    },
    runtimeActivation: {
      apiBoundary: PROVIDER_DATA_BOUNDARY_RULE,
      browserReceivesServiceRoleSecrets: false,
      localDbSelected: auth.id === LOCAL_AUTH_PROVIDER_ID && database.id === LOCAL_DATABASE_PROVIDER_ID,
      selectedProvidersCanServeRuntime: selectedProvidersReady,
      selectedProvidersFailed: !selectedProvidersReady,
      supabaseAuthSelected,
      supabasePostgresSelected,
    },
    supabaseAuth: {
      configured: supabaseAuthMissing.length === 0,
      adapter: {
        activeByDefault: false,
        implementation: "config-gated Supabase Auth REST adapter",
        passwordStorage: "external-provider",
        serviceRoleSecretsUsed: false,
      },
      diagnostic: supabaseAuthSelected ? supabaseAuthDiagnostic(env) : "Supabase Auth provider adapter is inactive.",
      missingBrowserSafeEnvironmentVariables: supabaseAuthSelected ? supabaseAuthMissing : [],
      operations: AUTH_PROVIDER_CONTRACT_OPERATIONS.slice(),
      providerId: SUPABASE_AUTH_PROVIDER_ID,
      status: supabaseAuthSelected && supabaseAuthMissing.length
        ? "not-configured"
        : supabaseAuthMissing.length
          ? "adapter-inactive"
          : "adapter-ready",
      userMapping: {
        appUserKeyField: "users.key",
        browserAuthoritativeUserKeysAllowed: false,
        externalAuthUserIdField: "supabase.auth.user.id",
        owner: "server-api",
      },
    },
    supabasePreflight,
    supabasePostgres: {
      configured: supabasePostgresMissing.length === 0,
      adapter: {
        activeByDefault: false,
        implementation: "config-gated Supabase Postgres REST adapter",
        keyGenerationOwner: "server-api",
        staticUlidsAllowedOnlyForDevSeedUsers: true,
      },
      dataMigrationActive: false,
      diagnostic: supabasePostgresSelected ? supabasePostgresDiagnostic(env) : "Supabase Postgres provider adapter is inactive.",
      readiness: supabasePostgresReadiness,
      executionOwnership: {
        dev: "Codex may execute DEV setup/migration only after a dedicated Supabase DEV PR.",
        prod: "User-controlled reviewed SQL/setup execution.",
        uat: "User-controlled reviewed SQL/setup execution.",
      },
      identityMigration: {
        activeByDefault: false,
        auditFields: ["createdAt", "updatedAt", "createdBy", "updatedBy"],
        serverApiOwnsKeyGeneration: true,
        staticDevUserUlidException: "User 1, User 2, User 3, and DavidQ admin only.",
        tables: SUPABASE_POSTGRES_TABLES.slice(),
      },
      migrationSequence: [
        "Supabase Auth",
        "Supabase users/roles/user_roles",
        "Supabase tool/product data groups",
      ],
      operations: POSTGRES_PROVIDER_CONTRACT_OPERATIONS.slice(),
      providerId: SUPABASE_POSTGRES_PROVIDER_ID,
      serverOnlySecretsExposed: false,
      serverOnlySecretNamesExposed: false,
      status: supabasePostgresSelected && supabasePostgresMissing.length
        ? "not-configured"
        : supabasePostgresMissing.length
          ? "adapter-inactive"
          : "adapter-ready",
    },
  };
}
