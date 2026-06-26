export const STORAGE_CONNECTION_ENV_KEYS = Object.freeze([
  "GAMEFOUNDRY_STORAGE_ENDPOINT",
  "GAMEFOUNDRY_STORAGE_ACCESS_KEY_ID",
  "GAMEFOUNDRY_STORAGE_SECRET_ACCESS_KEY",
  "GAMEFOUNDRY_STORAGE_BUCKET",
]);
export const STORAGE_ENV_KEYS = Object.freeze([
  ...STORAGE_CONNECTION_ENV_KEYS,
  "GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX",
]);
export const STORAGE_PROJECTS_PREFIX_LANES = Object.freeze([
  Object.freeze({ lane: "LOCAL", path: "/local/projects/" }),
  Object.freeze({ lane: "DEV", path: "/dev/projects/" }),
  Object.freeze({ lane: "IST", path: "/ist/projects/" }),
  Object.freeze({ lane: "UAT", path: "/uat/projects/" }),
  Object.freeze({ lane: "PRD", path: "/prod/projects/" }),
]);
export const STORAGE_PROJECTS_ALLOWED_PREFIXES = Object.freeze(
  STORAGE_PROJECTS_PREFIX_LANES.map((lane) => lane.path),
);
export const DB_BACKUP_STORAGE_PROVIDER_ENV = "GAMEFOUNDRY_DB_BACKUP_STORAGE_PROVIDER";
export const DB_BACKUP_PREFIX_ENV = "GAMEFOUNDRY_DB_BACKUP_PREFIX";
export const DB_BACKUP_STORAGE_ENV_KEYS = Object.freeze([
  ...STORAGE_CONNECTION_ENV_KEYS,
  DB_BACKUP_STORAGE_PROVIDER_ENV,
  DB_BACKUP_PREFIX_ENV,
]);
export const DB_BACKUP_ALLOWED_PREFIXES = Object.freeze([
  "/dev/backups/postgres/",
  "/ist/backups/postgres/",
  "/uat/backups/postgres/",
  "/prd/backups/postgres/",
]);

function envValue(env, key) {
  return String(env?.[key] || "").trim();
}

export function normalizeStoragePrefix(value) {
  const normalized = String(value || "").trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!normalized) {
    return "";
  }
  return `/${normalized}/`;
}

export function normalizeStorageProjectsPrefix(value) {
  return normalizeStoragePrefix(value);
}

function storageProjectsPrefixValidationError() {
  return `GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX must be one of ${STORAGE_PROJECTS_ALLOWED_PREFIXES.join(", ")}.`;
}

function safeStorageEndpointValue(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return "";
  }
  try {
    return new URL(rawValue).origin;
  } catch {
    return "invalid endpoint";
  }
}

export function loadStorageConfig(env = process.env) {
  const missingKeys = STORAGE_ENV_KEYS.filter((key) => !envValue(env, key));
  if (missingKeys.length) {
    return {
      configured: false,
      missingKeys,
      safe: {
        bucket: envValue(env, "GAMEFOUNDRY_STORAGE_BUCKET"),
        endpoint: safeStorageEndpointValue(envValue(env, "GAMEFOUNDRY_STORAGE_ENDPOINT")),
        projectsPrefix: normalizeStorageProjectsPrefix(envValue(env, "GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX")),
      },
    };
  }

  let endpoint = null;
  try {
    endpoint = new URL(envValue(env, "GAMEFOUNDRY_STORAGE_ENDPOINT"));
  } catch {
    return {
      configured: false,
      missingKeys: [],
      safe: {
        bucket: envValue(env, "GAMEFOUNDRY_STORAGE_BUCKET"),
        endpoint: "invalid endpoint",
        projectsPrefix: normalizeStorageProjectsPrefix(envValue(env, "GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX")),
      },
      validationError: "GAMEFOUNDRY_STORAGE_ENDPOINT must be a valid URL.",
    };
  }

  const projectsPrefix = normalizeStorageProjectsPrefix(envValue(env, "GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX"));
  if (!projectsPrefix) {
    return {
      configured: false,
      missingKeys: ["GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX"],
      safe: {
        bucket: envValue(env, "GAMEFOUNDRY_STORAGE_BUCKET"),
        endpoint: endpoint.origin,
        projectsPrefix: "",
      },
    };
  }
  if (!STORAGE_PROJECTS_ALLOWED_PREFIXES.includes(projectsPrefix)) {
    return {
      configured: false,
      missingKeys: [],
      safe: {
        bucket: envValue(env, "GAMEFOUNDRY_STORAGE_BUCKET"),
        endpoint: endpoint.origin,
        projectsPrefix,
      },
      validationError: storageProjectsPrefixValidationError(),
    };
  }

  return {
    accessKeyId: envValue(env, "GAMEFOUNDRY_STORAGE_ACCESS_KEY_ID"),
    bucket: envValue(env, "GAMEFOUNDRY_STORAGE_BUCKET"),
    configured: true,
    endpoint: endpoint.origin,
    projectsPrefix,
    safe: {
      bucket: envValue(env, "GAMEFOUNDRY_STORAGE_BUCKET"),
      endpoint: endpoint.origin,
      projectsPrefix,
    },
    secretAccessKey: envValue(env, "GAMEFOUNDRY_STORAGE_SECRET_ACCESS_KEY"),
  };
}

