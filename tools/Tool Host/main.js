import { createToolHostManifest, getToolHostEntryById } from "../shared/toolHostManifest.js";
import { createToolHostRuntime } from "../shared/toolHostRuntime.js";

const refs = {
  toolSelect: document.querySelector("[data-tool-host-select]"),
  mountButton: document.querySelector("[data-tool-host-mount]"),
  unmountButton: document.querySelector("[data-tool-host-unmount]"),
  standaloneLink: document.querySelector("[data-tool-host-standalone]"),
  statusText: document.querySelector("[data-tool-host-status]"),
  currentLabel: document.querySelector("[data-tool-host-current-label]"),
  mountContainer: document.querySelector("[data-tool-host-mount-container]")
};

const manifest = createToolHostManifest();

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

function updateStandaloneHref(toolId) {
  if (!(refs.standaloneLink instanceof HTMLAnchorElement)) {
    return;
  }
  const entry = getToolHostEntryById(manifest, toolId);
  refs.standaloneLink.href = entry ? entry.launchPath : "#";
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

function populateToolSelect(initialToolId) {
  if (!(refs.toolSelect instanceof HTMLSelectElement)) {
    return;
  }

  refs.toolSelect.innerHTML = manifest.tools
    .map((tool) => `<option value="${tool.id}">${tool.displayName}</option>`)
    .join("");
  refs.toolSelect.value = getToolHostEntryById(manifest, initialToolId) ? initialToolId : (manifest.tools[0]?.id || "");
}

const runtime = createToolHostRuntime({
  manifest,
  mountContainer: refs.mountContainer,
  onStatus(message) {
    writeStatus(message);
  },
  onMounted(tool) {
    setCurrentLabel(`Mounted: ${tool.displayName}`);
  },
  onUnmounted() {
    setCurrentLabel("No tool mounted.");
  }
});

function mountSelectedTool(source = "manual") {
  const toolId = readSelectedToolId();
  if (!toolId) {
    writeStatus("Select a tool to mount.");
    return;
  }
  updateStandaloneHref(toolId);
  writeQueryToolId(toolId, source === "init");
  runtime.mountTool(toolId, {
    source,
    requestedAt: new Date().toISOString()
  });
}

function bindEvents() {
  if (refs.mountButton instanceof HTMLButtonElement) {
    refs.mountButton.addEventListener("click", () => {
      mountSelectedTool("button");
    });
  }

  if (refs.unmountButton instanceof HTMLButtonElement) {
    refs.unmountButton.addEventListener("click", () => {
      runtime.unmountCurrentTool("manual");
    });
  }

  if (refs.toolSelect instanceof HTMLSelectElement) {
    refs.toolSelect.addEventListener("change", () => {
      updateStandaloneHref(readSelectedToolId());
      mountSelectedTool("select");
    });
  }

  window.addEventListener("popstate", () => {
    const toolId = readInitialToolId();
    if (refs.toolSelect instanceof HTMLSelectElement) {
      refs.toolSelect.value = toolId;
    }
    updateStandaloneHref(toolId);
    mountSelectedTool("popstate");
  });
}

function init() {
  const initialToolId = readInitialToolId();
  populateToolSelect(initialToolId);
  updateStandaloneHref(initialToolId);
  bindEvents();
  mountSelectedTool("init");
}

init();
