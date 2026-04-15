import {
  convertAssetPipelineCandidate,
  createAssetPipelineConverterRegistry,
  listAssetPipelineConverters
} from "../shared/assetPipelineConverters.js";
import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";

const refs = {
  runButton: document.getElementById("runConverterButton"),
  statusText: document.getElementById("converterStatus"),
  input: document.getElementById("converterInput"),
  output: document.getElementById("converterOutput")
};

const converterRegistry = createAssetPipelineConverterRegistry();

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

function runConversion() {
  const payload = getInputPayload();
  if (!payload) {
    setStatus("Input JSON is invalid. Provide candidate/conversion payload.");
    return;
  }
  const candidate = payload.candidate && typeof payload.candidate === "object" ? payload.candidate : {};
  const conversion = payload.conversion && typeof payload.conversion === "object" ? payload.conversion : {};
  const result = convertAssetPipelineCandidate(candidate, {
    conversion,
    converterRegistry
  });
  if (refs.output instanceof HTMLElement) {
    refs.output.textContent = toPrettyJson({
      availableConverters: listAssetPipelineConverters(converterRegistry),
      result
    });
  }
  setStatus(`Conversion ${result.applied ? "applied" : "not-applied"} (${result.converterId || "no-converter"}).`);
}

function createDefaultPayload() {
  return {
    candidate: {
      id: "arena-main",
      name: "arena-main",
      section: "tilemaps",
      type: "tilemap",
      path: "assets/tilemaps/arena-main.tilemap.json"
    },
    conversion: {
      targetSection: "vectors",
      targetType: "vector"
    }
  };
}

function bootTileModelConverter() {
  if (refs.runButton instanceof HTMLButtonElement) {
    refs.runButton.addEventListener("click", runConversion);
  }
  if (refs.input instanceof HTMLTextAreaElement && !refs.input.value.trim()) {
    refs.input.value = toPrettyJson(createDefaultPayload());
  }
  return { runConversion };
}

registerToolBootContract("tile-model-converter", {
  init: bootTileModelConverter,
  destroy() {
    return true;
  },
  getApi() {
    return { runConversion };
  }
});

bootTileModelConverter();
