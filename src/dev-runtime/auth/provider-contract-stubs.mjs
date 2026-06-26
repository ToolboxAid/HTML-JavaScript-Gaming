import { randomBytes } from "node:crypto";
import { createPostgresConnectionClient } from "../persistence/postgres-connection-client.mjs";
import { SEED_DB_KEYS } from "../seed/seed-db-keys.mjs";

export const AUTH_PROVIDER_CONTRACT_OPERATIONS = Object.freeze([
  "getCurrentUser",
  "signIn",
  "signOut",
  "createAccount",
  "listAdminUsers",
  "listAllAdminUsers",
  "updateAccount",
  "deleteTestAccount",
  "requestPasswordReset",
  "requireRole",
]);

export const POSTGRES_PROVIDER_CONTRACT_OPERATIONS = Object.freeze([
  "connect",
  "getUsers",
  "getRoles",
  "getUserRoles",
  "getTableRows",
  "getTables",
  "getProductTableRows",
  "getProductTables",
  "initializeIdentity",
  "upsertProductTable",
  "upsertProductTables",
  "deleteRoleByKey",
  "deleteUserByKey",
  "deleteUserRoleByKey",
  "deleteUserRolesForRoleKey",
  "deleteUserRolesForUserKey",
  "getPlatformSettings",
  "reassignRoleAuditReferences",
  "reassignUserRoleAuditReferences",
  "runSiteSetup",
  "getDbViewerSnapshot",
  "upsertPlatformSettings",
]);

export const PROVIDER_DATA_BOUNDARY_RULE = "Browser -> API/Service Contract -> Database";

export const SUPABASE_AUTH_PROVIDER_ID = "supabase-auth";
export const SUPABASE_POSTGRES_PROVIDER_ID = "supabase-postgres";

const BROWSER_SAFE_SUPABASE_ENV_KEYS = Object.freeze([
  "GAMEFOUNDRY_SUPABASE_URL",
  "GAMEFOUNDRY_SUPABASE_ANON_KEY",
]);

const SERVER_ONLY_SUPABASE_SECRET_KEYS = Object.freeze([
  "GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY",
  "GAMEFOUNDRY_DATABASE_URL",
]);
const SUPABASE_POSTGRES_CONFIG_KEYS = Object.freeze([
  "GAMEFOUNDRY_DATABASE_URL",
  "GAMEFOUNDRY_DATABASE_SSL",
]);
const SUPABASE_POSTGRES_SITE_SETUP_KEYS = Object.freeze([
  "GAMEFOUNDRY_DATABASE_URL",
  "GAMEFOUNDRY_DATABASE_SSL",
]);
export const SUPABASE_POSTGRES_IDENTITY_TABLES = Object.freeze(["users", "roles", "user_roles"]);
export const SUPABASE_POSTGRES_PRODUCT_TABLES = Object.freeze([
  "platform_settings",
  "membership_plans",
  "membership_limits",
  "founding_members",
  "user_memberships",
  "ai_actions",
  "ai_credit_packs",
  "user_ai_credits",
  "ai_usage_log",
  "project_members",
  "legal_documents",
  "legal_document_versions",
  "marketplace_categories",
  "game_workspace_games",
  "game_workspace_progress",
  "game_design_documents",
  "game_design_validation_items",
  "game_design_sections",
  "game_design_capability_demos",
  "game_configuration_records",
  "game_configuration_validation_items",
  "object_definition_records",
  "game_input_mappings",
  "player_controller_profiles",
  "player_input_device_selections",
  "input_custom_action_records",
  "game_journey_completion_metrics",
  "game_journey_note_types",
  "game_journey_notes",
  "game_journey_templates",
  "game_journey_items",
  "game_journey_activity",
  "palette_colors",
  "palette_source_swatches",
  "palette_swatch_usages",
  "project_workspace_palette_globals",
  "project_tags",
  "project_tag_assignments",
  "asset_role_definitions",
  "asset_library_items",
  "asset_storage_objects",
  "asset_import_events",
  "asset_validation_items",
  "toolbox_tool_metadata",
  "toolbox_tool_planning",
  "toolbox_votes",
  "support_categories",
]);
export const SUPABASE_POSTGRES_TABLES = Object.freeze([
  ...SUPABASE_POSTGRES_IDENTITY_TABLES,
  ...SUPABASE_POSTGRES_PRODUCT_TABLES,
]);
const RUNTIME_ULID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const DEV_STATIC_USER_KEYS = Object.freeze([
  SEED_DB_KEYS.users.user1,
  SEED_DB_KEYS.users.user2,
  SEED_DB_KEYS.users.user3,
  SEED_DB_KEYS.users.admin,
]);

