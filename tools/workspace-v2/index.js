class WorkspaceV2SessionProducer {
  constructor() {
    document.title = "Workspace V2";
    document.body.dataset.toolId = "workspace-v2";
    this.toolSelect = document.getElementById("workspaceV2ToolSelect");
    this.backButton = document.getElementById("workspaceV2BackButton");
    this.loadFixtureButton = document.getElementById("workspaceV2LoadFixtureButton");
    this.launchButton = document.getElementById("workspaceV2LaunchButton");
    this.importJsonNode = document.getElementById("workspaceV2ImportJson");
    this.importFileNode = document.getElementById("workspaceV2ImportFile");
    this.importButton = document.getElementById("workspaceV2ImportButton");
    this.exportButton = document.getElementById("workspaceV2ExportButton");
    this.statusNode = document.getElementById("workspaceV2Status");
    this.currentSessionPayload = null;
    this.currentSessionSource = "";
    this.currentHostContextId = "";
    this.loadFixtureButton.addEventListener("click", () => {
      this.loadSelectedFixture();
    });
    this.launchButton.addEventListener("click", () => {
      this.createSessionAndLaunch();
    });
    this.importButton.addEventListener("click", () => {
      this.importSessionJson();
    });
    this.exportButton.addEventListener("click", () => {
      this.exportCurrentSessionJson();
    });
    this.importFileNode.addEventListener("change", () => {
      this.readImportFile();
    });
    this.backButton.addEventListener("click", () => {
      window.location.href = "../index.html";
    });
  }

  selectedToolId() {
    return typeof this.toolSelect.value === "string" ? this.toolSelect.value.trim() : "";
  }

  fixturePathForTool(toolId) {
    return `../../tests/fixtures/v2-tools/${toolId}.json`;
  }

  setCurrentSessionPayload(sessionPayload, sourceLabel) {
    this.currentSessionPayload = sessionPayload;
    this.currentSessionSource = sourceLabel;
  }

  async loadSelectedFixture() {
    const toolId = this.selectedToolId();
    if (!toolId) {
      this.statusNode.textContent = "Select a V2 tool before loading a fixture.";
      return;
    }
    try {
      const response = await fetch(this.fixturePathForTool(toolId), { cache: "no-store" });
      if (!response.ok) {
        this.statusNode.textContent = `Fixture read failed (${response.status}). Expected ${this.fixturePathForTool(toolId)}.`;
        this.setCurrentSessionPayload(null, "");
        return;
      }
      const fixture = await response.json();
      if (!fixture || typeof fixture !== "object" || Array.isArray(fixture)) {
        this.statusNode.textContent = "Fixture is invalid. Expected a JSON object with hostContextId and sessionContext.";
        this.setCurrentSessionPayload(null, "");
        return;
      }
      if (!fixture.sessionContext || typeof fixture.sessionContext !== "object" || Array.isArray(fixture.sessionContext)) {
        this.statusNode.textContent = "Fixture is invalid. Missing sessionContext object.";
        this.setCurrentSessionPayload(null, "");
        return;
      }
      this.setCurrentSessionPayload(fixture.sessionContext, `fixture:${toolId}`);
      this.currentHostContextId = "";
      this.importJsonNode.value = JSON.stringify(fixture.sessionContext, null, 2);
      this.statusNode.textContent = `Fixture loaded for ${toolId}.\nSession payload is ready for launch or export.`;
    } catch (error) {
      this.setCurrentSessionPayload(null, "");
      this.currentHostContextId = "";
      this.statusNode.textContent = `Fixture read failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  }

  readImportFile() {
    if (!this.importFileNode.files || this.importFileNode.files.length === 0) {
      return;
    }
    const file = this.importFileNode.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      this.importJsonNode.value = typeof reader.result === "string" ? reader.result : "";
      this.statusNode.textContent = `Import file loaded: ${file.name}. Click Import Session JSON to validate and create session.`;
    });
    reader.addEventListener("error", () => {
      this.statusNode.textContent = `Import file read failed: ${file.name}.`;
    });
    reader.readAsText(file);
  }

  createHostContextId(toolId) {
    const randomPart = Math.random().toString(36).slice(2, 10);
    return `${toolId}-${Date.now()}-${randomPart}`;
  }

  buildToolLaunchUrl(toolId, hostContextId) {
    const toolUrl = new URL(`../${toolId}/index.html`, window.location.href);
    toolUrl.searchParams.set("hostContextId", hostContextId);
    toolUrl.searchParams.set("fromTool", "workspace-v2");
    return toolUrl.toString();
  }

  importSessionJson() {
    const toolId = this.selectedToolId();
    const rawJson = typeof this.importJsonNode.value === "string" ? this.importJsonNode.value.trim() : "";
    if (!toolId) {
      this.statusNode.textContent = "Select a V2 tool before importing session JSON.";
      return;
    }
    if (!rawJson) {
      this.statusNode.textContent = "Session JSON is required for import.";
      return;
    }
    try {
      const parsed = JSON.parse(rawJson);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        this.statusNode.textContent = "Imported JSON is invalid. Expected an object session payload.";
        return;
      }
      const hostContextId = this.createHostContextId(toolId);
      sessionStorage.setItem(hostContextId, JSON.stringify(parsed));
      this.currentHostContextId = hostContextId;
      this.setCurrentSessionPayload(parsed, "import");
      this.importJsonNode.value = JSON.stringify(parsed, null, 2);
      this.statusNode.textContent = `Session imported.\nTool: ${toolId}\nHostContextId: ${hostContextId}\nReady to launch.`;
    } catch (error) {
      this.statusNode.textContent = `Imported JSON is invalid: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  }

  exportCurrentSessionJson() {
    if (!this.currentSessionPayload || typeof this.currentSessionPayload !== "object" || Array.isArray(this.currentSessionPayload)) {
      this.statusNode.textContent = "No current session payload to export. Load fixture or import JSON first.";
      return;
    }
    const serialized = JSON.stringify(this.currentSessionPayload, null, 2);
    this.importJsonNode.value = serialized;
    this.statusNode.textContent = `Session JSON exported from ${this.currentSessionSource || "session"} payload.`;
  }

  createSessionAndLaunch() {
    const toolId = this.selectedToolId();
    if (!toolId) {
      this.statusNode.textContent = "Select a V2 tool before launch.";
      return;
    }
    if (!this.currentSessionPayload || typeof this.currentSessionPayload !== "object" || Array.isArray(this.currentSessionPayload)) {
      this.statusNode.textContent = "No session payload is available. Load a fixture or import session JSON first.";
      return;
    }
    const hostContextId = this.createHostContextId(toolId);
    sessionStorage.setItem(hostContextId, JSON.stringify(this.currentSessionPayload));
    this.currentHostContextId = hostContextId;
    const launchUrl = this.buildToolLaunchUrl(toolId, hostContextId);
    this.statusNode.textContent = `Session created.\nTool: ${toolId}\nHostContextId: ${hostContextId}\nURL: tools/${toolId}/index.html?hostContextId=${hostContextId}`;
    window.location.href = launchUrl;
  }
}

new WorkspaceV2SessionProducer();
