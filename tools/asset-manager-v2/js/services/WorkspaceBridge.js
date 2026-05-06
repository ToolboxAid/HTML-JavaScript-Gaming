function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export class WorkspaceBridge {
  constructor({ windowRef = window }) {
    this.window = windowRef;
  }

  isWorkspaceMode() {
    const params = new URLSearchParams(this.window.location.search);
    return params.get("launch") === "workspace" || params.get("fromTool") === "workspace-v2";
  }

  hostContextId() {
    return new URLSearchParams(this.window.location.search).get("hostContextId") || "";
  }

  readContext() {
    const hostContextId = this.hostContextId();
    if (!hostContextId) {
      return { ok: false, message: "Workspace mode requires a hostContextId." };
    }
    const rawValue = this.window.sessionStorage.getItem(hostContextId);
    if (!rawValue) {
      return { ok: false, message: "Workspace V2 host context was not found in sessionStorage." };
    }
    try {
      const context = JSON.parse(rawValue);
      if (!isPlainObject(context)) {
        return { ok: false, message: "Workspace V2 host context is invalid." };
      }
      return { ok: true, hostContextId, context };
    } catch (error) {
      return { ok: false, message: `Workspace V2 host context JSON is invalid: ${error.message}` };
    }
  }

  workspaceManifestFromContext(context) {
    if (isPlainObject(context.workspaceManifest)) {
      return context.workspaceManifest;
    }
    if (context.documentKind === "workspace-manifest") {
      return context;
    }
    return null;
  }

  readWorkspaceAssetPayload() {
    const contextResult = this.readContext();
    if (!contextResult.ok) {
      return contextResult;
    }
    const workspaceManifest = this.workspaceManifestFromContext(contextResult.context);
    if (!isPlainObject(workspaceManifest)) {
      return { ok: false, message: "Workspace V2 context is missing workspaceManifest." };
    }
    const assetPayload = workspaceManifest.tools?.["asset-browser"];
    if (!isPlainObject(assetPayload) || !isPlainObject(assetPayload.assets)) {
      return { ok: false, message: "Workspace V2 manifest is missing tools.asset-browser.assets." };
    }
    return { ok: true, payload: { assets: clone(assetPayload.assets) } };
  }

  writeAssetsPayload(payload) {
    if (!this.isWorkspaceMode()) {
      return { ok: false, message: "Asset insertion is only available when launched from Workspace V2." };
    }
    const contextResult = this.readContext();
    if (!contextResult.ok) {
      return contextResult;
    }
    const nextContext = clone(contextResult.context);
    const workspaceManifest = this.workspaceManifestFromContext(nextContext);
    if (!isPlainObject(workspaceManifest)) {
      return { ok: false, message: "Workspace V2 context is missing workspaceManifest." };
    }
    if (!isPlainObject(workspaceManifest.tools)) {
      return { ok: false, message: "Workspace V2 manifest is missing tools." };
    }
    if (!isPlainObject(workspaceManifest.tools["asset-browser"]) || !isPlainObject(workspaceManifest.tools["asset-browser"].assets)) {
      return { ok: false, message: "Workspace V2 manifest is missing tools.asset-browser.assets." };
    }

    workspaceManifest.tools["asset-browser"].assets = clone(payload.assets);
    nextContext.workspaceManifest = workspaceManifest;
    this.window.sessionStorage.setItem(contextResult.hostContextId, JSON.stringify(nextContext));
    return { ok: true, workspaceManifest: clone(workspaceManifest) };
  }
}
