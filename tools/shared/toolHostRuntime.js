import { getToolHostEntryById } from "./toolHostManifest.js";

function normalizeToolId(toolId) {
  return typeof toolId === "string" ? toolId.trim() : "";
}

function buildHostLaunchUrl(toolEntry, config = {}) {
  const url = new URL(toolEntry.launchPath, window.location.href);
  url.searchParams.set("hosted", "1");
  url.searchParams.set("hostToolId", toolEntry.id);

  if (config && typeof config === "object") {
    Object.entries(config).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      url.searchParams.set(`hostConfig_${key}`, String(value));
    });
  }

  return url.toString();
}

function createHostFrame(toolEntry, sourceUrl) {
  const frame = document.createElement("iframe");
  frame.setAttribute("data-tool-host-frame", toolEntry.id);
  frame.setAttribute("title", `${toolEntry.displayName} Host Frame`);
  frame.setAttribute("loading", "eager");
  frame.style.width = "100%";
  frame.style.minHeight = "960px";
  frame.style.border = "0";
  frame.style.background = "transparent";
  frame.src = sourceUrl;
  return frame;
}

function readToolDestroyContract(frameWindow, toolId) {
  if (!frameWindow || typeof frameWindow !== "object") {
    return null;
  }
  const registry = frameWindow.__TOOLS_BOOT_CONTRACT_REGISTRY__;
  if (!registry || typeof registry !== "object") {
    return null;
  }
  const contract = registry[toolId];
  if (!contract || typeof contract.destroy !== "function") {
    return null;
  }
  return contract.destroy.bind(contract);
}

export function createToolHostRuntime(options = {}) {
  const manifest = options.manifest;
  const mountContainer = options.mountContainer instanceof HTMLElement ? options.mountContainer : null;
  const onStatus = typeof options.onStatus === "function" ? options.onStatus : (() => {});
  const onMounted = typeof options.onMounted === "function" ? options.onMounted : (() => {});
  const onUnmounted = typeof options.onUnmounted === "function" ? options.onUnmounted : (() => {});

  let currentMount = null;
  let mountSequence = 0;

  function getCurrentMount() {
    return currentMount ? { ...currentMount } : null;
  }

  function unmountCurrentTool(reason = "manual") {
    if (!currentMount) {
      onStatus("Tool host is idle.");
      return false;
    }

    const previous = currentMount;
    currentMount = null;

    let destroyStatus = "not-available";
    try {
      const frameWindow = previous.frame?.contentWindow ?? null;
      const destroyFn = readToolDestroyContract(frameWindow, previous.tool.id);
      if (destroyFn) {
        const destroyResult = destroyFn({
          reason,
          hosted: true,
          source: "tool-host-runtime"
        });
        destroyStatus = destroyResult === false ? "failed" : "ok";
      }
    } catch {
      destroyStatus = "failed";
    }

    if (previous.frame && previous.frame.parentElement === mountContainer) {
      previous.frame.removeAttribute("src");
      mountContainer.removeChild(previous.frame);
    }
    onStatus(`Unmounted ${previous.tool.displayName} (${reason}, destroy=${destroyStatus}).`);
    onUnmounted(previous.tool, reason, destroyStatus);
    return true;
  }

  function mountTool(toolId, config = {}) {
    if (!mountContainer) {
      onStatus("Tool host container is unavailable.");
      return null;
    }

    const normalizedToolId = normalizeToolId(toolId);
    const toolEntry = getToolHostEntryById(manifest, normalizedToolId);
    if (!toolEntry) {
      onStatus(`Tool id not found: ${normalizedToolId || "(empty)"}.`);
      return null;
    }

    if (currentMount && currentMount.tool.id !== toolEntry.id) {
      unmountCurrentTool("switch");
    } else if (currentMount && currentMount.tool.id === toolEntry.id) {
      unmountCurrentTool("reload");
    }

    mountSequence += 1;
    const sequenceId = mountSequence;
    const sourceUrl = buildHostLaunchUrl(toolEntry, config);
    const frame = createHostFrame(toolEntry, sourceUrl);
    frame.addEventListener("load", () => {
      if (!currentMount || currentMount.mountSequence !== sequenceId) {
        return;
      }
      currentMount.loadedAt = new Date().toISOString();
      onStatus(`Mounted ${toolEntry.displayName}.`);
    }, { once: true });
    frame.addEventListener("error", () => {
      if (!currentMount || currentMount.mountSequence !== sequenceId) {
        return;
      }
      currentMount.failedAt = new Date().toISOString();
      onStatus(`Failed to load ${toolEntry.displayName}.`);
    }, { once: true });

    mountContainer.replaceChildren(frame);
    currentMount = {
      tool: toolEntry,
      frame,
      sourceUrl,
      mountedAt: new Date().toISOString(),
      mountSequence: sequenceId
    };

    onStatus(`Mounting ${toolEntry.displayName}...`);
    onMounted(toolEntry, currentMount);
    return getCurrentMount();
  }

  window.addEventListener("beforeunload", () => {
    unmountCurrentTool("page-unload");
  });

  return {
    mountTool,
    unmountCurrentTool,
    getCurrentMount
  };
}
