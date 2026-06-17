export const STORAGE_ENV_KEYS = Object.freeze([
  "GAMEFOUNDRY_STORAGE_ENDPOINT",
  "GAMEFOUNDRY_STORAGE_ACCESS_KEY_ID",
  "GAMEFOUNDRY_STORAGE_SECRET_ACCESS_KEY",
  "GAMEFOUNDRY_STORAGE_BUCKET",
  "GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX",
]);

function envValue(env, key) {
  return String(env?.[key] || "").trim();
}

export function normalizeStorageProjectsPrefix(value) {
  const normalized = String(value || "").trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!normalized) {
    return "";
  }
  return `/${normalized}/`;
}

export function loadStorageConfig(env = process.env) {
  const missingKeys = STORAGE_ENV_KEYS.filter((key) => !envValue(env, key));
  if (missingKeys.length) {
    return {
      configured: false,
      missingKeys,
      safe: {
        bucket: "",
        endpoint: "",
        projectsPrefix: "",
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

