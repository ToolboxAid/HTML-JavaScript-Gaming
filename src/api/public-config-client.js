const API_ROOT = "/api";
const PUBLIC_CONFIG_ROUTE = "/api/public/config";
const PUBLIC_CONFIG_GLOBAL = "GameFoundryPublicConfig";
const PUBLIC_CONFIG_DIAGNOSTICS_GLOBAL = "GameFoundryPublicConfigDiagnostics";

let publicConfigLoaded = false;
let publicConfig = null;
let publicConfigSource = "";
const publicConfigDiagnostics = [];

function recordDiagnostic(message) {
  const normalizedMessage = String(message || "").trim();
  if (normalizedMessage && !publicConfigDiagnostics.includes(normalizedMessage)) {
    publicConfigDiagnostics.push(normalizedMessage);
  }
  publishDiagnostics();
  return normalizedMessage;
}

function browserWindow() {
  return typeof window === "undefined" ? null : window;
}

function browserLocation() {
  return browserWindow()?.location || null;
}

function publishDiagnostics() {
  const target = browserWindow();
  if (!target) {
    return;
  }
  target[PUBLIC_CONFIG_DIAGNOSTICS_GLOBAL] = {
    apiUrlConfigured: Boolean(publicConfig?.apiUrl),
    diagnostics: publicConfigDiagnostics.slice(),
    source: publicConfigSource,
  };
}

function normalizePublicConfig(value) {
  const config = value && typeof value === "object" ? value : {};
  return {
    apiUrl: typeof config.apiUrl === "string" ? config.apiUrl.trim() : "",
    environmentLabel: typeof config.environmentLabel === "string" ? config.environmentLabel.trim() : "",
    siteUrl: typeof config.siteUrl === "string" ? config.siteUrl.trim() : "",
  };
}

function publicConfigFromPayload(payload) {
  if (payload?.ok === false) {
    return null;
  }
  return normalizePublicConfig(payload?.data?.publicConfig || payload?.publicConfig || {});
}

function publicConfigFromGlobal() {
  const source = browserWindow()?.[PUBLIC_CONFIG_GLOBAL];
  if (!source || typeof source !== "object") {
    return null;
  }
  return normalizePublicConfig(source);
}

function sameOriginConfigUrl() {
  const location = browserLocation();
  if (!location?.origin) {
    return PUBLIC_CONFIG_ROUTE;
  }
  return new URL(PUBLIC_CONFIG_ROUTE, location.origin).href;
}

function isLocalHostname(hostname) {
  return ["localhost", "127.0.0.1", "::1"].includes(String(hostname || "").toLowerCase());
}

function companionLocalConfigUrl() {
  const location = browserLocation();
  if (!location?.origin || !isLocalHostname(location.hostname)) {
    return "";
  }
  const port = Number(location.port || 0);
  if (!Number.isInteger(port) || port <= 0) {
    return "";
  }
  const url = new URL(PUBLIC_CONFIG_ROUTE, location.origin);
  url.port = String(port + 1);
  return url.href;
}

function publicConfigCandidateUrls() {
  const sameOriginUrl = sameOriginConfigUrl();
  const companionUrl = companionLocalConfigUrl();
  const location = browserLocation();
  const urls = location?.port === "5500"
    ? [companionUrl, sameOriginUrl]
    : [sameOriginUrl, companionUrl];
  return Array.from(new Set(urls.filter(Boolean)));
}

function loadPublicConfigFromUrlSync(url) {
  if (typeof XMLHttpRequest === "undefined") {
    return null;
  }
  const request = new XMLHttpRequest();
  request.open("GET", url, false);
  request.setRequestHeader("Accept", "application/json");
  request.send(null);
  if (request.status < 200 || request.status >= 300) {
    return null;
  }
  const payload = request.responseText ? JSON.parse(request.responseText) : null;
  return publicConfigFromPayload(payload);
}

async function loadPublicConfigFromUrl(url) {
  if (typeof fetch !== "function") {
    return null;
  }
  const response = await fetch(url, {
    headers: { "Accept": "application/json" },
    method: "GET",
  }).catch(() => null);
  if (!response?.ok) {
    return null;
  }
  const payload = await response.json().catch(() => null);
  return publicConfigFromPayload(payload);
}

function setLoadedConfig(config, source) {
  publicConfigLoaded = true;
  publicConfig = normalizePublicConfig(config);
  publicConfigSource = source;
  publishDiagnostics();
  return publicConfig;
}

function missingApiUrlDiagnostic() {
  return "GAMEFOUNDRY_API_URL is missing from the server public config. Falling back to same-origin /api; static-only Live Server origins cannot serve API routes. Set GAMEFOUNDRY_API_URL in .env and restart the site API.";
}

export function clearPublicConfigCache() {
  publicConfigLoaded = false;
  publicConfig = null;
  publicConfigSource = "";
  publicConfigDiagnostics.splice(0);
  publishDiagnostics();
}

export function getPublicConfigDiagnostics() {
  return publicConfigDiagnostics.slice();
}

export function getBrowserPublicConfigSync() {
  if (publicConfigLoaded) {
    return publicConfig;
  }

  const globalConfig = publicConfigFromGlobal();
  if (globalConfig) {
    return setLoadedConfig(globalConfig, "browser-global");
  }

  for (const url of publicConfigCandidateUrls()) {
    const config = loadPublicConfigFromUrlSync(url);
    if (config) {
      return setLoadedConfig(config, url);
    }
  }

  recordDiagnostic(missingApiUrlDiagnostic());
  return setLoadedConfig({}, "same-origin-fallback");
}

export async function getBrowserPublicConfig() {
  if (publicConfigLoaded) {
    return publicConfig;
  }

  const globalConfig = publicConfigFromGlobal();
  if (globalConfig) {
    return setLoadedConfig(globalConfig, "browser-global");
  }

  for (const url of publicConfigCandidateUrls()) {
    const config = await loadPublicConfigFromUrl(url);
    if (config) {
      return setLoadedConfig(config, url);
    }
  }

  recordDiagnostic(missingApiUrlDiagnostic());
  return setLoadedConfig({}, "same-origin-fallback");
}

function normalizeApiPath(path) {
  if (typeof path !== "string") {
    return "/";
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const trimmedPath = path.trim() || "/";
  const rootedPath = trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
  return rootedPath.startsWith(`${API_ROOT}/`) || rootedPath === API_ROOT
    ? rootedPath.slice(API_ROOT.length) || "/"
    : rootedPath;
}

function sameOriginApiUrl(path) {
  const normalizedPath = normalizeApiPath(path);
  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }
  return `${API_ROOT}${normalizedPath}`;
}

function configuredApiUrl(path, config) {
  const normalizedPath = normalizeApiPath(path);
  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }
  const apiUrl = String(config?.apiUrl || "").trim().replace(/\/+$/, "");
  if (!apiUrl) {
    recordDiagnostic(missingApiUrlDiagnostic());
    return sameOriginApiUrl(normalizedPath);
  }
  return `${apiUrl}${normalizedPath}`;
}

export function resolveServerApiUrl(path) {
  return configuredApiUrl(path, getBrowserPublicConfigSync());
}

export async function resolveServerApiFetchUrl(path) {
  return configuredApiUrl(path, await getBrowserPublicConfig());
}

export async function fetchServerApi(path, options = {}) {
  return fetch(await resolveServerApiFetchUrl(path), options);
}
