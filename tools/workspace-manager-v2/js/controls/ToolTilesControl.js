export class ToolTilesControl {
  constructor({ container }) {
    this.container = container;
    this.tools = [];
    this.onLaunchTool = () => {};
  }

  mount({ onLaunchTool, tools }) {
    this.onLaunchTool = onLaunchTool;
    this.tools = tools.map((tool) => ({ ...tool }));
    this.renderEmpty();
  }

  renderEmpty() {
    this.render({
      assetCount: 0,
      canLaunch: false,
      manifestStatus: "Waiting for manifest",
      paletteSwatchCount: 0
    });
  }

  render({
    assetCount = 0,
    canLaunch = false,
    manifestStatus = "Waiting for manifest",
    paletteSwatchCount = 0
  } = {}) {
    this.container.replaceChildren(...this.tools.map((tool) => this.tile({
      assetCount,
      canLaunch,
      manifestStatus,
      paletteSwatchCount,
      tool
    })));
  }

  detailForTool(tool, { assetCount, manifestStatus, paletteSwatchCount }) {
    if (tool.id === "templates-v2") {
      return "Canonical V2 template";
    }
    if (tool.id === "asset-manager-v2") {
      return `${assetCount} managed assets`;
    }
    if (tool.id === "palette-manager-v2") {
      return `${paletteSwatchCount} palette swatches`;
    }
    return manifestStatus;
  }

  tile({ assetCount, canLaunch, manifestStatus, paletteSwatchCount, tool }) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "workspace-manager-v2__tool-tile";
    button.dataset.workspaceToolId = tool.id;
    button.disabled = !canLaunch;
    button.addEventListener("click", () => {
      this.onLaunchTool(tool.id);
    });

    const name = document.createElement("span");
    name.className = "workspace-manager-v2__tool-tile-name";
    name.textContent = tool.name;

    const state = document.createElement("span");
    state.className = "workspace-manager-v2__tool-tile-state";
    state.textContent = canLaunch ? "Ready to launch" : "Waiting for manifest";

    const detail = document.createElement("span");
    detail.className = "workspace-manager-v2__tool-tile-detail";
    detail.textContent = this.detailForTool(tool, { assetCount, manifestStatus, paletteSwatchCount });

    button.append(name, state, detail);
    return button;
  }
}
