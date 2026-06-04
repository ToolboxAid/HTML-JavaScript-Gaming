import { serializeProject } from "../Sprite Editor/modules/projectModel.js";
import { cloneValue, safeString } from "./projectSystemValueUtils.js";
import { getToolBootContract } from "./toolBootContract.js";

function readToolApi(toolId, globalKey) {
  const contract = getToolBootContract(toolId);
  if (contract) {
    try {
      const directApi = typeof contract.getApi === "function" ? contract.getApi() : null;
      if (directApi && typeof directApi === "object") {
        return directApi;
      }

      const initializedApi = typeof contract.init === "function" ? contract.init() : null;
      if (initializedApi && typeof initializedApi === "object") {
        return initializedApi;
      }

      const fallbackApi = typeof contract.getApi === "function" ? contract.getApi() : null;
      if (fallbackApi && typeof fallbackApi === "object") {
        return fallbackApi;
      }
    } catch {
      // Fallback to legacy global lookup.
    }
  }

  return globalThis[globalKey] && typeof globalThis[globalKey] === "object"
    ? globalThis[globalKey]
    : null;
}

function buildUnavailableAdapter(toolId) {
  return {
    toolId,
    ready: false,
    getProjectName() {
      return "Untitled Project";
    },
    captureState() {
      return {};
    },
    applyState() {
      return false;
    }
  };
}

function createTilemapAdapter() {
  const api = readToolApi("tile-map-editor", "tileMapStudioApp");
  if (!api || !api.documentModel) {
    return buildUnavailableAdapter("tile-map-editor");
  }

  return {
    toolId: "tile-map-editor",
    ready: true,
    getProjectName() {
      return safeString(api.documentModel?.map?.name, "Untitled Tilemap");
    },
    captureState() {
      return {
        documentModel: cloneValue(api.documentModel),
        assetRegistry: cloneValue(api.assetRegistry),
        selectedLayerId: safeString(api.selectedLayerId, ""),
        selectedMarkerId: safeString(api.selectedMarkerId, ""),
        activeTileId: Number.isInteger(api.activeTileId) ? api.activeTileId : 1,
        capturedAt: new Date().toISOString()
      };
    },
    applyState(state) {
      if (!state?.documentModel) {
        return false;
      }
      if (typeof api.applyProjectSystemState === "function") {
        return api.applyProjectSystemState(cloneValue(state)) === true;
      }
      return false;
    }
  };
}

function createParallaxAdapter() {
  const api = readToolApi("parallax-editor", "parallaxSceneStudioApp");
  if (!api || !api.documentModel) {
    return buildUnavailableAdapter("parallax-editor");
  }

  return {
    toolId: "parallax-editor",
    ready: true,
    getProjectName() {
      return safeString(api.documentModel?.map?.name, "Untitled Parallax Scene");
    },
    captureState() {
      return {
        documentModel: cloneValue(api.documentModel),
        assetRegistry: cloneValue(api.assetRegistry),
        selectedLayerId: safeString(api.selectedLayerId, ""),
        cameraX: Number.isFinite(Number(api.cameraX)) ? Number(api.cameraX) : 0,
        cameraY: Number.isFinite(Number(api.cameraY)) ? Number(api.cameraY) : 0,
        capturedAt: new Date().toISOString()
      };
    },
    applyState(state) {
      if (!state?.documentModel) {
        return false;
      }
      if (typeof api.applyProjectSystemState === "function") {
        return api.applyProjectSystemState(cloneValue(state)) === true;
      }
      return false;
    }
  };
}

function createSpriteAdapter() {
  const api = readToolApi("sprite-editor", "spriteEditorApp");
  if (!api || !api.state || typeof api.applyProjectSystemState !== "function") {
    return buildUnavailableAdapter("sprite-editor");
  }

  return {
    toolId: "sprite-editor",
    ready: true,
    getProjectName() {
      return safeString(api.state?.project?.name, "Untitled Sprite Project");
    },
    captureState() {
      return {
        project: serializeProject(api.state.project, { includePalette: true }),
        assetRegistry: cloneValue(api.state.assetRegistry),
        preview: {
          fps: Number.isFinite(Number(api.state.preview?.fps)) ? Number(api.state.preview.fps) : 8,
          frameIndex: Number.isFinite(Number(api.state.preview?.frameIndex)) ? Number(api.state.preview.frameIndex) : 0,
          playing: api.state.preview?.playing === true
        },
        projectTool: safeString(api.state.projectTool, "pencil"),
        capturedAt: new Date().toISOString()
      };
    },
    applyState(state) {
      api.applyProjectSystemState(cloneValue(state));
      return true;
    }
  };
}

function createPaletteManagerAdapter() {
  return buildUnavailableAdapter("palette-manager-v2");
}

function createAssetPipelineAdapter() {
  const api = readToolApi("asset-pipeline", "assetPipelineToolApp");
  if (!api || typeof api.captureProjectState !== "function" || typeof api.applyProjectState !== "function") {
    return buildUnavailableAdapter("asset-pipeline");
  }

  return {
    toolId: "asset-pipeline",
    ready: true,
    getProjectName() {
      return "Asset Pipeline Workflow";
    },
    captureState() {
      return cloneValue(api.captureProjectState());
    },
    applyState(state) {
      return api.applyProjectState(cloneValue(state)) === true;
    }
  };
}

export function getProjectAdapter(toolId) {
  switch (toolId) {
    case "tile-map-editor":
      return createTilemapAdapter();
    case "parallax-editor":
      return createParallaxAdapter();
    case "sprite-editor":
      return createSpriteAdapter();
    case "palette-manager-v2":
      return createPaletteManagerAdapter();
    case "asset-pipeline":
      return createAssetPipelineAdapter();
    default:
      return buildUnavailableAdapter(toolId);
  }
}
