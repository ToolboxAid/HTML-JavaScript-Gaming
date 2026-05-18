const TOOL_NAME_SUFFIX_PATTERN = /(?:^|[\s_-])(v2|v3|new|final|copy)(?:$|[\s_-])/i;

export const TOOL_REGISTRY = Object.freeze([
  {
    id: "vector-map-editor",
    name: "Vector Map Editor",
    displayName: "Vector Map Editor",
    shortDescription: "Deprecated: use World Vector Studio V2 for terrain, world geometry, layered scenes, and environment layout.",
    shortLabel: "Map",
    path: "Vector Map Editor",
    folderName: "Vector Map Editor",
    entryPoint: "Vector Map Editor/index.html",
    description: "Deprecated: use World Vector Studio V2 for terrain, tile/world geometry, layered scenes, level/environment layout, and parallax/background structures.",
    showcaseTag: "Geometry",
    showcaseStatus: "Deprecated",
    active: true,
    legacy: false,
    order: 1,
    sampleEntryPoints: [
      {
        label: "How To Use",
        path: "Vector Map Editor/how_to_use.html"
      },
      {
        label: "Sample 1208 - Tool Formatted Tiles Parallax",
        path: "../samples/phase-12/1208/index.html"
      }
    ],
    visibleInToolsList: true
  },
  {
    id: "world-vector-studio-v2",
    name: "World Vector Studio V2",
    displayName: "World Vector Studio V2",
    shortDescription: "Terrain, tile/world geometry, layered scenes, level/environment layout, and parallax/background structures.",
    shortLabel: "World",
    path: "world-vector-studio-v2",
    folderName: "world-vector-studio-v2",
    entryPoint: "world-vector-studio-v2/index.html",
    description: "Terrain, tile/world geometry, layered scenes, level/environment layout, and parallax/background structures.",
    showcaseTag: "World Vectors",
    showcaseStatus: "Template Copied",
    active: true,
    legacy: false,
    order: 1.25,
    sampleEntryPoints: [
      {
        label: "README",
        path: "world-vector-studio-v2/README.md"
      }
    ],
    visibleInToolsList: true
  },
  {
    id: "object-vector-studio-v2",
    name: "Object Vector Studio V2",
    displayName: "Object Vector Studio V2",
    shortDescription: "Ships, enemies, pickups, actors, and reusable gameplay entities.",
    shortLabel: "Object",
    path: "object-vector-studio-v2",
    folderName: "object-vector-studio-v2",
    entryPoint: "object-vector-studio-v2/index.html",
    description: "Ships, enemies, pickups, actors, and reusable gameplay entities.",
    showcaseTag: "Object Vectors",
    showcaseStatus: "Template Copied",
    active: true,
    legacy: false,
    order: 1.5,
    sampleEntryPoints: [
      {
        label: "README",
        path: "object-vector-studio-v2/README.md"
      }
    ],
    visibleInToolsList: true
  },
  {
    id: "svg-asset-studio",
    name: "SVG Asset Studio",
    displayName: "SVG Asset Studio",
    shortDescription: "Create and edit reusable vector (SVG) assets. Build shapes, icons, and asset components.",
    shortLabel: "Asset",
    path: "SVG Asset Studio",
    folderName: "SVG Asset Studio",
    entryPoint: "SVG Asset Studio/index.html",
    description: "Create and edit reusable vector (SVG) assets. Build shapes, icons, and asset components.",
    showcaseTag: "Vector Assets",
    showcaseStatus: "SVG Contract Ready",
    active: true,
    legacy: false,
    order: 2,
    sampleEntryPoints: [
      {
        label: "Sample Manifest",
        path: "SVG Asset Studio/samples/sample-manifest.json"
      },
      {
        label: "Sample 1208 - Tool Formatted Tiles Parallax",
        path: "../samples/phase-12/1208/index.html"
      }
    ],
    visibleInToolsList: true
  },
  {
    id: "tile-map-editor",
    name: "Tilemap Studio",
    displayName: "Tilemap Studio",
    shortLabel: "Tile",
    path: "Tilemap Studio",
    folderName: "Tilemap Studio",
    entryPoint: "Tilemap Studio/index.html",
    description: "Tile map layout studio for layered map authoring, sample playback, simulation, and packaging flows.",
    showcaseTag: "Tile Maps",
    showcaseStatus: "Sample Loading Ready",
    active: true,
    legacy: false,
    order: 3,
    sampleEntryPoints: [
      {
        label: "How To Use",
        path: "Tilemap Studio/how_to_use.html"
      },
      {
        label: "Sample 1208 - Tool Formatted Tiles Parallax",
        path: "../samples/phase-12/1208/index.html"
      },
      {
        label: "Sample 1209 - Tilemap Basic Layout Preset",
        path: "../samples/phase-12/1209/index.html"
      },
      {
        label: "Sample 1210 - Tilemap Objective Layout Preset",
        path: "../samples/phase-12/1210/index.html"
      },
      {
        label: "Sample 1211 - Tilemap Mario Learning Layout Preset",
        path: "../samples/phase-12/1211/index.html"
      }
    ],
    visibleInToolsList: true
  },
  {
    id: "parallax-editor",
    name: "Parallax Scene Studio",
    displayName: "Parallax Scene Studio",
    shortDescription: "Layered Scene & Depth Composition",
    shortLabel: "Parallax",
    path: "Parallax Scene Studio",
    folderName: "Parallax Scene Studio",
    entryPoint: "Parallax Scene Studio/index.html",
    description: "Parallax Scene Studio: compose layered backgrounds, midgrounds, and foreground scene depth.",
    showcaseTag: "Parallax",
    showcaseStatus: "Scene Preview Ready",
    active: true,
    legacy: false,
    order: 4,
    sampleEntryPoints: [
      {
        label: "Sample Manifest",
        path: "Parallax Scene Studio/samples/sample-manifest.json"
      },
      {
        label: "Sample 1208 - Tool Formatted Tiles Parallax",
        path: "../samples/phase-12/1208/index.html"
      }
    ],
    visibleInToolsList: true
  },
  {
    id: "sprite-editor",
    name: "Sprite Editor",
    displayName: "Sprite Editor",
    shortDescription: "Palette-locked sprite and frame editing",
    shortLabel: "Sprite",
    path: "Sprite Editor",
    folderName: "Sprite Editor",
    entryPoint: "Sprite Editor/index.html",
    description: "Pixel-art authoring workspace for palette-locked sprite sheets, animation frames, and registry-aware sprite projects.",
    showcaseTag: "Sprites",
    showcaseStatus: "First-Class Workspace",
    active: true,
    legacy: false,
    order: 5,
    sampleEntryPoints: [
      {
        label: "README",
        path: "Sprite Editor/README.md"
      }
    ],
    visibleInToolsList: true
  },
  {
    id: "skin-editor",
    name: "Primitive Skin Editor",
    displayName: "Primitive Skin Editor",
    shortDescription: "Deprecated: use Object Vector Studio V2 for ships, enemies, pickups, actors, and reusable gameplay entities.",
    shortLabel: "Skin",
    path: "Skin Editor",
    folderName: "Skin Editor",
    entryPoint: "Skin Editor/index.html",
    description: "Deprecated: use Object Vector Studio V2 for ships, enemies, pickups, actors, and reusable gameplay entities.",
    showcaseTag: "Primitive Skins",
    showcaseStatus: "Deprecated",
    active: true,
    legacy: false,
    order: 5.5,
    sampleEntryPoints: [
      {
        label: "How To Use",
        path: "Skin Editor/how_to_use.html"
      },
      {
        label: "README",
        path: "Skin Editor/README.md"
      }
    ],
    visibleInToolsList: true
  },
  {
    id: "asset-manager-v2",
    name: "Asset Manager V2",
    displayName: "Asset Manager V2",
    shortDescription: "Asset-only manager for validated audio, color, data, font, image, localization, shader, and video entries.",
    shortLabel: "Assets",
    path: "asset-manager-v2",
    folderName: "asset-manager-v2",
    entryPoint: "asset-manager-v2/index.html",
    description: "First-Class Tool V2 surface for validating Asset Manager V2 entries from Workspace Manager V2 launch context.",
    showcaseTag: "Assets",
    showcaseStatus: "Schema Validated",
    active: true,
    legacy: false,
    order: 6.5,
    sampleEntryPoints: [
      {
        label: "README",
        path: "asset-manager-v2/README.md"
      }
    ],
    visibleInToolsList: true
  },
  {
    id: "workspace-manager-v2",
    name: "Workspace Manager V2",
    displayName: "Workspace Manager V2",
    shortDescription: "Owns active game, palette, asset registry, and Asset Manager V2 launch context.",
    shortLabel: "Workspace",
    path: "workspace-manager-v2",
    folderName: "workspace-manager-v2",
    entryPoint: "workspace-manager-v2/index.html",
    description: "First-Class Tool V2 workspace surface for games-only context selection and Asset Manager V2 session launch.",
    showcaseTag: "Workspace",
    showcaseStatus: "Context Bootstrap",
    active: true,
    legacy: false,
    order: 6.75,
    sampleEntryPoints: [
      {
        label: "README",
        path: "workspace-manager-v2/README.md"
      }
    ],
    visibleInToolsList: true
  },
  {
    id: "palette-manager-v2",
    name: "Palette Manager V2",
    displayName: "Palette Manager V2",
    shortLabel: "Palette",
    path: "palette-manager-v2",
    folderName: "palette-manager-v2",
    entryPoint: "palette-manager-v2/index.html",
    description: "Global Palette Manager V2 surface for user swatches and browse-only source palette pinning.",
    showcaseTag: "Palettes",
    showcaseStatus: "Global Palette Ready",
    active: true,
    legacy: false,
    order: 7,
    sampleEntryPoints: [
      {
        label: "README",
        path: "palette-manager-v2/README.md"
      }
    ],
    visibleInToolsList: true
  },
  {
    id: "preview-generator-v2",
    name: "Preview Generator V2",
    displayName: "Preview Generator V2",
    shortDescription: "Generate preview.svg assets for samples, games, and tools.",
    shortLabel: "Preview",
    path: "preview-generator-v2",
    folderName: "preview-generator-v2",
    entryPoint: "preview-generator-v2/index.html",
    description: "Cold-copied preview.svg generator for samples, games, and tools.",
    showcaseTag: "Preview",
    showcaseStatus: "Cold Copy",
    active: true,
    legacy: false,
    order: 7.5,
    sampleEntryPoints: [],
    visibleInToolsList: true
  },
  {
    id: "text2speech-V2",
    name: "Text to Speech V2",
    displayName: "Text to Speech V2",
    shortDescription: "Preview browser text-to-speech lines for narration, prompts, and menu feedback.",
    shortLabel: "Speech",
    path: "text2speech-V2",
    folderName: "text2speech-V2",
    entryPoint: "text2speech-V2/index.html",
    description: "First-Class Tool V2 for browser speech synthesis using shared engine audio text-to-speech defaults.",
    showcaseTag: "Audio",
    showcaseStatus: "Speech Baseline",
    active: true,
    legacy: false,
    order: 7.6,
    sampleEntryPoints: [
      {
        label: "README",
        path: "text2speech-V2/README.md"
      }
    ],
    visibleInToolsList: true
  },
  {
    id: "collision-inspector-v2",
    name: "Collision Inspector V2",
    displayName: "Collision Inspector V2",
    shortDescription: "Manifest-driven collision visualization for vector, sprite, bounds, pixel, and hybrid checks.",
    shortLabel: "Collision",
    path: "collision-inspector-v2",
    folderName: "collision-inspector-v2",
    entryPoint: "collision-inspector-v2/index.html",
    description: "Manifest-driven collision visualization for Object Vector V2 game objects with live vector, sprite, bounds, pixel, and hybrid checks.",
    showcaseTag: "Debug",
    showcaseStatus: "Manifest Driven",
    active: true,
    legacy: false,
    order: 7.7,
    sampleEntryPoints: [
      {
        label: "README",
        path: "collision-inspector-v2/README.md"
      }
    ],
    visibleInToolsList: true
  },
  {
    id: "storage-inspector-v2",
    name: "Storage Inspector V2",
    displayName: "Storage Inspector V2",
    shortDescription: "Current-origin browser storage inspection with explicit cleanup controls.",
    shortLabel: "Storage",
    path: "storage-inspector-v2",
    folderName: "storage-inspector-v2",
    entryPoint: "storage-inspector-v2/index.html",
    description: "First-class V2 tool for inspecting and explicitly clearing current-origin sessionStorage and localStorage values without cross-tool handoff writes.",
    showcaseTag: "Debug",
    showcaseStatus: "Storage Cleanup",
    readOnly: false,
    active: true,
    legacy: false,
    order: 7.75,
    sampleEntryPoints: [
      {
        label: "README",
        path: "storage-inspector-v2/README.md"
      }
    ],
    visibleInToolsList: true
  },
  {
    id: "state-inspector",
    name: "State Inspector",
    displayName: "State Inspector",
    shortDescription: "Host/runtime state snapshot inspection",
    shortLabel: "Inspect",
    path: "State Inspector",
    folderName: "State Inspector",
    entryPoint: "State Inspector/index.html",
    description: "Read-only state visibility tool for host context, storage snapshots, and structured runtime payload inspection.",
    showcaseTag: "Debug",
    showcaseStatus: "Inspector Baseline",
    active: true,
    legacy: false,
    order: 8,
    sampleEntryPoints: [],
    visibleInToolsList: true
  },
  {
    id: "replay-visualizer",
    name: "Replay Visualizer",
    displayName: "Replay Visualizer",
    shortLabel: "Replay",
    path: "Replay Visualizer",
    folderName: "Replay Visualizer",
    entryPoint: "Replay Visualizer/index.html",
    description: "Event replay timeline viewer for stepping, autoplay, and frame inspection of runtime event streams.",
    showcaseTag: "Debug",
    showcaseStatus: "Replay Baseline",
    active: true,
    legacy: false,
    order: 9,
    sampleEntryPoints: [],
    visibleInToolsList: true
  },
  {
    id: "performance-profiler",
    name: "Performance Profiler",
    displayName: "Performance Profiler",
    shortLabel: "Perf",
    path: "Performance Profiler",
    folderName: "Performance Profiler",
    entryPoint: "Performance Profiler/index.html",
    description: "Baseline performance profiler for frame cadence and deterministic workload timing summaries.",
    showcaseTag: "Debug",
    showcaseStatus: "Profiler Baseline",
    active: true,
    legacy: false,
    order: 10,
    sampleEntryPoints: [],
    visibleInToolsList: true
  },
  {
    id: "physics-sandbox",
    name: "Physics Sandbox",
    displayName: "Physics Sandbox",
    shortLabel: "Physics",
    path: "Physics Sandbox",
    folderName: "Physics Sandbox",
    entryPoint: "Physics Sandbox/index.html",
    description: "Minimal reusable physics helper sandbox for acceleration, drag, and integration previews.",
    showcaseTag: "Debug",
    showcaseStatus: "Physics Baseline",
    active: true,
    legacy: false,
    order: 11,
    sampleEntryPoints: [],
    visibleInToolsList: true
  },
  {
    id: "asset-pipeline",
    name: "Asset Pipeline",
    displayName: "Asset Pipeline",
    shortLabel: "Pipeline",
    path: "Asset Pipeline",
    folderName: "Asset Pipeline",
    entryPoint: "Asset Pipeline/index.html",
    description: "Launchable shared pipeline surface for load, validate, normalize, and emit contract checks.",
    showcaseTag: "Pipeline",
    showcaseStatus: "Pipeline Baseline",
    active: true,
    legacy: false,
    order: 12,
    sampleEntryPoints: [],
    visibleInToolsList: true
  },
  {
    id: "3d-json-payload",
    name: "3D JSON Payload",
    displayName: "3D JSON Payload",
    shortLabel: "3D JSON",
    path: "3D JSON Payload",
    folderName: "3D JSON Payload",
    entryPoint: "3D JSON Payload/index.html",
    description: "3D payload normalization utility for point/segment JSON documents with deterministic sanitized output.",
    showcaseTag: "3D",
    showcaseStatus: "3D Baseline",
    active: true,
    legacy: false,
    order: 14,
    sampleEntryPoints: [],
    visibleInToolsList: true
  },
  {
    id: "3d-asset-viewer",
    name: "3D Asset Viewer",
    displayName: "3D Asset Viewer",
    shortLabel: "3D View",
    path: "3D Asset Viewer",
    folderName: "3D Asset Viewer",
    entryPoint: "3D Asset Viewer/index.html",
    description: "Baseline 3D asset metadata viewer for vertices, bounds, and normalized runtime payload inspection.",
    showcaseTag: "3D",
    showcaseStatus: "3D Baseline",
    readOnly: true,
    active: true,
    legacy: false,
    order: 15,
    sampleEntryPoints: [],
    visibleInToolsList: true
  },
  {
    id: "3d-camera-path-editor",
    name: "3D Camera Path Editor",
    displayName: "3D Camera Path Editor",
    shortLabel: "3D Cam",
    path: "3D Camera Path Editor",
    folderName: "3D Camera Path Editor",
    entryPoint: "3D Camera Path Editor/index.html",
    description: "Baseline 3D camera path editor for waypoint timeline authoring and deterministic JSON export.",
    showcaseTag: "3D",
    showcaseStatus: "3D Baseline",
    active: true,
    legacy: false,
    order: 16,
    sampleEntryPoints: [],
    visibleInToolsList: true
  },
  {
    id: "sprite-editor-old-keep",
    name: "SpriteEditor_old_keep",
    displayName: "SpriteEditor_old_keep",
    shortLabel: "Legacy",
    path: "SpriteEditor_old_keep",
    folderName: "SpriteEditor_old_keep",
    entryPoint: "SpriteEditor_old_keep/index.html",
    description: "Preserved historical sprite editor kept on disk for legacy reference only.",
    active: false,
    legacy: true,
    order: 999,
    visibleInToolsList: false
  }
]);

export { TOOL_NAME_SUFFIX_PATTERN };

export function resolveToolIdAlias(toolId) {
  const normalizedToolId = typeof toolId === "string" ? toolId.trim() : "";
  return normalizedToolId;
}

export function getToolRegistry() {
  return TOOL_REGISTRY.map((tool) => ({
    ...tool,
    sampleEntryPoints: Array.isArray(tool.sampleEntryPoints) ? tool.sampleEntryPoints.map((entry) => ({ ...entry })) : []
  }));
}

export function getToolById(toolId) {
  const resolvedToolId = resolveToolIdAlias(toolId);
  return getToolRegistry().find((tool) => tool.id === resolvedToolId) ?? null;
}

export function getActiveToolRegistry() {
  return getToolRegistry()
    .filter((tool) => tool.active === true)
    .sort((left, right) => (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER));
}

export function getVisibleActiveToolRegistry() {
  return getActiveToolRegistry().filter((tool) => tool.visibleInToolsList === true);
}