export const PROVIDER_ENVIRONMENT_VARIABLES = Object.freeze({
  browserSafeSupabase: BROWSER_SAFE_SUPABASE_ENV_KEYS,
  serverOnlySupabaseCount: SERVER_ONLY_SUPABASE_SECRET_KEYS.length,
});

const SUPPORTED_AUTH_PROVIDERS = Object.freeze([SUPABASE_AUTH_PROVIDER_ID]);
const SUPPORTED_DATABASE_PROVIDERS = Object.freeze([SUPABASE_POSTGRES_PROVIDER_ID]);
const DEFAULT_AUTH_PROVIDER_ID = SUPABASE_AUTH_PROVIDER_ID;
const DEFAULT_DATABASE_PROVIDER_ID = SUPABASE_POSTGRES_PROVIDER_ID;

export const FIXED_RUNTIME_PROVIDER_PATH = Object.freeze({
  authProviderId: SUPABASE_AUTH_PROVIDER_ID,
  databaseProviderId: SUPABASE_POSTGRES_PROVIDER_ID,
});

function envValue(env, key) {
  return String(env?.[key] || "").trim();
}

function missingEnvKeys(env, keys) {
  return keys.filter((key) => !envValue(env, key));
}

export function supabaseAuthDiagnostic(env = process.env) {
  const missing = missingEnvKeys(env, BROWSER_SAFE_SUPABASE_ENV_KEYS);
  return missing.length
    ? `Supabase Auth connection is not configured. Missing browser-safe environment variables: ${missing.join(", ")}.`
    : "Supabase Auth connection adapter is configured for the fixed runtime path.";
}

