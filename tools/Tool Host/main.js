import { createToolHostManifest, getToolHostEntryById } from "../../tools/shared/toolHostManifest.js";
import { createToolHostRuntime } from "../../tools/shared/toolHostRuntime.js";

const refs = {
  toolSelect: document.querySelector("[data-tool-host-select]"),
  stateInput: document.querySelector("[data-tool-host-state-input]"),
  mountButton: document.querySelector("[data-tool-host-mount]"),
  prevButton: document.querySelector("[data-tool-host-prev]"),
  nextButton: document.querySelector("[data-tool-host-next]"),
  unmountButton: document.querySelector("[data-tool-host-unmount]"),
  standaloneLink: document.querySelector("[data-tool-host-standalone]"),
  switchMetaText: document.querySelector("[data-tool-host-switch-meta]"),
  statusText: document.querySelector("[data-tool-host-status]"),
  currentLabel: document.querySelector("[data-tool-host-current-label]"),
  mountContainer: document.querySelector("[data-tool-host-mount-container]")
};

const manifest = createToolHostManifest();
const toolIds = manifest.tools.map((tool) => tool.id);
const hasAvailableTools = toolIds.length > 0;

function readSelectedToolId() {
  return refs.toolSelect instanceof HTMLSelectElement ? refs.toolSelect.value : "";
}

function writeStatus(text) {
  if (refs.statusText instanceof HTMLElement) {
    refs.statusText.textContent = text;
  }
}

function setCurrentLabel(text) {
  if (refs.currentLabel instanceof HTMLElement) {
    refs.currentLabel.textContent = text;
  }
}

function writeSwitchMeta(text) {
  if (refs.switchMetaText instanceof HTMLElement) {
    refs.switchMetaText.textContent = text;
  }
}

function getSelectedToolIndex() {
  const selectedToolId = readSelectedToolId();
  return toolIds.findIndex((toolId) => toolId === selectedToolId);
}

function updateSwitchMeta() {
  if (toolIds.length === 0) {
    writeSwitchMeta("No active tools are available in host manifest.");
    return;
  }
  const selectedIndex = getSelectedToolIndex();
  const oneBased = selectedIndex >= 0 ? selectedIndex + 1 : 1;
  writeSwitchMeta(`Switch target ${oneBased}/${toolIds.length}.`);
}

function selectToolByOffset(offset) {
  if (!(refs.toolSelect instanceof HTMLSelectElement) || toolIds.length === 0) {
    return false;
  }

  const currentIndex = Math.max(0, getSelectedToolIndex());
  const nextIndex = (currentIndex + offset + toolIds.length) % toolIds.length;
  refs.toolSelect.value = toolIds[nextIndex];
  updateSwitchMeta();
  return true;
}

function updateStandaloneHref(toolId) {
  if (!(refs.standaloneLink instanceof HTMLAnchorElement)) {
    return;
  }
  const entry = getToolHostEntryById(manifest, toolId);
  const enabled = !!entry;
  refs.standaloneLink.href = enabled ? entry.launchPath : "#";
  refs.standaloneLink.setAttribute("aria-disabled", enabled ? "false" : "true");
  refs.standaloneLink.tabIndex = enabled ? 0 : -1;
  refs.standaloneLink.style.pointerEvents = enabled ? "" : "none";
  refs.standaloneLink.style.opacity = enabled ? "" : "0.6";
}

function writeQueryToolId(toolId, replace = false) {
  const url = new URL(window.location.href);
  if (toolId) {
    url.searchParams.set("tool", toolId);
  } else {
    url.searchParams.delete("tool");
  }
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", url.toString());
}

function readInitialToolId() {
  const url = new URL(window.location.href);
  const fromQuery = url.searchParams.get("tool");
  if (fromQuery && getToolHostEntryById(manifest, fromQuery)) {
    return fromQuery;
  }
  return manifest.tools[0]?.id || "";
}

