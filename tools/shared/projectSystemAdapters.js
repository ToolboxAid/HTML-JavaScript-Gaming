import { createAssetRegistry } from "./projectAssetRegistry.js";
import { createNewProject, ensureProjectShape, serializeProject } from "../Sprite Editor/modules/projectModel.js";
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
    },
    createDefaultState(projectName) {
      return { name: safeString(projectName, "Untitled Project") };
    }
  };
}

function createVectorMapAdapter() {
  const api = readToolApi("vector-map-editor", "vectorMapEditorApp");
  if (!api || typeof api.createHistorySnapshot !== "function" || typeof api.applyHistorySnapshot !== "function") {
    return buildUnavailableAdapter("vector-map-editor");
  }

  return {
    toolId: "vector-map-editor",
    ready: true,
    getProjectName() {
      return safeString(api.documentModel?.getData?.().name, "Untitled Vector Map");
    },
    captureState() {
      return {
        snapshot: cloneValue(api.createHistorySnapshot()),
        capturedAt: new Date().toISOString()
      };
    },
    applyState(state) {
      if (!state?.snapshot) {
        return false;
      }
      api.applyHistorySnapshot(cloneValue(state.snapshot));
      return true;
    },
    createDefaultState(projectName) {
      return {
        snapshot: {
          documentData: {
            schema: "toolbox.vector-map/1",
            version: 1,
            name: safeString(projectName, "Untitled Vector Map"),
            width: 1280,
            height: 720,
            background: "#000000",
            mode: "2d",
            objects: []
          },
          selection: {
            objectId: null,
            pointIndex: null
          },
          workspaceViewMode: "2d"
        }
      };
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
        api.applyProjectSystemState(cloneValue(state));
        return true;
      }
      return false;
    },
    createDefaultState(projectName) {
      return {
        documentModel: {
          schema: "toolbox.tilemap/1",
          version: 1,
          map: {
            name: safeString(projectName, "untitled-map"),
            width: 32,
            height: 18,
            tileSize: 24
          },
          tileset: [],
          tilesetAtlas: {
            schema: "toolbox.tileset-atlas/1",
            imageName: "",
            imageWidth: 0,
            imageHeight: 0,
            tileWidth: 24,
            tileHeight: 24,
            spacing: 0,
            margin: 0
          },
          layers: [],
          markers: [],
          assetRefs: {
            tilemapId: "",
            tilesetId: ""
          }
        },
        assetRegistry: createAssetRegistry({ projectId: safeString(projectName, "tilemap-project") })
      };
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
        api.applyProjectSystemState(cloneValue(state));
        return true;
      }
      return false;
    },
    createDefaultState(projectName) {
      return {
        documentModel: {
          schema: "toolbox.parallax/1",
          version: 1,
          companionEditor: "ParallaxEditor",
          map: {
            name: safeString(projectName, "untitled-map"),
            width: 32,
            height: 18,
            tileSize: 24,
            pixelWidth: 768,
            pixelHeight: 432
          },
          layers: [],
          assetRefs: {
            parallaxSourceIds: []
          }
        },
        assetRegistry: createAssetRegistry({ projectId: safeString(projectName, "parallax-project") })
      };
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
    },
    createDefaultState(projectName) {
      return {
        project: serializeProject(createNewProject({ name: safeString(projectName, "Untitled Sprite Project") }), { includePalette: true }),
        assetRegistry: createAssetRegistry({ projectId: "sprite-project" }),
        preview: {
          fps: 8,
          frameIndex: 0,
          playing: false
        },
        projectTool: "pencil"
      };
    }
  };
}

function createVectorAssetAdapter() {
  const api = readToolApi("vector-asset-studio", "vectorAssetStudioApp");
  if (!api || typeof api.captureProjectState !== "function" || typeof api.applyProjectState !== "function") {
    return buildUnavailableAdapter("vector-asset-studio");
  }

  return {
    toolId: "vector-asset-studio",
    ready: true,
    getProjectName() {
      return safeString(api.getProjectName?.(), "Untitled Vector Asset");
    },
    captureState() {
      return cloneValue(api.captureProjectState());
    },
    applyState(state) {
      return api.applyProjectState(cloneValue(state)) === true;
    },
    createDefaultState(projectName) {
      return api.createDefaultProjectState
        ? cloneValue(api.createDefaultProjectState(projectName))
        : {
          documentName: safeString(projectName, "untitled-background"),
          svgText: "",
          canvasWidth: 1600,
          canvasHeight: 900
        };
    }
  };
}

function createAssetBrowserAdapter() {
  const api = readToolApi("asset-browser", "assetBrowserApp");
  if (!api || typeof api.captureProjectState !== "function" || typeof api.applyProjectState !== "function") {
    return buildUnavailableAdapter("asset-browser");
  }

  return {
    toolId: "asset-browser",
    ready: true,
    getProjectName() {
      return "Shared Asset Workflow";
    },
    captureState() {
      return cloneValue(api.captureProjectState());
    },
    applyState(state) {
      return api.applyProjectState(cloneValue(state)) === true;
    },
    createDefaultState() {
      return {
        selectedCategory: "All",
        search: "",
        selectedAssetId: "",
        importCategory: "Vector Assets",
        importName: ""
      };
    }
  };
}

function createPaletteBrowserAdapter() {
  const api = readToolApi("palette-browser", "paletteBrowserApp");
  if (!api || typeof api.captureProjectState !== "function" || typeof api.applyProjectState !== "function") {
    return buildUnavailableAdapter("palette-browser");
  }

  return {
    toolId: "palette-browser",
    ready: true,
    getProjectName() {
      return "Shared Palette Workflow";
    },
    captureState() {
      return cloneValue(api.captureProjectState());
    },
    applyState(state) {
      return api.applyProjectState(cloneValue(state)) === true;
    },
    createDefaultState() {
      return {
        search: "",
        selectedPaletteId: "",
        selectedSwatchIndex: 0,
        customPalettes: []
      };
    }
  };
}

export function getProjectAdapter(toolId) {
  switch (toolId) {
    case "vector-map-editor":
      return createVectorMapAdapter();
    case "vector-asset-studio":
      return createVectorAssetAdapter();
    case "tile-map-editor":
      return createTilemapAdapter();
    case "parallax-editor":
      return createParallaxAdapter();
    case "sprite-editor":
      return createSpriteAdapter();
    case "asset-browser":
      return createAssetBrowserAdapter();
    case "palette-browser":
      return createPaletteBrowserAdapter();
    default:
      return buildUnavailableAdapter(toolId);
  }
}
