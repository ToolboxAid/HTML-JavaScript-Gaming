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

export const PROVIDER_ENVIRONMENT_VARIABLES = Object.freeze({
  browserSafeSupabase: BROWSER_SAFE_SUPABASE_ENV_KEYS,
  selectors: Object.freeze(["GAMEFOUNDRY_AUTH_PROVIDER", "GAMEFOUNDRY_DB_PROVIDER"]),
  serverOnlySupabaseCount: SERVER_ONLY_SUPABASE_SECRET_KEYS.length,
});

const SUPPORTED_AUTH_PROVIDERS = Object.freeze([LOCAL_AUTH_PROVIDER_ID, SUPABASE_AUTH_PROVIDER_ID]);
const SUPPORTED_DATABASE_PROVIDERS = Object.freeze([LOCAL_DATABASE_PROVIDER_ID, SUPABASE_POSTGRES_PROVIDER_ID]);

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
    id: supported ? requested : fallback,
    requested,
    supported,
  };
}

export function supabaseAuthDiagnostic(env = process.env) {
  const missing = missingEnvKeys(env, BROWSER_SAFE_SUPABASE_ENV_KEYS);
  return missing.length
    ? `Supabase Auth provider selected but not configured. Missing browser-safe environment variables: ${missing.join(", ")}.`
    : "Supabase Auth provider stub is configured but not active until a dedicated adapter PR.";
}

export function supabasePostgresDiagnostic(env = process.env) {
  const missing = missingEnvKeys(env, SERVER_ONLY_SUPABASE_SECRET_KEYS);
  return missing.length
    ? `Supabase Postgres provider selected but not configured. Missing server-only environment variables are required but not exposed through browser APIs.`
    : "Supabase Postgres provider stub is configured but not active until a dedicated adapter PR.";
}

function futureProviderMissingConfigWarnings(supabaseAuthMissing, supabasePostgresMissing) {
  const warnings = [];
  if (supabaseAuthMissing.length) {
    warnings.push(`Supabase Auth future provider is not configured. Missing browser-safe environment variables: ${supabaseAuthMissing.join(", ")}.`);
  }
  if (supabasePostgresMissing.length) {
    warnings.push("Supabase Postgres future provider is not configured. Missing server-only environment variables are required but not exposed through browser APIs.");
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

export class SupabaseAuthProviderStub {
  constructor({ env = process.env } = {}) {
    this.env = env;
    this.providerId = SUPABASE_AUTH_PROVIDER_ID;
  }

  diagnostic() {
    return supabaseAuthDiagnostic(this.env);
  }

  getCurrentUser() {
    throw new Error(this.diagnostic());
  }

  signIn() {
    throw new Error(this.diagnostic());
  }

  signOut() {
    throw new Error(this.diagnostic());
  }

  createAccount() {
    throw new Error(this.diagnostic());
  }

  requestPasswordReset() {
    throw new Error(this.diagnostic());
  }

  requireRole() {
    throw new Error(this.diagnostic());
  }
}

export class SupabasePostgresProviderStub {
  constructor({ env = process.env } = {}) {
    this.env = env;
    this.providerId = SUPABASE_POSTGRES_PROVIDER_ID;
  }

  diagnostic() {
    return supabasePostgresDiagnostic(this.env);
  }

  connect() {
    throw new Error(this.diagnostic());
  }

  getUsers() {
    throw new Error(this.diagnostic());
  }

  getRoles() {
    throw new Error(this.diagnostic());
  }

  getUserRoles() {
    throw new Error(this.diagnostic());
  }

  runSiteSetup() {
    throw new Error(this.diagnostic());
  }

  getDbViewerSnapshot() {
    throw new Error(this.diagnostic());
  }
}

export function createProviderContractSnapshot(env = process.env) {
  const auth = requestedProvider(env, "GAMEFOUNDRY_AUTH_PROVIDER", LOCAL_AUTH_PROVIDER_ID, SUPPORTED_AUTH_PROVIDERS);
  const database = requestedProvider(env, "GAMEFOUNDRY_DB_PROVIDER", LOCAL_DATABASE_PROVIDER_ID, SUPPORTED_DATABASE_PROVIDERS);
  const diagnostics = [auth.diagnostic, database.diagnostic].filter(Boolean);
  const supabaseAuthMissing = missingEnvKeys(env, BROWSER_SAFE_SUPABASE_ENV_KEYS);
  const supabasePostgresMissing = missingEnvKeys(env, SERVER_ONLY_SUPABASE_SECRET_KEYS);
  const supabaseAuthSelected = auth.id === SUPABASE_AUTH_PROVIDER_ID;
  const supabasePostgresSelected = database.id === SUPABASE_POSTGRES_PROVIDER_ID;
  const missingConfigWarnings = futureProviderMissingConfigWarnings(supabaseAuthMissing, supabasePostgresMissing);

  if (supabaseAuthSelected) {
    diagnostics.push(supabaseAuthDiagnostic(env));
  }
  if (supabasePostgresSelected) {
    diagnostics.push(supabasePostgresDiagnostic(env));
  }

  return {
    activeProviders: {
      authProviderId: LOCAL_AUTH_PROVIDER_ID,
      databaseProviderId: LOCAL_DATABASE_PROVIDER_ID,
      diagnostic: "Local DB provider remains active until a dedicated Supabase adapter PR.",
    },
    boundary: PROVIDER_DATA_BOUNDARY_RULE,
    diagnostics,
    providerDiagnostics: {
      activeProvider: {
        authProviderId: LOCAL_AUTH_PROVIDER_ID,
        databaseProviderId: LOCAL_DATABASE_PROVIDER_ID,
      },
      configuredProviders: configuredProviderIds(supabaseAuthMissing, supabasePostgresMissing),
      missingConfigWarnings,
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
    supabaseAuth: {
      configured: supabaseAuthMissing.length === 0,
      diagnostic: supabaseAuthSelected ? supabaseAuthDiagnostic(env) : "Supabase Auth provider stub is inactive.",
      missingBrowserSafeEnvironmentVariables: supabaseAuthSelected ? supabaseAuthMissing : [],
      operations: AUTH_PROVIDER_CONTRACT_OPERATIONS.slice(),
      providerId: SUPABASE_AUTH_PROVIDER_ID,
      status: supabaseAuthSelected && supabaseAuthMissing.length ? "not-configured" : "stub",
      userMapping: {
        appUserKeyField: "users.key",
        browserAuthoritativeUserKeysAllowed: false,
        externalAuthUserIdField: "supabase.auth.user.id",
        owner: "server-api",
      },
    },
    supabasePostgres: {
      configured: supabasePostgresMissing.length === 0,
      dataMigrationActive: false,
      diagnostic: supabasePostgresSelected ? supabasePostgresDiagnostic(env) : "Supabase Postgres provider stub is inactive.",
      executionOwnership: {
        dev: "Codex may execute DEV setup/migration only after a dedicated Supabase DEV PR.",
        prod: "User-controlled reviewed SQL/setup execution.",
        uat: "User-controlled reviewed SQL/setup execution.",
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
      status: supabasePostgresSelected && supabasePostgresMissing.length ? "not-configured" : "stub",
    },
  };
}