function syncControlState() {
  const selectedToolId = readSelectedToolId();
  const hasSelection = !!selectedToolId && !!getToolHostEntryById(manifest, selectedToolId);
  const hasMount = !!runtime.getCurrentMount();

  if (refs.mountButton instanceof HTMLButtonElement) {
    refs.mountButton.disabled = !hasSelection;
  }
  if (refs.prevButton instanceof HTMLButtonElement) {
    refs.prevButton.disabled = !hasAvailableTools;
  }
  if (refs.nextButton instanceof HTMLButtonElement) {
    refs.nextButton.disabled = !hasAvailableTools;
  }
  if (refs.unmountButton instanceof HTMLButtonElement) {
    refs.unmountButton.disabled = !hasMount;
  }
}

function populateToolSelect(initialToolId) {
  if (!(refs.toolSelect instanceof HTMLSelectElement)) {
    return;
  }

  refs.toolSelect.innerHTML = manifest.tools
    .map((tool) => `<option value="${tool.id}">${tool.displayName}</option>`)
    .join("");
  refs.toolSelect.value = getToolHostEntryById(manifest, initialToolId) ? initialToolId : (manifest.tools[0]?.id || "");
  updateSwitchMeta();
}

const runtime = createToolHostRuntime({
  manifest,
  mountContainer: refs.mountContainer,
  onStatus(message) {
    writeStatus(message);
  },
  onMounted(tool) {
    setCurrentLabel(`Mounted: ${tool.displayName}`);
    syncControlState();
  },
  onUnmounted() {
    setCurrentLabel("No tool mounted.");
    syncControlState();
  }
});

function mountSelectedTool(source = "manual") {
  const toolId = readSelectedToolId();
  if (!toolId) {
    writeStatus("Select a tool to mount.");
    return;
  }
  let optionalState = null;
  if (refs.stateInput instanceof HTMLTextAreaElement) {
    const rawState = refs.stateInput.value.trim();
    if (rawState) {
      try {
        optionalState = JSON.parse(rawState);
      } catch {
        writeStatus("State JSON is invalid. Fix JSON or clear the state field.");
        return;
      }
    }
  }
  updateSwitchMeta();
  updateStandaloneHref(toolId);
  writeQueryToolId(toolId, source === "init");
  const previousMount = runtime.getCurrentMount();
  runtime.mountTool(toolId, {
    source,
    requestedAt: new Date().toISOString(),
    sharedContext: {
      requestedToolId: toolId,
      previousToolId: previousMount?.tool?.id || "",
      switchPosition: `${Math.max(1, getSelectedToolIndex() + 1)}/${Math.max(1, toolIds.length)}`
    },
    state: optionalState
  });
  syncControlState();
}

function bindEvents() {
  if (refs.mountButton instanceof HTMLButtonElement) {
    refs.mountButton.addEventListener("click", () => {
      mountSelectedTool("button");
    });
  }

  if (refs.prevButton instanceof HTMLButtonElement) {
    refs.prevButton.addEventListener("click", () => {
      if (!selectToolByOffset(-1)) {
        return;
      }
      mountSelectedTool("prev");
    });
  }

  if (refs.nextButton instanceof HTMLButtonElement) {
    refs.nextButton.addEventListener("click", () => {
      if (!selectToolByOffset(1)) {
        return;
      }
      mountSelectedTool("next");
    });
  }

  if (refs.unmountButton instanceof HTMLButtonElement) {
    refs.unmountButton.addEventListener("click", () => {
      runtime.unmountCurrentTool("manual");
      syncControlState();
    });
  }

  if (refs.toolSelect instanceof HTMLSelectElement) {
    refs.toolSelect.addEventListener("change", () => {
      updateSwitchMeta();
      updateStandaloneHref(readSelectedToolId());
      mountSelectedTool("select");
    });
  }

  window.addEventListener("popstate", () => {
    const toolId = readInitialToolId();
    if (refs.toolSelect instanceof HTMLSelectElement) {
      refs.toolSelect.value = toolId;
    }
    updateSwitchMeta();
    updateStandaloneHref(toolId);
    mountSelectedTool("popstate");
    syncControlState();
  });
}

function init() {
  if (!hasAvailableTools) {
    writeStatus("No active tools are currently available for Tool Host.");
  }
  const initialToolId = readInitialToolId();
  populateToolSelect(initialToolId);
  updateStandaloneHref(initialToolId);
  syncControlState();
  bindEvents();
  if (hasAvailableTools) {
    mountSelectedTool("init");
  }
}

init();
