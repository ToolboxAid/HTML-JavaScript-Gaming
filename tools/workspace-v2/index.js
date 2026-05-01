class WorkspaceV2SessionProducer {
  constructor() {
    document.title = "Workspace V2";
    document.body.dataset.toolId = "workspace-v2";
    this.toolSelect = document.getElementById("workspaceV2ToolSelect");
    this.loadFixtureButton = document.getElementById("workspaceV2LoadFixtureButton");
    this.launchButton = document.getElementById("workspaceV2LaunchButton");
    this.statusNode = document.getElementById("workspaceV2Status");
    this.loadedFixture = null;
    this.loadedToolId = "";
    this.loadFixtureButton.addEventListener("click", () => {
      this.loadSelectedFixture();
    });
    this.launchButton.addEventListener("click", () => {
      this.createSessionAndLaunch();
    });
  }

  selectedToolId() {
    return typeof this.toolSelect.value === "string" ? this.toolSelect.value.trim() : "";
  }

  fixturePathForTool(toolId) {
    return `../../tests/fixtures/v2-tools/${toolId}.json`;
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
        this.loadedFixture = null;
        this.loadedToolId = "";
        return;
      }
      const fixture = await response.json();
      if (!fixture || typeof fixture !== "object" || Array.isArray(fixture)) {
        this.statusNode.textContent = "Fixture is invalid. Expected a JSON object with hostContextId and sessionContext.";
        this.loadedFixture = null;
        this.loadedToolId = "";
        return;
      }
      if (typeof fixture.sessionContext !== "object" || !fixture.sessionContext || Array.isArray(fixture.sessionContext)) {
        this.statusNode.textContent = "Fixture is invalid. Missing sessionContext object.";
        this.loadedFixture = null;
        this.loadedToolId = "";
        return;
      }
      this.loadedFixture = fixture;
      this.loadedToolId = toolId;
      this.statusNode.textContent = `Fixture loaded for ${toolId}.\nReady to create session and launch.`;
    } catch (error) {
      this.loadedFixture = null;
      this.loadedToolId = "";
      this.statusNode.textContent = `Fixture read failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  }

  createHostContextId(toolId) {
    const randomPart = Math.random().toString(36).slice(2, 10);
    return `${toolId}-${Date.now()}-${randomPart}`;
  }

  buildToolLaunchUrl(toolId, hostContextId) {
    const toolUrl = new URL(`../${toolId}/index.html`, window.location.href);
    toolUrl.searchParams.set("hostContextId", hostContextId);
    return toolUrl.toString();
  }

  createSessionAndLaunch() {
    const toolId = this.selectedToolId();
    if (!toolId) {
      this.statusNode.textContent = "Select a V2 tool before launch.";
      return;
    }
    if (!this.loadedFixture || this.loadedToolId !== toolId) {
      this.statusNode.textContent = "Load fixture for the selected tool before launch.";
      return;
    }
    const hostContextId = this.createHostContextId(toolId);
    const payload = this.loadedFixture.sessionContext;
    sessionStorage.setItem(hostContextId, JSON.stringify(payload));
    const launchUrl = this.buildToolLaunchUrl(toolId, hostContextId);
    this.statusNode.textContent = `Session created.\nTool: ${toolId}\nHostContextId: ${hostContextId}\nURL: tools/${toolId}/index.html?hostContextId=${hostContextId}`;
    window.location.href = launchUrl;
  }
}

new WorkspaceV2SessionProducer();
