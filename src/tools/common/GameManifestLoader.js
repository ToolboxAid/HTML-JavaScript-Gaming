export function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseJson(rawValue, sourceLabel) {
  try {
    const parsed = JSON.parse(rawValue);
    return isRecord(parsed)
      ? { ok: true, manifest: parsed, sourceLabel }
      : { ok: false, message: `${sourceLabel} must contain a JSON object.` };
  } catch (error) {
    return { ok: false, message: `${sourceLabel} contains invalid JSON: ${error.message}` };
  }
}

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isNaN(parsed) || Math.abs(parsed) === Infinity ? fallback : parsed;
}

function positiveInteger(value) {
  const parsed = Math.floor(numberValue(value));
  return parsed > 0 ? parsed : 0;
}

export function resolveManifestScreenDimensions(manifest) {
  const screen = isRecord(manifest?.screen) ? manifest.screen : null;
  const width = positiveInteger(screen?.width);
  const height = positiveInteger(screen?.height);
  if (!width || !height) {
    return {
      ok: false,
      message: "Manifest screen dimensions are required at root.screen.width and root.screen.height."
    };
  }
  return { ok: true, width, height };
}

export class GameManifestLoader {
  constructor({
    fetchRef = null,
    pathParams = ["manifestPath", "gameManifestPath"],
    sessionStorageRef = null,
    windowRef = window
  } = {}) {
    this.fetch = fetchRef || windowRef.fetch?.bind(windowRef) || null;
    this.pathParams = pathParams;
    this.sessionStorage = sessionStorageRef || windowRef.sessionStorage || null;
    this.window = windowRef;
  }

  isWorkspaceLaunch(params = new URLSearchParams(this.window.location.search || "")) {
    return params.get("launch") === "workspace"
      && params.get("fromTool") === "workspace-manager-v2"
      && Boolean(params.get("hostContextId"));
  }

  async loadInitialManifest() {
    const params = new URLSearchParams(this.window.location.search || "");
    if (this.isWorkspaceLaunch(params)) {
      return this.loadFromWorkspaceContext(params.get("hostContextId") || "");
    }
    const manifestPath = this.pathParams.map((key) => params.get(key) || "").find(Boolean) || "";
    if (manifestPath) {
      return this.loadFromPath(manifestPath, "URL manifest path");
    }
    return { ok: false, skipped: true };
  }

  loadFromWorkspaceContext(hostContextId) {
    if (!hostContextId) {
      return { ok: false, message: "Workspace launch did not include hostContextId." };
    }
    const rawValue = this.sessionStorage?.getItem(hostContextId) || "";
    if (!rawValue) {
      return { ok: false, message: `Workspace manifest context was not found in sessionStorage: ${hostContextId}.` };
    }
    return parseJson(rawValue, `workspace:${hostContextId}`);
  }

  async loadFromPath(manifestPath, sourceLabel = manifestPath) {
    if (typeof this.fetch !== "function") {
      return { ok: false, message: "Fetch API is unavailable for manifest loading." };
    }
    try {
      const response = await this.fetch(manifestPath, { cache: "no-store" });
      if (!response.ok) {
        return { ok: false, message: `Manifest load failed from ${manifestPath}: ${response.status} ${response.statusText}` };
      }
      const manifest = await response.json();
      return isRecord(manifest)
        ? { ok: true, manifest, sourceLabel: sourceLabel || manifestPath }
        : { ok: false, message: `${sourceLabel || manifestPath} must contain a JSON object.` };
    } catch (error) {
      return { ok: false, message: `Manifest load failed from ${manifestPath}: ${error.message}` };
    }
  }

  async loadFromFile(file) {
    if (!file) {
      return { ok: false, skipped: true };
    }
    try {
      return parseJson(await file.text(), file.name || "selected manifest file");
    } catch (error) {
      return { ok: false, message: `Manifest file could not be read: ${error.message}` };
    }
  }
}
