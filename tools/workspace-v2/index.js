class WorkspaceV2SessionProducer {
  constructor() {
    document.title = "Workspace V2";
    document.body.dataset.toolId = "workspace-v2";
    this.libraryStorageKey = "v2-session-library";
    this.toolSelect = document.getElementById("workspaceV2ToolSelect");
    this.backButton = document.getElementById("workspaceV2BackButton");
    this.loadFixtureButton = document.getElementById("workspaceV2LoadFixtureButton");
    this.launchButton = document.getElementById("workspaceV2LaunchButton");
    this.importJsonNode = document.getElementById("workspaceV2ImportJson");
    this.importFileNode = document.getElementById("workspaceV2ImportFile");
    this.importButton = document.getElementById("workspaceV2ImportButton");
    this.exportButton = document.getElementById("workspaceV2ExportButton");
    this.sessionNameNode = document.getElementById("workspaceV2SessionName");
    this.saveSessionButton = document.getElementById("workspaceV2SaveSessionButton");
    this.overwriteSessionButton = document.getElementById("workspaceV2OverwriteSessionButton");
    this.loadSessionButton = document.getElementById("workspaceV2LoadSessionButton");
    this.deleteSessionButton = document.getElementById("workspaceV2DeleteSessionButton");
    this.libraryEmptyState = document.getElementById("workspaceV2LibraryEmptyState");
    this.sessionListNode = document.getElementById("workspaceV2SessionList");
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
    this.saveSessionButton.addEventListener("click", () => {
      this.saveNamedSession(false);
    });
    this.overwriteSessionButton.addEventListener("click", () => {
      this.saveNamedSession(true);
    });
    this.loadSessionButton.addEventListener("click", () => {
      this.loadNamedSession();
    });
    this.deleteSessionButton.addEventListener("click", () => {
      this.deleteNamedSession();
    });
    this.backButton.addEventListener("click", () => {
      window.location.href = "../index.html";
    });
    this.renderSessionLibrary();
  }

  selectedToolId() {
    return typeof this.toolSelect.value === "string" ? this.toolSelect.value.trim() : "";
  }

  selectedSessionName() {
    return typeof this.sessionNameNode.value === "string" ? this.sessionNameNode.value.trim() : "";
  }

  fixturePathForTool(toolId) {
    return `../../tests/fixtures/v2-tools/${toolId}.json`;
  }

  setCurrentSessionPayload(sessionPayload, sourceLabel) {
    this.currentSessionPayload = sessionPayload;
    this.currentSessionSource = sourceLabel;
  }

  isValidSessionPayload(sessionPayload) {
    return Boolean(sessionPayload && typeof sessionPayload === "object" && !Array.isArray(sessionPayload));
  }

  readSessionLibrary() {
    const rawLibrary = localStorage.getItem(this.libraryStorageKey);
    if (!rawLibrary) {
      return {};
    }
    try {
      const parsed = JSON.parse(rawLibrary);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        this.statusNode.textContent = "Session library is invalid. Expected object map under localStorage key v2-session-library.";
        return null;
      }
      for (const sessionName of Object.keys(parsed)) {
        if (!this.isValidSessionPayload(parsed[sessionName])) {
          this.statusNode.textContent = `Session library entry '${sessionName}' is invalid.`;
          return null;
        }
      }
      return parsed;
    } catch (error) {
      this.statusNode.textContent = `Session library parse failed: ${error instanceof Error ? error.message : "unknown error"}`;
      return null;
    }
  }

  writeSessionLibrary(library) {
    localStorage.setItem(this.libraryStorageKey, JSON.stringify(library));
  }

  renderSessionLibrary() {
    const library = this.readSessionLibrary();
    if (library === null) {
      this.sessionListNode.replaceChildren();
      this.libraryEmptyState.hidden = false;
      this.libraryEmptyState.textContent = "Session library is invalid. Fix stored JSON or clear v2-session-library.";
      return;
    }
    const sessionNames = Object.keys(library).sort((left, right) => left.localeCompare(right));
    this.sessionListNode.replaceChildren();
    this.libraryEmptyState.hidden = sessionNames.length > 0;
    this.libraryEmptyState.textContent = "No saved sessions in library.";
    sessionNames.forEach((sessionName) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = sessionName;
      button.addEventListener("click", () => {
        this.sessionNameNode.value = sessionName;
      });
      item.appendChild(button);
      this.sessionListNode.appendChild(item);
    });
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
      if (!this.isValidSessionPayload(fixture.sessionContext)) {
        this.statusNode.textContent = "Fixture is invalid. Missing sessionContext object.";
        this.setCurrentSessionPayload(null, "");
        return;
      }
      this.setCurrentSessionPayload(fixture.sessionContext, `fixture:${toolId}`);
      this.currentHostContextId = "";
      this.importJsonNode.value = JSON.stringify(fixture.sessionContext, null, 2);
      this.statusNode.textContent = `Fixture loaded for ${toolId}.\nSession payload is ready for launch, export, or library save.`;
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
      if (!this.isValidSessionPayload(parsed)) {
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
    if (!this.isValidSessionPayload(this.currentSessionPayload)) {
      this.statusNode.textContent = "No current session payload to export. Load fixture or import JSON first.";
      return;
    }
    const serialized = JSON.stringify(this.currentSessionPayload, null, 2);
    this.importJsonNode.value = serialized;
    this.statusNode.textContent = `Session JSON exported from ${this.currentSessionSource || "session"} payload.`;
  }

  saveNamedSession(overwriteExisting) {
    const sessionName = this.selectedSessionName();
    if (!sessionName) {
      this.statusNode.textContent = "Session name is required to save.";
      return;
    }
    if (!this.isValidSessionPayload(this.currentSessionPayload)) {
      this.statusNode.textContent = "No valid current session payload to save.";
      return;
    }
    const library = this.readSessionLibrary();
    if (library === null) {
      return;
    }
    const exists = Object.prototype.hasOwnProperty.call(library, sessionName);
    if (exists && !overwriteExisting) {
      this.statusNode.textContent = `Session '${sessionName}' already exists. Use Overwrite Session to replace it.`;
      return;
    }
    library[sessionName] = this.currentSessionPayload;
    this.writeSessionLibrary(library);
    this.renderSessionLibrary();
    this.statusNode.textContent = exists
      ? `Session '${sessionName}' was overwritten in library.`
      : `Session '${sessionName}' was saved to library.`;
  }

  loadNamedSession() {
    const sessionName = this.selectedSessionName();
    const toolId = this.selectedToolId();
    if (!sessionName) {
      this.statusNode.textContent = "Session name is required to load.";
      return;
    }
    if (!toolId) {
      this.statusNode.textContent = "Select a V2 tool before loading a named session.";
      return;
    }
    const library = this.readSessionLibrary();
    if (library === null) {
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(library, sessionName)) {
      this.statusNode.textContent = `Session '${sessionName}' was not found in library.`;
      return;
    }
    const payload = library[sessionName];
    if (!this.isValidSessionPayload(payload)) {
      this.statusNode.textContent = `Session '${sessionName}' payload is invalid.`;
      return;
    }
    const hostContextId = this.createHostContextId(toolId);
    sessionStorage.setItem(hostContextId, JSON.stringify(payload));
    this.currentHostContextId = hostContextId;
    this.setCurrentSessionPayload(payload, `library:${sessionName}`);
    this.importJsonNode.value = JSON.stringify(payload, null, 2);
    this.statusNode.textContent = `Session '${sessionName}' loaded.\nTool: ${toolId}\nHostContextId: ${hostContextId}\nReady to launch.`;
  }

  deleteNamedSession() {
    const sessionName = this.selectedSessionName();
    if (!sessionName) {
      this.statusNode.textContent = "Session name is required to delete.";
      return;
    }
    const library = this.readSessionLibrary();
    if (library === null) {
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(library, sessionName)) {
      this.statusNode.textContent = `Session '${sessionName}' was not found in library.`;
      return;
    }
    delete library[sessionName];
    this.writeSessionLibrary(library);
    this.renderSessionLibrary();
    this.statusNode.textContent = `Session '${sessionName}' deleted from library.`;
  }

  createSessionAndLaunch() {
    const toolId = this.selectedToolId();
    if (!toolId) {
      this.statusNode.textContent = "Select a V2 tool before launch.";
      return;
    }
    if (!this.isValidSessionPayload(this.currentSessionPayload)) {
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