export function supabasePostgresDiagnostic(env = process.env) {
  const missing = missingEnvKeys(env, SUPABASE_POSTGRES_CONFIG_KEYS);
  return missing.length
    ? `Configured database connection is not configured. Add ${missing.join(", ")} on the server; server-only details are not exposed through browser APIs.`
    : "Configured database connection adapter is ready for the fixed runtime path.";
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

function authAdminHeaders(env) {
  const serviceRoleKey = supabaseServiceRoleKey(env);
  return {
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
    "content-type": "application/json",
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
    throw new Error(`Supabase Postgres connection only supports ${SUPABASE_POSTGRES_TABLES.join(", ")} in this adapter surface.`);
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

function safeSupabaseAuthErrorCode(payload = {}) {
  return String(payload?.code || payload?.error_code || payload?.error || "").trim();
}

function safeSupabaseAuthErrorMessage(payload = {}) {
  return String(
    payload?.error_description ||
    payload?.msg ||
    payload?.message ||
    "No Supabase Auth error message returned.",
  ).trim();
}

function supabaseAuthUpstreamError(operation, response, payload = {}) {
  const message = safeSupabaseAuthErrorMessage(payload);
  const error = new Error(`Supabase Auth ${operation} failed with HTTP ${response.status}: ${message}`);
  error.upstreamStatusCode = response.status;
  error.safeErrorCode = safeSupabaseAuthErrorCode(payload);
  error.safeErrorMessage = message;
  return error;
}

function safeErrorMessage(error) {
  return error instanceof Error ? error.message : String(error || "Unknown database error.");
}

function isRecoverableDbViewerTableError(error) {
  const message = safeErrorMessage(error);
  if (/Database connection failed|GAMEFOUNDRY_DATABASE_URL|authentication|timed out|ECONNREFUSED|ENOTFOUND|Connection closed/i.test(message)) {
    return false;
  }
  return /relation .* does not exist|does not exist|schema cache|undefined_table|permission denied|not found|HTTP 404/i.test(message);
}

function dbViewerTableDiagnostic(tableName, error) {
  return {
    code: "DB_VIEWER_TABLE_UNAVAILABLE",
    level: "WARN",
    message: `${tableName} could not be read from the configured database: ${safeErrorMessage(error)}`,
    remediation: `Confirm the ${tableName} table exists in the configured database and apply the product data migration for that table.`,
    status: "WARN",
    tableName,
  };
}

function attachSupabaseAuthOperatorMetadata(payload, response) {
  if (payload && typeof payload === "object") {
    Object.defineProperty(payload, "__operator", {
      configurable: false,
      enumerable: false,
      value: {
        upstreamStatusCode: response.status,
      },
    });
  }
  return payload;
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

function supabaseMissingConfigWarnings(supabaseAuthMissing, supabasePostgresMissing) {
  const warnings = [];
  if (supabaseAuthMissing.length) {
    warnings.push(`Supabase Auth is not configured. Missing browser-safe environment variables: ${supabaseAuthMissing.join(", ")}.`);
  }
  if (supabasePostgresMissing.length) {
    warnings.push(`Configured database connection is not configured. ${supabasePostgresMissing.join(", ")} required on the server; server-only details are not exposed through browser APIs.`);
  }
  return warnings;
}

function configuredProviderIds(supabaseAuthMissing, supabasePostgresMissing) {
  return {
    auth: supabaseAuthMissing.length === 0
      ? [SUPABASE_AUTH_PROVIDER_ID]
      : [],
    database: supabasePostgresMissing.length === 0
      ? [SUPABASE_POSTGRES_PROVIDER_ID]
      : [],
  };
}

function providerFailure({ configDiagnostic, missingConfig, providerId }) {
  if (missingConfig) {
    return {
      providerId,
      reason: "missing-configuration",
      remediation: configDiagnostic,
      runtimeProviderPathFixed: true,
    };
  }
  return null;
}

function preflightStatus({ active, ready }) {
  if (ready) {
    return "PASS";
  }
  return active ? "FAIL" : "WARN";
}

function createSupabasePreflight({
  auth,
  database,
  runtimeProviderPathReady,
  supabaseAuthActive,
  supabaseAuthReady,
  supabasePostgresActive,
  supabasePostgresReadiness,
  supabasePostgresReady,
  supabaseUrlReady,
  supabaseAnonKeyReady,
  databaseUrlReady,
}) {
  const checks = [
    {
      id: "runtime-auth-provider",
      label: "Runtime account connection",
      providerId: auth.id,
      status: auth.supported ? "PASS" : "FAIL",
      summary: auth.supported
        ? `Runtime account connection path is ${auth.id}.`
        : auth.diagnostic,
    },
    {
      id: "runtime-database-provider",
      label: "Runtime product data connection",
      providerId: database.id,
      status: database.supported ? "PASS" : "FAIL",
      summary: database.supported
        ? `Runtime product data connection path is ${database.id}.`
        : database.diagnostic,
    },
    {
      id: "supabase-url",
      label: "Supabase URL",
      status: preflightStatus({
        active: supabaseAuthActive || supabasePostgresActive,
        ready: supabaseUrlReady,
      }),
      summary: supabaseUrlReady
        ? "Supabase URL is configured."
        : "Supabase URL is required for Supabase Auth.",
      visibility: "browser-safe",
    },
    {
      id: "supabase-anon-key",
      label: "Supabase anon key",
      status: preflightStatus({
        active: supabaseAuthActive,
        ready: supabaseAnonKeyReady,
      }),
      summary: supabaseAnonKeyReady
        ? "Supabase anon key is configured for browser-safe Auth requests."
        : "Supabase anon key is required for Supabase Auth.",
      visibility: "browser-safe",
    },
    {
      id: "database-url",
      label: "Database connection URL",
      status: preflightStatus({
        active: supabasePostgresActive,
        ready: databaseUrlReady,
      }),
      summary: databaseUrlReady
        ? "Server-only database connection URL is configured on the server."
        : "GAMEFOUNDRY_DATABASE_URL is required for product data.",
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
        active: supabasePostgresActive,
        ready: supabasePostgresReady,
      }),
      summary: supabasePostgresReady
        ? "Supabase identity tables are ready for users, roles, and user_roles checks."
        : "Supabase identity table readiness requires Supabase Postgres server configuration.",
    },
    {
      id: "site-setup-readiness",
      label: "Admin Operations readiness",
      status: preflightStatus({
        active: supabasePostgresActive,
        ready: supabasePostgresReadiness.siteSetupReady,
      }),
      summary: supabasePostgresReadiness.siteSetupReady
        ? "Admin Operations readiness checks are available for Supabase Postgres."
        : "Admin Operations for Supabase requires server-only setup configuration.",
    },
  ];
  const failedChecks = checks.filter((check) => check.status === "FAIL");
  const warningChecks = checks.filter((check) => check.status === "WARN");
  return {
    checks,
    fallbackAllowed: false,
    overallStatus: failedChecks.length ? "FAIL" : warningChecks.length ? "WARN" : "PASS",
    runtimeProviderPathReady,
    serverOnlySecretNamesExposed: false,
    secretValuesExposed: false,
    supabaseActive: supabaseAuthActive || supabasePostgresActive,
  };
}

export function createSupabasePostgresReadiness(env = process.env) {
  const adapterMissing = missingEnvKeys(env, SUPABASE_POSTGRES_CONFIG_KEYS);
  const siteSetupMissing = missingEnvKeys(env, SUPABASE_POSTGRES_SITE_SETUP_KEYS);
  const configured = adapterMissing.length === 0;
  const siteSetupReady = siteSetupMissing.length === 0;
  const blockers = [];
  if (!configured) {
    blockers.push(`Add ${adapterMissing.join(", ")} for the configured database connection.`);
  }
  if (!siteSetupReady) {
    blockers.push("Add server-only direct database configuration before Admin Operations can run setup.");
  }
  return {
    configured,
    dbViewerReady: configured,
    providerId: SUPABASE_POSTGRES_PROVIDER_ID,
    productTables: Object.fromEntries(SUPABASE_POSTGRES_PRODUCT_TABLES.map((tableName) => [tableName, configured])),
    records: {
      roles: configured,
      user_roles: configured,
      users: configured,
    },
    serverApiOwnsKeyGeneration: true,
    siteSetupReady,
    staticDevSeedUserUlidsOnly: true,
    status: configured ? "ready" : "not-configured",
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
      throw new Error("Supabase Auth connection requires a server fetch implementation.");
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
      throw supabaseAuthUpstreamError(operation, response, payload);
    }
    return attachSupabaseAuthOperatorMetadata(payload, response);
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
    const serviceRoleKey = supabaseServiceRoleKey(this.env);
    if (!serviceRoleKey) {
      throw new Error("Supabase Auth createAccount requires the server-only service role key.");
    }
    const response = await this.fetchImpl(`${supabaseUrl(this.env)}/auth/v1/admin/users`, {
      body: JSON.stringify({
        email: requireString(email, "email"),
        email_confirm: true,
        password: requireString(password, "password"),
      }),
      headers: authAdminHeaders(this.env),
      method: "POST",
    });
    const payload = await readResponseJson(response);
    if (!response.ok) {
      throw supabaseAuthUpstreamError("createAccount", response, payload);
    }
    if (payload?.id && !payload.user) {
      return attachSupabaseAuthOperatorMetadata({
        user: {
          email: payload.email || email,
          id: payload.id,
        },
        ...payload,
      }, response);
    }
    return attachSupabaseAuthOperatorMetadata(payload, response);
  }

  async listAdminUsers({ page = 1, perPage = 100 } = {}) {
    this.assertConfigured();
    const serviceRoleKey = supabaseServiceRoleKey(this.env);
    if (!serviceRoleKey) {
      throw new Error("Supabase Auth listAdminUsers requires the server-only service role key.");
    }
    const params = new URLSearchParams({
      page: String(Math.max(1, Number(page) || 1)),
      per_page: String(Math.max(1, Math.min(1000, Number(perPage) || 100))),
    });
    const response = await this.fetchImpl(`${supabaseUrl(this.env)}/auth/v1/admin/users?${params}`, {
      headers: authAdminHeaders(this.env),
      method: "GET",
    });
    const payload = await readResponseJson(response);
    if (!response.ok) {
      throw supabaseAuthUpstreamError("listAdminUsers", response, payload);
    }
    return attachSupabaseAuthOperatorMetadata(payload, response);
  }

  async listAllAdminUsers({ perPage = 100 } = {}) {
    const users = [];
    let page = 1;
    while (true) {
      const payload = await this.listAdminUsers({ page, perPage });
      const pageUsers = Array.isArray(payload?.users)
        ? payload.users
        : Array.isArray(payload)
          ? payload
          : [];
      users.push(...pageUsers);
      const totalPages = Number(payload?.total_pages || payload?.last_page || 0);
      const totalUsers = Number(payload?.total || 0);
      if (totalPages && page >= totalPages) {
        break;
      }
      if (totalUsers && users.length >= totalUsers) {
        break;
      }
      if (pageUsers.length < Math.max(1, Number(perPage) || 100)) {
        break;
      }
      page += 1;
    }
    return users;
  }

  async updateAccount({ authProviderUserId, email = "", password = "", userMetadata = {} } = {}) {
    this.assertConfigured();
    const serviceRoleKey = supabaseServiceRoleKey(this.env);
    if (!serviceRoleKey) {
      throw new Error("Supabase Auth updateAccount requires the server-only service role key.");
    }
    const body = {
      email_confirm: true,
      user_metadata: userMetadata && typeof userMetadata === "object" ? userMetadata : {},
    };
    const normalizedEmail = optionalString(email);
    if (normalizedEmail) {
      body.email = normalizedEmail;
    }
    const normalizedPassword = optionalString(password);
    if (normalizedPassword) {
      body.password = normalizedPassword;
    }
    const response = await this.fetchImpl(`${supabaseUrl(this.env)}/auth/v1/admin/users/${encodeURIComponent(requireString(authProviderUserId, "authProviderUserId"))}`, {
      body: JSON.stringify(body),
      headers: authAdminHeaders(this.env),
      method: "PUT",
    });
    const payload = await readResponseJson(response);
    if (!response.ok) {
      throw supabaseAuthUpstreamError("updateAccount", response, payload);
    }
    return attachSupabaseAuthOperatorMetadata(payload, response);
  }

  async deleteTestAccount({ authProviderUserId } = {}) {
    this.assertConfigured();
    const serviceRoleKey = supabaseServiceRoleKey(this.env);
    if (!serviceRoleKey) {
      throw new Error("Supabase Auth deleteTestAccount requires the server-only service role key.");
    }
    const response = await this.fetchImpl(`${supabaseUrl(this.env)}/auth/v1/admin/users/${encodeURIComponent(requireString(authProviderUserId, "authProviderUserId"))}`, {
      headers: authAdminHeaders(this.env),
      method: "DELETE",
    });
    const payload = await readResponseJson(response);
    if (!response.ok && response.status !== 404) {
      throw supabaseAuthUpstreamError("deleteTestAccount", response, payload);
    }
    return attachSupabaseAuthOperatorMetadata({
      deleted: response.status !== 404,
      notFound: response.status === 404,
      ...payload,
    }, response);
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
  constructor({ env = process.env, keyFactory = createRuntimeUlid, postgresClient = null } = {}) {
    this.env = env;
    this.keyFactory = keyFactory;
    this.postgresClient = postgresClient;
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
  }

  databaseClient() {
    return this.postgresClient || createPostgresConnectionClient({ env: this.env });
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
    try {
      return await this.databaseClient().requestTable(table, {
        body,
        method,
        prefer,
        query,
      });
    } catch (error) {
      throw new Error(`Configured database ${table} request failed: ${error instanceof Error ? error.message : String(error || "Unknown database error.")}`);
    }
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

  getTableRows(tableName) {
    return this.requestTable(tableName);
  }

  async getTables(tableNames = SUPABASE_POSTGRES_TABLES) {
    const pairs = await Promise.all(tableNames.map(async (tableName) => [
      requireTableName(tableName),
      await this.getTableRows(tableName),
    ]));
    return Object.fromEntries(pairs);
  }

  getProductTableRows(tableName) {
    const table = requireTableName(tableName);
    if (!SUPABASE_POSTGRES_PRODUCT_TABLES.includes(table)) {
      throw new Error(`Supabase Postgres product data adapter cannot read non-product table ${table}.`);
    }
    return this.getTableRows(table);
  }

  getProductTables(tableNames = SUPABASE_POSTGRES_PRODUCT_TABLES) {
    tableNames.forEach((tableName) => {
      if (!SUPABASE_POSTGRES_PRODUCT_TABLES.includes(requireTableName(tableName))) {
        throw new Error(`Supabase Postgres product data adapter cannot read non-product table ${tableName}.`);
      }
    });
    return this.getTables(tableNames);
  }

  upsertProductTable(tableName, rows = []) {
    const table = requireTableName(tableName);
    if (!SUPABASE_POSTGRES_PRODUCT_TABLES.includes(table)) {
      throw new Error(`Supabase Postgres product data adapter cannot write non-product table ${table}.`);
    }
    return this.upsertTable(table, rows.map((row) => ({
      key: optionalString(row?.key) || this.createRecordKey(),
      ...row,
    })));
  }

  async upsertProductTables(tables = {}) {
    const written = {};
    for (const tableName of SUPABASE_POSTGRES_PRODUCT_TABLES) {
      const rows = Array.isArray(tables[tableName]) ? tables[tableName] : [];
      if (rows.length) {
        const result = await this.upsertProductTable(tableName, rows);
        written[tableName] = Array.isArray(result) ? result.length : rows.length;
      } else {
        written[tableName] = 0;
      }
    }
    return {
      boundary: PROVIDER_DATA_BOUNDARY_RULE,
      providerId: this.providerId,
      serverApiOwnsKeyGeneration: true,
      written,
    };
  }

  deleteUserByKey(userKey) {
    return this.requestTable("users", {
      method: "DELETE",
      prefer: "return=representation",
      query: `key=eq.${encodeURIComponent(requireIdentityString(userKey, "userKey"))}`,
    });
  }

  deleteUserRolesForUserKey(userKey) {
    return this.requestTable("user_roles", {
      method: "DELETE",
      prefer: "return=representation",
      query: `userKey=eq.${encodeURIComponent(requireIdentityString(userKey, "userKey"))}`,
    });
  }

  deleteUserRoleByKey(userRoleKey) {
    return this.requestTable("user_roles", {
      method: "DELETE",
      prefer: "return=representation",
      query: `key=eq.${encodeURIComponent(requireIdentityString(userRoleKey, "userRoleKey"))}`,
    });
  }

  deleteUserRolesForRoleKey(roleKey) {
    return this.requestTable("user_roles", {
      method: "DELETE",
      prefer: "return=representation",
      query: `roleKey=eq.${encodeURIComponent(requireIdentityString(roleKey, "roleKey"))}`,
    });
  }

  deleteRoleByKey(roleKey) {
    return this.requestTable("roles", {
      method: "DELETE",
      prefer: "return=representation",
      query: `key=eq.${encodeURIComponent(requireIdentityString(roleKey, "roleKey"))}`,
    });
  }

  async reassignRoleAuditReferences({ fromUserKey, toUserKey } = {}) {
    const fromKey = requireIdentityString(fromUserKey, "fromUserKey");
    const toKey = requireIdentityString(toUserKey, "toUserKey");
    if (fromKey === toKey) {
      throw new Error("Supabase role audit reassignment requires distinct fromUserKey and toUserKey values.");
    }
    const createdBy = await this.requestTable("roles", {
      body: { createdBy: toKey },
      method: "PATCH",
      prefer: "return=representation",
      query: `createdBy=eq.${encodeURIComponent(fromKey)}`,
    });
    const updatedBy = await this.requestTable("roles", {
      body: { updatedBy: toKey },
      method: "PATCH",
      prefer: "return=representation",
      query: `updatedBy=eq.${encodeURIComponent(fromKey)}`,
    });
    return { createdBy, updatedBy };
  }

  async reassignUserRoleAuditReferences({ fromUserKey, toUserKey } = {}) {
    const fromKey = requireIdentityString(fromUserKey, "fromUserKey");
    const toKey = requireIdentityString(toUserKey, "toUserKey");
    if (fromKey === toKey) {
      throw new Error("Supabase user_roles audit reassignment requires distinct fromUserKey and toUserKey values.");
    }
    const createdBy = await this.requestTable("user_roles", {
      body: { createdBy: toKey },
      method: "PATCH",
      prefer: "return=representation",
      query: `createdBy=eq.${encodeURIComponent(fromKey)}`,
    });
    const updatedBy = await this.requestTable("user_roles", {
      body: { updatedBy: toKey },
      method: "PATCH",
      prefer: "return=representation",
      query: `updatedBy=eq.${encodeURIComponent(fromKey)}`,
    });
    return { createdBy, updatedBy };
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

  getPlatformSettings() {
    return this.getProductTableRows("platform_settings");
  }

  upsertPlatformSettings(rows = []) {
    return this.upsertProductTable("platform_settings", rows);
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
    const existingRoles = roles.length ? await this.getRoles() : [];
    const existingRoleKeyBySlug = new Map(existingRoles
      .map((role) => [optionalString(role.roleSlug), optionalString(role.key)])
      .filter(([roleSlug, key]) => roleSlug && key));
    const normalizedRoles = roles.map((role) => {
      const roleSlug = optionalString(role.roleSlug || role.slug);
      return this.normalizeRoleRecord({
        ...role,
        key: existingRoleKeyBySlug.get(roleSlug) || optionalString(role.key),
      }, setupActorKey, timestamp);
    });
    const roleKeyBySlug = new Map([
      ...existingRoleKeyBySlug,
      ...normalizedRoles.map((role) => [role.roleSlug, role.key]),
    ]);
    const normalizedRoleKeyByInputKey = new Map();
    roles.forEach((role, index) => {
      const inputKey = optionalString(role.key);
      const normalizedKey = optionalString(normalizedRoles[index]?.key);
      if (inputKey && normalizedKey) {
        normalizedRoleKeyByInputKey.set(inputKey, normalizedKey);
      }
    });
    const existingUserRoles = userRoles.length ? await this.getUserRoles() : [];
    const existingUserRoleKeyByUserAndRole = new Map(existingUserRoles
      .map((userRole) => [
        `${optionalString(userRole.userKey)}\u0000${optionalString(userRole.roleKey)}`,
        optionalString(userRole.key),
      ])
      .filter(([userRoleKey, key]) => userRoleKey !== "\u0000" && key));
    const normalizedUserRoles = userRoles.map((userRole) => {
      const inputRoleKey = optionalString(userRole.roleKey);
      const roleKey = roleKeyBySlug.get(optionalString(userRole.roleSlug || userRole.slug)) ||
        normalizedRoleKeyByInputKey.get(inputRoleKey) ||
        inputRoleKey;
      return this.normalizeUserRoleRecord({
        ...userRole,
        key: optionalString(userRole.key) || existingUserRoleKeyByUserAndRole.get(`${optionalString(userRole.userKey)}\u0000${optionalString(roleKey)}`),
        roleKey,
      }, roleKeyBySlug, setupActorKey, timestamp);
    });

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
      throw new Error("Admin Operations setup requires server-only direct SQL configuration before setup can run.");
    }
    return {
      executed: false,
      owner: "Admin -> Operations",
      providerId: this.providerId,
      ready: true,
    };
  }

  async getDbViewerSnapshot() {
    this.assertConfigured();
    const results = await Promise.allSettled(SUPABASE_POSTGRES_TABLES.map(async (tableName) => [
      tableName,
      await this.getTableRows(tableName),
    ]));
    const fatalResult = results.find((result) => result.status === "rejected" && !isRecoverableDbViewerTableError(result.reason));
    if (fatalResult) {
      throw fatalResult.reason;
    }
    const tableDiagnostics = [];
    const tables = Object.fromEntries(results.map((result, index) => {
      const tableName = SUPABASE_POSTGRES_TABLES[index];
      if (result.status === "fulfilled") {
        return result.value;
      }
      tableDiagnostics.push(dbViewerTableDiagnostic(tableName, result.reason));
      return [tableName, []];
    }));
    return {
      boundary: PROVIDER_DATA_BOUNDARY_RULE,
      diagnostics: {
        tableReadFailures: tableDiagnostics,
      },
      providerId: this.providerId,
      readiness: this.readiness(),
      tableDiagnostics,
      tables,
    };
  }
}

export const SupabasePostgresProviderStub = SupabasePostgresProviderAdapter;

export function createProviderContractSnapshot(env = process.env) {
  const auth = {
    diagnostic: "",
    id: DEFAULT_AUTH_PROVIDER_ID,
    supported: SUPPORTED_AUTH_PROVIDERS.includes(DEFAULT_AUTH_PROVIDER_ID),
  };
  const database = {
    diagnostic: "",
    id: DEFAULT_DATABASE_PROVIDER_ID,
    supported: SUPPORTED_DATABASE_PROVIDERS.includes(DEFAULT_DATABASE_PROVIDER_ID),
  };
  const ignoredRuntimeSelectors = [];
  const diagnostics = [];
  const supabaseAuthMissing = missingEnvKeys(env, BROWSER_SAFE_SUPABASE_ENV_KEYS);
  const supabasePostgresMissing = missingEnvKeys(env, SUPABASE_POSTGRES_CONFIG_KEYS);
  const supabasePostgresReadiness = createSupabasePostgresReadiness(env);
  const missingConfigWarnings = supabaseMissingConfigWarnings(supabaseAuthMissing, supabasePostgresMissing);
  const supabaseAuthReady = supabaseAuthMissing.length === 0;
  const supabasePostgresReady = supabasePostgresReadiness.configured;
  const supabaseUrlReady = Boolean(envValue(env, "GAMEFOUNDRY_SUPABASE_URL"));
  const supabaseAnonKeyReady = Boolean(envValue(env, "GAMEFOUNDRY_SUPABASE_ANON_KEY"));
  const databaseUrlReady = Boolean(envValue(env, "GAMEFOUNDRY_DATABASE_URL"));
  const providerFailures = [
    providerFailure({
      configDiagnostic: supabaseAuthDiagnostic(env),
      missingConfig: supabaseAuthMissing.length > 0,
      providerId: SUPABASE_AUTH_PROVIDER_ID,
    }),
    providerFailure({
      configDiagnostic: supabasePostgresDiagnostic(env),
      missingConfig: supabasePostgresMissing.length > 0,
      providerId: SUPABASE_POSTGRES_PROVIDER_ID,
    }),
  ].filter(Boolean);
  const runtimeProviderPathReady = providerFailures.length === 0;
  const identityConfigured = supabasePostgresReady;
  const supabasePreflight = createSupabasePreflight({
    auth,
    database,
    runtimeProviderPathReady,
    supabaseAnonKeyReady,
    supabaseAuthActive: true,
    supabaseAuthReady,
    supabasePostgresActive: true,
    supabasePostgresReadiness,
    supabasePostgresReady,
    databaseUrlReady,
    supabaseUrlReady,
  });

  diagnostics.push(supabaseAuthDiagnostic(env));
  diagnostics.push(supabasePostgresDiagnostic(env));

  return {
    activeProviders: {
      authProviderId: SUPABASE_AUTH_PROVIDER_ID,
      databaseProviderId: SUPABASE_POSTGRES_PROVIDER_ID,
      diagnostic: "Runtime account and product data connections are fixed to the configured server services.",
      status: runtimeProviderPathReady ? "ready" : "failed",
    },
    activationReadiness: {
      blockers: [
        ...supabaseAuthMissing.map((key) => `Add browser-safe ${key} for Supabase Auth.`),
        ...supabasePostgresReadiness.blockers,
      ],
      readyBeforeActivation: supabaseAuthReady && supabasePostgresReady,
      runtimeProviderPathReady,
      siteSetupReady: supabasePostgresReadiness.siteSetupReady,
      supabaseAuthReady,
      supabasePostgresReady,
    },
    boundary: PROVIDER_DATA_BOUNDARY_RULE,
    diagnostics,
    failureContract: {
      automaticFallbackAllowed: false,
      providerChainingAllowed: false,
      runtimeProviderPathFixed: true,
    },
    identityOwnership: {
      auditFields: ["createdAt", "updatedAt", "createdBy", "updatedBy"],
      browserAuthoritativeKeysAllowed: false,
      dataMigrationActive: true,
      identityConfigured,
      ownerProviderId: SUPABASE_AUTH_PROVIDER_ID,
      ownershipFields: ["key", "createdAt", "updatedAt", "createdBy", "updatedBy"],
      productDatabaseProviderId: SUPABASE_POSTGRES_PROVIDER_ID,
      readerProviderId: SUPABASE_POSTGRES_PROVIDER_ID,
      runtimeAuthProviderId: SUPABASE_AUTH_PROVIDER_ID,
      runtimeDatabaseProviderId: SUPABASE_POSTGRES_PROVIDER_ID,
      serverApiOwnsKeyGeneration: true,
      staticDevUserUlidException: "User 1, User 2, User 3, and DavidQ only.",
      tables: SUPABASE_POSTGRES_IDENTITY_TABLES.slice(),
      temporaryDevOnlyException: "Static ULIDs are allowed only for the four seeded DEV user records and required user_roles references.",
      userKeyAuthority: "users.key",
    },
    providerDiagnostics: {
      activeProvider: {
        authProviderId: SUPABASE_AUTH_PROVIDER_ID,
        databaseProviderId: SUPABASE_POSTGRES_PROVIDER_ID,
      },
      configuredProviders: configuredProviderIds(supabaseAuthMissing, supabasePostgresMissing),
      ignoredRuntimeSelectors,
      missingConfigWarnings,
      providerFailures,
      requiredEnvironmentVariables: {
        browserSafeSupabase: BROWSER_SAFE_SUPABASE_ENV_KEYS.slice(),
        serverOnlySupabaseCount: PROVIDER_ENVIRONMENT_VARIABLES.serverOnlySupabaseCount,
      },
      secretValuesExposed: false,
      serverOnlyEnvironmentVariableNamesExposed: false,
    },
    runtimeActivation: {
      apiBoundary: PROVIDER_DATA_BOUNDARY_RULE,
      browserReceivesServiceRoleSecrets: false,
      productDataProviderId: SUPABASE_POSTGRES_PROVIDER_ID,
      runtimeProviderPathFixed: true,
      runtimeProviderPathReady,
      runtimeProviderPathFailed: !runtimeProviderPathReady,
      supabaseAuthActive: true,
      supabasePostgresActive: true,
    },
    supabaseAuth: {
      configured: supabaseAuthMissing.length === 0,
      adapter: {
        activeByDefault: true,
        implementation: "config-gated Supabase Auth REST adapter",
        passwordStorage: "external-provider",
        serviceRoleSecretsUsed: false,
      },
      diagnostic: supabaseAuthDiagnostic(env),
      missingBrowserSafeEnvironmentVariables: supabaseAuthMissing,
      operations: AUTH_PROVIDER_CONTRACT_OPERATIONS.slice(),
      providerId: SUPABASE_AUTH_PROVIDER_ID,
      status: supabaseAuthMissing.length
        ? "not-configured"
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
        activeByDefault: true,
        implementation: "config-gated direct Postgres adapter",
        keyGenerationOwner: "server-api",
        staticUlidsAllowedOnlyForDevSeedUsers: true,
      },
      dataMigrationActive: true,
      diagnostic: supabasePostgresDiagnostic(env),
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
        staticDevUserUlidException: "User 1, User 2, User 3, and DavidQ only.",
        productTables: SUPABASE_POSTGRES_PRODUCT_TABLES.slice(),
        tables: SUPABASE_POSTGRES_IDENTITY_TABLES.slice(),
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
      status: supabasePostgresMissing.length
        ? "not-configured"
        : "adapter-ready",
    },
  };
}