export function loadBackupStorageConfig(env = process.env) {
  const missingKeys = DB_BACKUP_STORAGE_ENV_KEYS.filter((key) => !envValue(env, key));
  if (missingKeys.length) {
    return {
      configured: false,
      missingKeys,
      safe: {
        backupPrefix: normalizeStoragePrefix(envValue(env, DB_BACKUP_PREFIX_ENV)),
        bucket: envValue(env, "GAMEFOUNDRY_STORAGE_BUCKET"),
        endpoint: "",
        provider: envValue(env, DB_BACKUP_STORAGE_PROVIDER_ENV).toLowerCase(),
      },
    };
  }

  const provider = envValue(env, DB_BACKUP_STORAGE_PROVIDER_ENV).toLowerCase();
  if (provider !== "r2") {
    return {
      configured: false,
      missingKeys: [],
      safe: {
        backupPrefix: normalizeStoragePrefix(envValue(env, DB_BACKUP_PREFIX_ENV)),
        bucket: envValue(env, "GAMEFOUNDRY_STORAGE_BUCKET"),
        endpoint: "",
        provider,
      },
      validationError: `${DB_BACKUP_STORAGE_PROVIDER_ENV} must be r2 for Postgres backups.`,
    };
  }

  let endpoint = null;
  try {
    endpoint = new URL(envValue(env, "GAMEFOUNDRY_STORAGE_ENDPOINT"));
  } catch {
    return {
      configured: false,
      missingKeys: [],
      safe: {
        backupPrefix: normalizeStoragePrefix(envValue(env, DB_BACKUP_PREFIX_ENV)),
        bucket: envValue(env, "GAMEFOUNDRY_STORAGE_BUCKET"),
        endpoint: "invalid endpoint",
        provider,
      },
      validationError: "GAMEFOUNDRY_STORAGE_ENDPOINT must be a valid URL.",
    };
  }

  const backupPrefix = normalizeStoragePrefix(envValue(env, DB_BACKUP_PREFIX_ENV));
  if (!DB_BACKUP_ALLOWED_PREFIXES.includes(backupPrefix)) {
    return {
      configured: false,
      missingKeys: [],
      safe: {
        backupPrefix,
        bucket: envValue(env, "GAMEFOUNDRY_STORAGE_BUCKET"),
        endpoint: endpoint.origin,
        provider,
      },
      validationError: `${DB_BACKUP_PREFIX_ENV} must be one of ${DB_BACKUP_ALLOWED_PREFIXES.join(", ")}.`,
    };
  }

  return {
    accessKeyId: envValue(env, "GAMEFOUNDRY_STORAGE_ACCESS_KEY_ID"),
    backupPrefix,
    bucket: envValue(env, "GAMEFOUNDRY_STORAGE_BUCKET"),
    configured: true,
    endpoint: endpoint.origin,
    provider,
    safe: {
      backupPrefix,
      bucket: envValue(env, "GAMEFOUNDRY_STORAGE_BUCKET"),
      endpoint: endpoint.origin,
      provider,
    },
    secretAccessKey: envValue(env, "GAMEFOUNDRY_STORAGE_SECRET_ACCESS_KEY"),
  };
}

