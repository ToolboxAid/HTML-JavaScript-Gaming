import { runAssetPipelineTooling } from "../shared/pipeline/assetPipelineTooling.js";
import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";

const refs = {
  runButton: document.getElementById("runAssetPipelineButton"),
  statusText: document.getElementById("assetPipelineStatus"),
  input: document.getElementById("assetPipelineInput"),
  output: document.getElementById("assetPipelineOutput")
};

function setStatus(message) {
  if (refs.statusText instanceof HTMLElement) {
    refs.statusText.textContent = message;
  }
}

function getInputPayload() {
  if (!(refs.input instanceof HTMLTextAreaElement)) {
    return null;
  }
  const parsed = safeParseJson(refs.input.value);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  return parsed;
}

function runPipeline() {
  const payload = getInputPayload();
  if (!payload) {
    setStatus("Input JSON is invalid. Provide a pipeline options object.");
    return;
  }
  const result = runAssetPipelineTooling(payload);
  if (refs.output instanceof HTMLElement) {
    refs.output.textContent = toPrettyJson(result);
  }
  const recordCount = Array.isArray(result.records) ? result.records.length : 0;
  setStatus(`Pipeline ${result.status || "unknown"}; records=${recordCount}.`);
}

function createDefaultPayload() {
  return {
    gameId: "asteroids",
    domainInputs: {
      sprites: [
        {
          assetId: "ship-main",
          runtimeFileName: "ship-main.runtime.json",
          toolDataFileName: "ship-main.tool.json",
          sourceToolId: "sprite-editor"
        }
      ]
    },
    toolStates: {
      "sprite-editor": {
        schema: "html-js-gaming.tool-state",
        version: 1,
        toolId: "sprite-editor",
        projectId: "asteroids",
        savedAtIso: "2026-01-01T00:00:00.000Z",
        state: {
          activeLayerId: "base"
        }
      }
    }
  };
}

function bootAssetPipelineTool() {
  if (refs.runButton instanceof HTMLButtonElement) {
    refs.runButton.addEventListener("click", runPipeline);
  }
  if (refs.input instanceof HTMLTextAreaElement && !refs.input.value.trim()) {
    refs.input.value = toPrettyJson(createDefaultPayload());
  }
  return { runPipeline };
}

registerToolBootContract("asset-pipeline-tool", {
  init: bootAssetPipelineTool,
  destroy() {
    return true;
  },
  getApi() {
    return { runPipeline };
  }
});

bootAssetPipelineTool();
