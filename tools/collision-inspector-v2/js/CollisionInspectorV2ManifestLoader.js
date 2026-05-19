import { ASTEROIDS_MANIFEST_PATH } from "./constants.js";

export class CollisionInspectorV2ManifestLoader {
  constructor({ windowRef = window } = {}) {
    this.window = windowRef;
  }

  async loadInitialManifest() {
    const params = new URLSearchParams(this.window.location.search || "");
    const manifestPath = params.get("manifestPath") || params.get("gameManifestPath") || "";
    if (manifestPath) {
      return this.loadFromPath(manifestPath, "URL manifest path");
    }
    if (params.get("gameId") === "Asteroids") {
      return this.loadFromPath(ASTEROIDS_MANIFEST_PATH, "Asteroids validation path");
    }
    if (params.get("launch") !== "workspace") {
      return { ok: false, skipped: true };
    }
    const hostContextId = params.get("hostContextId") || "";
    const raw = hostContextId ? this.window.sessionStorage.getItem(hostContextId) : "";
    if (!raw) {
      return { ok: false, message: "Workspace launch did not provide a stored manifest context." };
    }
    try {
      return {
        manifest: JSON.parse(raw),
        ok: true,
        sourceLabel: `workspace:${hostContextId}`
      };
    } catch (error) {
      return { ok: false, message: `Workspace manifest JSON could not be parsed: ${error.message}` };
    }
  }

  async loadFromPath(path, sourceLabel = path) {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return {
        manifest: await response.json(),
        ok: true,
        sourceLabel: sourceLabel || path
      };
    } catch (error) {
      return { ok: false, message: `Manifest load failed from ${path}: ${error.message}` };
    }
  }

  async loadFromFile(file) {
    if (!file) {
      return { ok: false, skipped: true };
    }
    try {
      return {
        manifest: JSON.parse(await file.text()),
        ok: true,
        sourceLabel: file.name
      };
    } catch (error) {
      return { ok: false, message: `Manifest load failed: ${error.message}` };
    }
  }
}
