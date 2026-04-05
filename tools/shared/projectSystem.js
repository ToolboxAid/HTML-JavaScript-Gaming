import { getToolById } from "../toolRegistry.js";
import {
  ACTIVE_PROJECT_STORAGE_KEY,
  captureSharedReferenceSnapshot,
  createEmptyProjectManifest,
  migrateProjectManifest,
  normalizeProjectFileName,
  serializeProjectManifest,
  validateProjectManifest
} from "./projectManifestContract.js";
import { getProjectAdapter } from "./projectSystemAdapters.js";

function cloneValue(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function safeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function readStorage() {
  try {
    const raw = localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return validateProjectManifest(JSON.parse(raw)).manifest;
  } catch {
    return null;
  }
}

function writeStorage(manifest) {
  localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, serializeProjectManifest(manifest));
}

function clearStorage() {
  localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY);
}

function downloadTextFile(content, fileName) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read selected project file."));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsText(file);
  });
}

function buildStatusSummary(validation) {
  if (validation.valid) {
    const warningCount = validation.warnings.length;
    return warningCount > 0
      ? `Project opened with ${warningCount} warning${warningCount === 1 ? "" : "s"}.`
      : "Project ready.";
  }
  return `Project invalid: ${validation.issues.join(" ")}`;
}

