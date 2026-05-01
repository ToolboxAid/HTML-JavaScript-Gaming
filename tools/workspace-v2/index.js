class WorkspaceV2SessionProducer {
  constructor() {
    document.title = "Workspace V2";
    document.body.dataset.toolId = "workspace-v2";
    this.libraryStorageKey = "v2-session-library";
    this.errorLogsStorageKey = "v2-error-logs";
    this.toolSelect = document.getElementById("workspaceV2ToolSelect");
    this.backButton = document.getElementById("workspaceV2BackButton");
    this.loadFixtureButton = document.getElementById("workspaceV2LoadFixtureButton");
    this.launchButton = document.getElementById("workspaceV2LaunchButton");
    this.importJsonNode = document.getElementById("workspaceV2ImportJson");
    this.importFileNode = document.getElementById("workspaceV2ImportFile");
    this.importButton = document.getElementById("workspaceV2ImportButton");
    this.exportButton = document.getElementById("workspaceV2ExportButton");
    this.shareUrlNode = document.getElementById("workspaceV2ShareUrl");
    this.createShareLinkButton = document.getElementById("workspaceV2CreateShareLinkButton");
    this.applyShareLinkButton = document.getElementById("workspaceV2ApplyShareLinkButton");
    this.sessionNameNode = document.getElementById("workspaceV2SessionName");
    this.saveSessionButton = document.getElementById("workspaceV2SaveSessionButton");
    this.overwriteSessionButton = document.getElementById("workspaceV2OverwriteSessionButton");
    this.loadSessionButton = document.getElementById("workspaceV2LoadSessionButton");
    this.deleteSessionButton = document.getElementById("workspaceV2DeleteSessionButton");
    this.libraryEmptyState = document.getElementById("workspaceV2LibraryEmptyState");
    this.sessionListNode = document.getElementById("workspaceV2SessionList");
    this.refreshErrorLogsButton = document.getElementById("workspaceV2RefreshErrorLogsButton");
    this.clearErrorLogsButton = document.getElementById("workspaceV2ClearErrorLogsButton");
    this.errorLogsEmptyState = document.getElementById("workspaceV2ErrorLogsEmptyState");
    this.errorLogsListNode = document.getElementById("workspaceV2ErrorLogsList");
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
    this.createShareLinkButton.addEventListener("click", () => {
      this.createShareLink();
    });
    this.applyShareLinkButton.addEventListener("click", () => {
      this.applyShareLink();
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
    this.refreshErrorLogsButton.addEventListener("click", () => {
      this.renderErrorLogsViewer();
    });
    this.clearErrorLogsButton.addEventListener("click", () => {
      this.clearErrorLogs();
    });
    this.backButton.addEventListener("click", () => {
      window.location.href = "../index.html";
    });
    window.addEventListener("storage", (event) => {
      if (event.key === this.errorLogsStorageKey) {
        this.renderErrorLogsViewer();
      }
    });
    this.decodeSessionParamFromUrl();
    this.renderSessionLibrary();
    this.renderErrorLogsViewer();
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

  applySessionPayload(sessionPayload, sourceLabel) {
    if (!this.isValidSessionPayload(sessionPayload)) {
      this.statusNode.textContent = "Session payload is invalid. Expected a JSON object payload.";
      return false;
    }
    const toolId = this.selectedToolId();
    if (!toolId) {
      this.statusNode.textContent = "Select a V2 tool before applying session payload.";
      return false;
    }
    const hostContextId = this.createHostContextId(toolId);
    sessionStorage.setItem(hostContextId, JSON.stringify(sessionPayload));
    this.currentHostContextId = hostContextId;
    this.setCurrentSessionPayload(sessionPayload, sourceLabel);
    this.importJsonNode.value = JSON.stringify(sessionPayload, null, 2);
    return true;
  }

  encodeSessionPayload(sessionPayload) {
    const json = JSON.stringify(sessionPayload);
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    for (let index = 0; index < bytes.length; index += 1) {
      binary += String.fromCharCode(bytes[index]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  decodeSessionPayload(encodedPayload) {
    if (typeof encodedPayload !== "string" || !encodedPayload.trim()) {
      throw new Error("Missing encoded session payload.");
    }
    const normalized = encodedPayload.trim().replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
    const binary = atob(`${normalized}${padding}`);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (!this.isValidSessionPayload(parsed)) {
      throw new Error("Decoded session payload is invalid. Expected an object payload.");
    }
    return parsed;
  }

  decodeSessionParamFromUrl() {
    const params = new URL(window.location.href).searchParams;
    if (!params.has("session")) {
      return;
    }
    try {
      const decoded = this.decodeSessionPayload(params.get("session"));
      if (!this.applySessionPayload(decoded, "share-link")) {
        return;
      }
      this.statusNode.textContent = `Share session link decoded.\nTool: ${this.selectedToolId()}\nHostContextId: ${this.currentHostContextId}\nReady to launch.`;
      this.shareUrlNode.value = window.location.href;
    } catch (error) {
      this.statusNode.textContent = `Share session decode failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
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

  isValidErrorLogEntry(errorLogEntry) {
    if (!errorLogEntry || typeof errorLogEntry !== "object" || Array.isArray(errorLogEntry)) {
      return false;
    }
    if (typeof errorLogEntry.tool !== "string" || !errorLogEntry.tool.trim()) {
      return false;
    }
    if (!["EMPTY", "INVALID", "RUNTIME"].includes(errorLogEntry.type)) {
      return false;
    }
    if (typeof errorLogEntry.message !== "string" || !errorLogEntry.message.trim()) {
      return false;
    }
    if (!errorLogEntry.details || typeof errorLogEntry.details !== "object" || Array.isArray(errorLogEntry.details)) {
      return false;
    }
    if (typeof errorLogEntry.timestamp !== "string" || !errorLogEntry.timestamp.trim()) {
      return false;
    }
    return true;
  }

  readErrorLogs() {
    const rawErrorLogs = localStorage.getItem(this.errorLogsStorageKey);
    if (!rawErrorLogs) {
      return [];
    }
    let parsedErrorLogs = null;
    try {
      parsedErrorLogs = JSON.parse(rawErrorLogs);
    } catch (error) {
      console.warn(`[WorkspaceV2ErrorViewer] Ignoring invalid v2-error-logs JSON: ${error instanceof Error ? error.message : "unknown error"}`);
      return [];
    }
    if (!Array.isArray(parsedErrorLogs)) {
      console.warn("[WorkspaceV2ErrorViewer] Ignoring invalid v2-error-logs value: expected array.");
      return [];
    }
    const validErrorLogs = [];
    let invalidCount = 0;
    parsedErrorLogs.forEach((errorLogEntry) => {
      if (this.isValidErrorLogEntry(errorLogEntry)) {
        validErrorLogs.push(errorLogEntry);
        return;
      }
      invalidCount += 1;
    });
    if (invalidCount > 0) {
      console.warn(`[WorkspaceV2ErrorViewer] Ignored ${invalidCount} invalid error log entr${invalidCount === 1 ? "y" : "ies"}.`);
    }
    return validErrorLogs;
  }

  groupErrorLogsByTool(errorLogs) {
    const grouped = {};
    errorLogs.forEach((errorLogEntry) => {
      if (!Object.prototype.hasOwnProperty.call(grouped, errorLogEntry.tool)) {
        grouped[errorLogEntry.tool] = [];
      }
      grouped[errorLogEntry.tool].push(errorLogEntry);
    });
    return grouped;
  }

  renderErrorLogsViewer() {
    const errorLogs = this.readErrorLogs();
    this.errorLogsListNode.replaceChildren();
    this.errorLogsEmptyState.hidden = errorLogs.length > 0;
    this.errorLogsEmptyState.textContent = "No error logs found.";
    if (errorLogs.length === 0) {
      return;
    }
    const groupedErrorLogs = this.groupErrorLogsByTool(errorLogs);
    const toolIds = Object.keys(groupedErrorLogs).sort((left, right) => left.localeCompare(right));
    toolIds.forEach((toolId) => {
      const groupSection = document.createElement("section");
      const heading = document.createElement("h3");
      const list = document.createElement("ul");
      heading.textContent = `${toolId} (${groupedErrorLogs[toolId].length})`;
      groupedErrorLogs[toolId].forEach((errorLogEntry) => {
        const listItem = document.createElement("li");
        const meta = document.createElement("strong");
        const message = document.createElement("div");
        const details = document.createElement("pre");
        meta.textContent = `${errorLogEntry.type} | ${errorLogEntry.timestamp}`;
        message.textContent = errorLogEntry.message;
        details.textContent = JSON.stringify(errorLogEntry.details, null, 2);
        listItem.append(meta, message, details);
        list.appendChild(listItem);
      });
      groupSection.append(heading, list);
      this.errorLogsListNode.appendChild(groupSection);
    });
  }

  clearErrorLogs() {
    localStorage.setItem(this.errorLogsStorageKey, "[]");
    this.renderErrorLogsViewer();
    this.statusNode.textContent = "Error logs cleared from localStorage key v2-error-logs.";
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
      this.statusNode.textContent = `Fixture loaded for ${toolId}.\nSession payload is ready for launch, export, share, or library save.`;
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
      if (!this.applySessionPayload(parsed, "import")) {
        return;
      }
      this.statusNode.textContent = `Session imported.\nTool: ${toolId}\nHostContextId: ${this.currentHostContextId}\nReady to launch.`;
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

  createShareLink() {
    if (!this.isValidSessionPayload(this.currentSessionPayload)) {
      this.statusNode.textContent = "No current session payload to share. Load fixture, import JSON, or load library session first.";
      return;
    }
    try {
      const encoded = this.encodeSessionPayload(this.currentSessionPayload);
      const shareUrl = new URL(window.location.href);
      shareUrl.searchParams.set("session", encoded);
      this.shareUrlNode.value = shareUrl.toString();
      this.statusNode.textContent = "Share link created from current session payload.";
    } catch (error) {
      this.statusNode.textContent = `Share link creation failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  }

  applyShareLink() {
    const rawShareValue = typeof this.shareUrlNode.value === "string" ? this.shareUrlNode.value.trim() : "";
    if (!rawShareValue) {
      this.statusNode.textContent = "Share URL is required to apply.";
      return;
    }
    try {
      const parsedUrl = new URL(rawShareValue, window.location.href);
      if (!parsedUrl.searchParams.has("session")) {
        this.statusNode.textContent = "Share URL is invalid. Missing session query parameter.";
        return;
      }
      const decoded = this.decodeSessionPayload(parsedUrl.searchParams.get("session"));
      if (!this.applySessionPayload(decoded, "share-link")) {
        return;
      }
      this.statusNode.textContent = `Share session link applied.\nTool: ${this.selectedToolId()}\nHostContextId: ${this.currentHostContextId}\nReady to launch.`;
    } catch (error) {
      this.statusNode.textContent = `Share session decode failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
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
    if (!this.applySessionPayload(payload, `library:${sessionName}`)) {
      this.statusNode.textContent = `Session '${sessionName}' payload is invalid.`;
      return;
    }
    this.statusNode.textContent = `Session '${sessionName}' loaded.\nTool: ${toolId}\nHostContextId: ${this.currentHostContextId}\nReady to launch.`;
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
      this.statusNode.textContent = "No session payload is available. Load a fixture, import JSON, apply share link, or load library session first.";
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
