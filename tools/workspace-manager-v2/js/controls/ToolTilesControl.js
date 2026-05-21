const TOOL_GROUPS = Object.freeze(["Editors", "Utilities", "Viewers"]);

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
      manifestStatus: "Select a game",
      objectVectorCount: 0,
      paletteSwatchCount: 0,
      previewStatus: "Preview Not Found",
      textToSpeechCount: 0
    });
  }

  render({
    assetCount = 0,
    canLaunch = false,
    dirtyByToolId = {},
    enabledToolIds = [],
    manifestStatus = "Select a game",
    objectVectorCount = 0,
    paletteSwatchCount = 0,
    previewStatus = "Preview Not Found",
    textToSpeechCount = 0
  } = {}) {
    const enabledToolIdSet = new Set(enabledToolIds);
    this.container.replaceChildren(...TOOL_GROUPS.map((group) => this.groupSection({
      assetCount,
      canLaunch,
      dirtyByToolId,
      enabledToolIdSet,
      group,
      manifestStatus,
      objectVectorCount,
      paletteSwatchCount,
      previewStatus,
      textToSpeechCount
    })));
  }

  detailForTool(tool, { assetCount, manifestStatus, objectVectorCount, paletteSwatchCount, previewStatus, textToSpeechCount }) {
    if (tool.id === "templates-v2") {
      return "Canonical V2 template";
    }
    if (tool.id === "asset-manager-v2") {
      return `${assetCount} managed assets`;
    }
    if (tool.id === "palette-manager-v2") {
      return `${paletteSwatchCount} palette swatches`;
    }
    if (tool.id === "object-vector-studio-v2") {
      return `${objectVectorCount} object vector assets`;
    }
    if (tool.id === "world-vector-studio-v2") {
      return "Assets, maps, layers, parallax, and scene/world layout";
    }
    if (tool.id === "collision-inspector-v2") {
      return `${objectVectorCount} inspectable objects`;
    }
    if (tool.id === "storage-inspector-v2") {
      return "";
    }
    if (tool.id === "preview-generator-v2") {
      return previewStatus;
    }
    if (tool.id === "text2speech-V2") {
      return `${textToSpeechCount} text to speech`;
    }
    return manifestStatus;
  }

  groupSection({ assetCount, canLaunch, dirtyByToolId, enabledToolIdSet, group, manifestStatus, objectVectorCount, paletteSwatchCount, previewStatus, textToSpeechCount }) {
    const section = document.createElement("section");
    section.className = "workspace-manager-v2__tool-group";
    section.setAttribute("aria-label", `${group} tools`);

    const heading = document.createElement("h2");
    heading.className = "workspace-manager-v2__tool-group-title";
    heading.textContent = group;

    const grid = document.createElement("div");
    grid.className = "workspace-manager-v2__tool-grid";
    this.tools
      .filter((tool) => tool.group === group)
      .forEach((tool) => {
        grid.append(this.tile({
          assetCount,
          canLaunch,
          dirtyByToolId,
          enabledToolIdSet,
          manifestStatus,
          objectVectorCount,
          paletteSwatchCount,
          previewStatus,
          textToSpeechCount,
          tool
        }));
      });

    section.append(heading, grid);
    return section;
  }

  tile({ assetCount, canLaunch, dirtyByToolId, enabledToolIdSet, manifestStatus, objectVectorCount, paletteSwatchCount, previewStatus, textToSpeechCount, tool }) {
    const isEnabledForGame = canLaunch && enabledToolIdSet.has(tool.id);
    const dirtyStatus = dirtyByToolId[tool.id] || "unknown";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "workspace-manager-v2__tool-tile";
    button.dataset.workspaceToolId = tool.id;
    button.dataset.workspaceToolDirty = dirtyStatus;
    button.disabled = !isEnabledForGame;
    button.addEventListener("click", () => {
      this.onLaunchTool(tool.id);
    });

    const name = document.createElement("span");
    name.className = "workspace-manager-v2__tool-tile-name";
    name.textContent = tool.name;

    const state = document.createElement("span");
    state.className = "workspace-manager-v2__tool-tile-state";
    state.textContent = isEnabledForGame
      ? "Ready to launch"
      : (canLaunch ? "Not enabled for game" : manifestStatus);

    const detailText = this.detailForTool(tool, { assetCount, manifestStatus, objectVectorCount, paletteSwatchCount, previewStatus, textToSpeechCount });

    const actions = document.createElement("span");
    actions.className = "workspace-manager-v2__tool-tile-actions";
    (tool.actionLabels || []).forEach((label) => {
      const action = document.createElement("span");
      action.className = "workspace-manager-v2__tool-tile-action";
      action.textContent = label;
      actions.append(action);
    });

    const detail = document.createElement("span");
    detail.className = "workspace-manager-v2__tool-tile-detail";
    detail.textContent = detailText;

    button.append(name, state, detail);
    button.append(actions);
    return button;
  }
}