export function createProjectSystemController(options = {}) {
  const toolId = safeString(options.toolId, "");
  const onChange = typeof options.onChange === "function" ? options.onChange : () => {};
  const onStatus = typeof options.onStatus === "function" ? options.onStatus : () => {};
  const adapter = () => getProjectAdapter(toolId);

  const state = {
    manifest: readStorage(),
    baselineHash: "",
    lastObservedHash: "",
    adapterReady: false,
    appliedInitialState: false
  };

  function computeObservedManifest() {
    const toolAdapter = adapter();
    const currentManifest = state.manifest
      ? cloneValue(state.manifest)
      : createEmptyProjectManifest({
        name: toolAdapter.getProjectName?.() || getToolById(toolId)?.displayName || "Untitled Project",
        toolId
      });

    currentManifest.activeToolId = toolId;
    currentManifest.workspace.lastOpenTool = toolId;
    currentManifest.updatedAt = new Date().toISOString();
    currentManifest.sharedReferences = captureSharedReferenceSnapshot();

    if (toolAdapter.ready) {
      currentManifest.tools[toolId] = toolAdapter.captureState();
      const adapterName = safeString(toolAdapter.getProjectName?.(), "");
      if (adapterName) {
        currentManifest.name = adapterName;
      }
    }

    return migrateProjectManifest(currentManifest);
  }

  function updateDirtyState(reason = "") {
    const observed = computeObservedManifest();
    const observedHash = serializeProjectManifest(observed);
    state.manifest = observed;
    state.lastObservedHash = observedHash;
    state.adapterReady = adapter().ready;
    state.manifest.dirty = Boolean(state.baselineHash) && observedHash !== state.baselineHash;
    writeStorage(state.manifest);
    onChange({
      manifest: cloneValue(state.manifest),
      dirty: state.manifest.dirty === true,
      ready: state.adapterReady,
      reason
    });
    return state.manifest;
  }

  function markSaved(reason = "") {
    const observed = computeObservedManifest();
    const serialized = serializeProjectManifest(observed);
    state.manifest = observed;
    state.baselineHash = serialized;
    state.lastObservedHash = serialized;
    state.manifest.dirty = false;
    writeStorage(state.manifest);
    onChange({
      manifest: cloneValue(state.manifest),
      dirty: false,
      ready: adapter().ready,
      reason
    });
    return state.manifest;
  }

  function ensureProjectManifest() {
    if (!state.manifest) {
      state.manifest = createEmptyProjectManifest({
        name: adapter().getProjectName?.() || getToolById(toolId)?.displayName || "Untitled Project",
        toolId
      });
    }
    return state.manifest;
  }

  function maybeApplyInitialToolState() {
    if (state.appliedInitialState) {
      return;
    }

    const toolAdapter = adapter();
    if (!toolAdapter.ready) {
      return;
    }

    const manifest = ensureProjectManifest();
    const toolState = manifest.tools?.[toolId];
    if (toolState) {
      toolAdapter.applyState(cloneValue(toolState));
      onStatus(buildStatusSummary(validateProjectManifest(manifest)));
    }
    state.appliedInitialState = true;
    markSaved("initial-apply");
  }

  async function handleNewProject() {
    const toolAdapter = adapter();
    const suggestedName = toolAdapter.getProjectName?.() || getToolById(toolId)?.displayName || "Untitled Project";
    const nextName = safeString(window.prompt("Project name", suggestedName), suggestedName);
    const nextManifest = createEmptyProjectManifest({
      name: nextName,
      toolId
    });
    if (toolAdapter.ready) {
      nextManifest.tools[toolId] = toolAdapter.createDefaultState(nextName);
      toolAdapter.applyState(cloneValue(nextManifest.tools[toolId]));
    }
    state.manifest = nextManifest;
    state.appliedInitialState = true;
    markSaved("new-project");
    onStatus(`Started ${nextName}.`);
  }

  async function handleOpenProject(file) {
    const text = await readFileAsText(file);
    const validation = validateProjectManifest(JSON.parse(text));
    if (!validation.valid) {
      throw new Error(validation.issues.join(" "));
    }

    const nextManifest = validation.manifest;
    state.manifest = nextManifest;
    const toolAdapter = adapter();
    if (toolAdapter.ready) {
      const nextToolState = nextManifest.tools?.[toolId] || toolAdapter.createDefaultState(nextManifest.name);
      toolAdapter.applyState(cloneValue(nextToolState));
      nextManifest.tools[toolId] = cloneValue(nextToolState);
    }
    state.appliedInitialState = true;
    markSaved("open-project");
    onStatus(`${nextManifest.name} opened. ${buildStatusSummary(validation)}`);
  }

  function handleSaveProject() {
    const manifest = markSaved("save-project");
    downloadTextFile(`${serializeProjectManifest(manifest)}\n`, normalizeProjectFileName(manifest.name));
    onStatus(`Saved ${normalizeProjectFileName(manifest.name)}.`);
  }

  function handleSaveProjectAs() {
    const manifest = ensureProjectManifest();
    const nextName = safeString(window.prompt("Save project as", manifest.name), manifest.name);
    manifest.name = nextName;
    const saved = markSaved("save-project-as");
    downloadTextFile(`${serializeProjectManifest(saved)}\n`, normalizeProjectFileName(saved.name));
    onStatus(`Saved ${normalizeProjectFileName(saved.name)}.`);
  }

  function handleCloseProject() {
    const toolAdapter = adapter();
    const fallbackName = getToolById(toolId)?.displayName || "Untitled Project";
    const nextManifest = createEmptyProjectManifest({
      name: fallbackName,
      toolId
    });
    if (toolAdapter.ready) {
      nextManifest.tools[toolId] = toolAdapter.createDefaultState(fallbackName);
      toolAdapter.applyState(cloneValue(nextManifest.tools[toolId]));
    }
    state.manifest = nextManifest;
    state.appliedInitialState = true;
    state.baselineHash = "";
    clearStorage();
    updateDirtyState("close-project");
    onStatus("Project closed.");
  }

  function shouldConfirmDiscard(message) {
    updateDirtyState("confirm-check");
    if (state.manifest?.dirty !== true) {
      return true;
    }
    return typeof window.confirm === "function"
      ? window.confirm(message)
      : false;
  }

  function startWatching() {
    maybeApplyInitialToolState();
    updateDirtyState("watch-start");
    const intervalId = window.setInterval(() => {
      maybeApplyInitialToolState();
      updateDirtyState("watch-tick");
    }, 1000);

    window.addEventListener("beforeunload", (event) => {
      updateDirtyState("beforeunload");
      if (state.manifest?.dirty === true) {
        event.preventDefault();
        event.returnValue = "";
      }
    });

    return () => window.clearInterval(intervalId);
  }

  return {
    getManifest() {
      return cloneValue(ensureProjectManifest());
    },
    isDirty() {
      updateDirtyState("is-dirty");
      return state.manifest?.dirty === true;
    },
    shouldConfirmDiscard,
    handleNewProject,
    handleOpenProject,
    handleSaveProject,
    handleSaveProjectAs,
    handleCloseProject,
    updateDirtyState,
    startWatching
  };
}
