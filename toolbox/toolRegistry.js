const TOOL_NAME_SUFFIX_PATTERN = /(?:^|[\s_-])(v2|v3|new|final|copy)(?:$|[\s_-])/i;

export const TOOL_REGISTRY = Object.freeze([
  {
    id: "world-vector-studio-v2",
    name: "World Vector Studio V2",
    displayName: "World Vector Studio V2",
    shortDescription: "Place assets, maps, layers, parallax, and scene/world layout.",
    shortLabel: "World",
    path: "../archive/v1-v2/tools/old_world-vector-studio-v2",
    folderName: "old_world-vector-studio-v2",
    entryPoint: "../archive/v1-v2/tools/old_world-vector-studio-v2/index.html",
    description: "Place assets, maps, layers, parallax, and scene/world layout for terrain, environments, camera/spawn zones, and world composition.",
    showcaseTag: "World Vectors",
    showcaseStatus: "Template Copied",
    active: false,
    legacy: true,
    order: 1.25,
    sampleEntryPoints: [
      {
        label: "README",
        path: "../archive/v1-v2/tools/old_world-vector-studio-v2/README.md"
      }
    ],
    visibleInToolsList: false
  },
  {
    id: "object-vector-studio-v2",
    name: "Object Vector Studio V2",
    displayName: "Object Vector Studio V2",
    shortDescription: "Build vector assets for ships, enemies, pickups, actors, UI elements, and reusable game objects.",
    shortLabel: "Object",
    path: "../archive/v1-v2/tools/old_object-vector-studio-v2",
    folderName: "old_object-vector-studio-v2",
    entryPoint: "../archive/v1-v2/tools/old_object-vector-studio-v2/index.html",
    description: "Build vector assets for ships, enemies, pickups, actors, UI elements, and reusable game objects.",
    showcaseTag: "Object Vectors",
    showcaseStatus: "Template Copied",
    active: false,
    legacy: true,
    order: 1.5,
    sampleEntryPoints: [
      {
        label: "README",
        path: "../archive/v1-v2/tools/old_object-vector-studio-v2/README.md"
      }
    ],
    visibleInToolsList: false
  },
  {
    id: "tile-map-editor",
    name: "Tilemap Studio",
    displayName: "Tilemap Studio",
    shortLabel: "Tile",
    path: "../archive/v1-v2/tools/old_Tilemap Studio",
    folderName: "old_Tilemap Studio",
    entryPoint: "../archive/v1-v2/tools/old_Tilemap Studio/index.html",
    description: "Tile map layout studio for layered map authoring, sample playback, simulation, and packaging flows.",
    showcaseTag: "Tile Maps",
    showcaseStatus: "Sample Loading Ready",
    active: false,
    legacy: true,
    order: 3,
    sampleEntryPoints: [
      {
        label: "How To Use",
        path: "../archive/v1-v2/tools/old_Tilemap Studio/how_to_use.html"
      },
      {
        label: "Sample 1208 - Tool Formatted Tiles Parallax",
        path: "../archive/v1-v2/samples/phase-12/1208/index.html"
      },
      {
        label: "Sample 1209 - Tilemap Basic Layout Preset",
        path: "../archive/v1-v2/samples/phase-12/1209/index.html"
      },
      {
        label: "Sample 1210 - Tilemap Objective Layout Preset",
        path: "../archive/v1-v2/samples/phase-12/1210/index.html"
      },
      {
        label: "Sample 1211 - Tilemap Mario Learning Layout Preset",
        path: "../archive/v1-v2/samples/phase-12/1211/index.html"
      }
    ],
    visibleInToolsList: false
  },
  {
    id: "parallax-editor",
    name: "Parallax Scene Studio",
    displayName: "Parallax Scene Studio",
    shortDescription: "Layered Scene & Depth Composition",
    shortLabel: "Parallax",
    path: "../archive/v1-v2/tools/old_Parallax Scene Studio",
    folderName: "old_Parallax Scene Studio",
    entryPoint: "../archive/v1-v2/tools/old_Parallax Scene Studio/index.html",
    description: "Parallax Scene Studio: compose layered backgrounds, midgrounds, and foreground scene depth.",
    showcaseTag: "Parallax",
    showcaseStatus: "Scene Preview Ready",
    active: false,
    legacy: true,
    order: 4,
    sampleEntryPoints: [
      {
        label: "Sample Manifest",
        path: "../archive/v1-v2/tools/old_Parallax Scene Studio/samples/sample-manifest.json"
      },
      {
        label: "Sample 1208 - Tool Formatted Tiles Parallax",
        path: "../archive/v1-v2/samples/phase-12/1208/index.html"
      }
    ],
    visibleInToolsList: false
  },
  {
    id: "sprite-editor",
    name: "Sprite Editor",
    displayName: "Sprite Editor",
    shortDescription: "Palette-locked sprite and frame editing",
    shortLabel: "Sprite",
    path: "../archive/v1-v2/tools/old_Sprite Editor",
    folderName: "old_Sprite Editor",
    entryPoint: "../archive/v1-v2/tools/old_Sprite Editor/index.html",
    description: "Pixel-art authoring workspace for palette-locked sprite sheets, animation frames, and registry-aware sprite projects.",
    showcaseTag: "Sprites",
    showcaseStatus: "First-Class Workspace",
    active: false,
    legacy: true,
    order: 5,
    sampleEntryPoints: [
      {
        label: "README",
        path: "../archive/v1-v2/tools/old_Sprite Editor/README.md"
      }
    ],
    visibleInToolsList: false
  },
  {
    id: "asset-manager-v2",
    name: "Asset Manager V2",
    displayName: "Asset Manager V2",
    shortDescription: "Asset-only manager for validated audio, color, data, font, image, localization, shader, and video entries.",
    shortLabel: "Assets",
    path: "../archive/v1-v2/tools/old_asset-manager-v2",
    folderName: "old_asset-manager-v2",
    entryPoint: "../archive/v1-v2/tools/old_asset-manager-v2/index.html",
    description: "First-Class Tool V2 surface for validating Asset Manager V2 entries from Workspace Manager V2 launch context.",
    showcaseTag: "Assets",
    showcaseStatus: "Schema Validated",
    active: false,
    legacy: true,
    order: 6.5,
    sampleEntryPoints: [
      {
        label: "README",
        path: "../archive/v1-v2/tools/old_asset-manager-v2/README.md"
      }
    ],
    visibleInToolsList: false
  },
  {
    id: "workspace-manager-v2",
    name: "Workspace Manager V2",
    displayName: "Workspace Manager V2",
    shortDescription: "Owns active game, palette, asset registry, and Asset Manager V2 launch context.",
    shortLabel: "Workspace",
    path: "../archive/v1-v2/tools/old_workspace-manager-v2",
    folderName: "old_workspace-manager-v2",
    entryPoint: "../archive/v1-v2/tools/old_workspace-manager-v2/index.html",
    description: "First-Class Tool V2 workspace surface for games-only context selection and Asset Manager V2 session launch.",
    showcaseTag: "Workspace",
    showcaseStatus: "Context Bootstrap",
    active: false,
    legacy: true,
    order: 6.75,
    sampleEntryPoints: [
      {
        label: "README",
        path: "../archive/v1-v2/tools/old_workspace-manager-v2/README.md"
      }
    ],
    visibleInToolsList: false
  },
  {
    id: "palette-manager-v2",
    name: "Palette Manager V2",
    displayName: "Palette Manager V2",
    shortLabel: "Palette",
    path: "../archive/v1-v2/tools/old_palette-manager-v2",
    folderName: "old_palette-manager-v2",
    entryPoint: "../archive/v1-v2/tools/old_palette-manager-v2/index.html",
    description: "Global Palette Manager V2 surface for user swatches and browse-only source palette pinning.",
    showcaseTag: "Palettes",
    showcaseStatus: "Global Palette Ready",
    active: false,
    legacy: true,
    order: 7,
    sampleEntryPoints: [
      {
        label: "README",
        path: "../archive/v1-v2/tools/old_palette-manager-v2/README.md"
      }
    ],
    visibleInToolsList: false
  },
  {
    id: "preview-generator-v2",
    name: "Preview Generator V2",
    displayName: "Preview Generator V2",
    shortDescription: "Generate preview.svg assets for samples, games, and tools.",
    shortLabel: "Preview",
    path: "../archive/v1-v2/tools/old_preview-generator-v2",
    folderName: "old_preview-generator-v2",
    entryPoint: "../archive/v1-v2/tools/old_preview-generator-v2/index.html",
    description: "Cold-copied preview.svg generator for samples, games, and tools.",
    showcaseTag: "Preview",
    showcaseStatus: "Cold Copy",
    active: false,
    legacy: true,
    order: 7.5,
    sampleEntryPoints: [],
    visibleInToolsList: false
  },
  {
    id: "text2speech-V2",
    name: "Text to Speech V2",
    displayName: "Text to Speech V2",
    shortDescription: "Preview browser text-to-speech lines for narration, prompts, and menu feedback.",
    shortLabel: "Speech",
    path: "../archive/v1-v2/tools/old_text2speech-V2",
    folderName: "old_text2speech-V2",
    entryPoint: "../archive/v1-v2/tools/old_text2speech-V2/index.html",
    description: "First-Class Tool V2 for browser speech synthesis using shared engine audio text-to-speech defaults.",
    showcaseTag: "Audio",
    showcaseStatus: "Speech Baseline",
    active: false,
    legacy: true,
    order: 7.6,
    sampleEntryPoints: [
      {
        label: "README",
        path: "../archive/v1-v2/tools/old_text2speech-V2/README.md"
      }
    ],
    visibleInToolsList: false
  },
  {
    id: "audio-sfx-playground-v2",
    name: "Audio / SFX Playground V2",
    displayName: "Audio / SFX Playground V2",
    shortDescription: "Tune and audition browser-generated game SFX payloads.",
    shortLabel: "SFX",
    path: "../archive/v1-v2/tools/old_audio-sfx-playground-v2",
    folderName: "old_audio-sfx-playground-v2",
    entryPoint: "../archive/v1-v2/tools/old_audio-sfx-playground-v2/index.html",
    description: "First-Class Tool V2 for shaping oscillator and noise-based game sound effects with toolState export.",
    showcaseTag: "Audio",
    showcaseStatus: "SFX Playground",
    active: false,
    legacy: true,
    order: 7.65,
    sampleEntryPoints: [
      {
        label: "README",
        path: "../archive/v1-v2/tools/old_audio-sfx-playground-v2/README.md"
      }
    ],
    visibleInToolsList: false
  },
  {
    id: "midi-studio-v2",
    name: "MIDI Studio V2",
    displayName: "MIDI Studio V2",
    shortDescription: "Inspect manifest-owned MIDI songs, rendered targets, and Game Music Director metadata.",
    shortLabel: "MIDI",
    path: "../archive/v1-v2/tools/old_midi-studio-v2",
    folderName: "old_midi-studio-v2",
    entryPoint: "../archive/v1-v2/tools/old_midi-studio-v2/index.html",
    description: "First-Class Tool V2 for multi-song MIDI metadata, source preview, rendered WAV/MP3/OGG targets, and non-composer music direction.",
    showcaseTag: "Audio",
    showcaseStatus: "MIDI Baseline",
    active: false,
    legacy: true,
    order: 7.66,
    sampleEntryPoints: [
      {
        label: "README",
        path: "../archive/v1-v2/tools/old_midi-studio-v2/README.md"
      }
    ],
    visibleInToolsList: false
  },
  {
    id: "collision-inspector-v2",
    name: "Collision Inspector V2",
    displayName: "Collision Inspector V2",
    shortDescription: "Engine-aligned collision visualization for bounds, vector, pixel/sprite, and hybrid checks.",
    shortLabel: "Collision",
    path: "../archive/v1-v2/tools/old_collision-inspector-v2",
    folderName: "old_collision-inspector-v2",
    entryPoint: "../archive/v1-v2/tools/old_collision-inspector-v2/index.html",
    description: "Engine-aligned collision visualization for Object Vector V2 game objects with live bounds, vector, pixel/sprite, and hybrid checks.",
    showcaseTag: "Debug",
    showcaseStatus: "Manifest Driven",
    active: false,
    legacy: true,
    order: 7.7,
    sampleEntryPoints: [
      {
        label: "README",
        path: "../archive/v1-v2/tools/old_collision-inspector-v2/README.md"
      }
    ],
    visibleInToolsList: false
  },
  {
    id: "storage-inspector-v2",
    name: "Storage Inspector V2",
    displayName: "Storage Inspector V2",
    shortDescription: "Current-origin browser storage inspection with explicit cleanup controls.",
    shortLabel: "Storage",
    path: "../archive/v1-v2/tools/old_storage-inspector-v2",
    folderName: "old_storage-inspector-v2",
    entryPoint: "../archive/v1-v2/tools/old_storage-inspector-v2/index.html",
    description: "First-class V2 tool for inspecting and explicitly clearing current-origin sessionStorage and localStorage values without cross-tool handoff writes.",
    showcaseTag: "Debug",
    showcaseStatus: "Storage Cleanup",
    readOnly: false,
    active: false,
    legacy: true,
    order: 7.75,
    sampleEntryPoints: [
      {
        label: "README",
        path: "../archive/v1-v2/tools/old_storage-inspector-v2/README.md"
      }
    ],
    visibleInToolsList: false
  },
  {
    id: "input-mapping-v2",
    name: "Input Mapping V2",
    displayName: "Input Mapping V2",
    shortDescription: "Keyboard and gamepad mapping diagnostics for games, tools, and samples.",
    shortLabel: "Input",
    path: "../archive/v1-v2/tools/old_input-mapping-v2",
    folderName: "old_input-mapping-v2",
    entryPoint: "../archive/v1-v2/tools/old_input-mapping-v2/index.html",
    description: "Generic V2 tool for mapping keyboard and gamepad inputs across games, tools, and samples.",
    showcaseTag: "Input",
    showcaseStatus: "Mapping Ready",
    readOnly: false,
    active: false,
    legacy: true,
    order: 7.8,
    sampleEntryPoints: [
      {
        label: "README",
        path: "../archive/v1-v2/tools/old_input-mapping-v2/README.md"
      }
    ],
    visibleInToolsList: false
  },
  {
    id: "state-inspector",
    name: "State Inspector",
    displayName: "State Inspector",
    shortDescription: "Host/runtime state snapshot inspection",
    shortLabel: "Inspect",
    path: "../archive/v1-v2/tools/old_State Inspector",
    folderName: "old_State Inspector",
    entryPoint: "../archive/v1-v2/tools/old_State Inspector/index.html",
    description: "Read-only state visibility tool for host context, storage snapshots, and structured runtime payload inspection.",
    showcaseTag: "Debug",
    showcaseStatus: "Inspector Baseline",
    active: false,
    legacy: true,
    order: 8,
    sampleEntryPoints: [],
    visibleInToolsList: false
  },
  {
    id: "replay-visualizer",
    name: "Replay Visualizer",
    displayName: "Replay Visualizer",
    shortLabel: "Replay",
    path: "../archive/v1-v2/tools/old_Replay Visualizer",
    folderName: "old_Replay Visualizer",
    entryPoint: "../archive/v1-v2/tools/old_Replay Visualizer/index.html",
    description: "Event replay timeline viewer for stepping, autoplay, and frame inspection of runtime event streams.",
    showcaseTag: "Debug",
    showcaseStatus: "Replay Baseline",
    active: false,
    legacy: true,
    order: 9,
    sampleEntryPoints: [],
    visibleInToolsList: false
  },
  {
    id: "performance-profiler",
    name: "Performance Profiler",
    displayName: "Performance Profiler",
    shortLabel: "Perf",
    path: "../archive/v1-v2/tools/old_Performance Profiler",
    folderName: "old_Performance Profiler",
    entryPoint: "../archive/v1-v2/tools/old_Performance Profiler/index.html",
    description: "Baseline performance profiler for frame cadence and deterministic workload timing summaries.",
    showcaseTag: "Debug",
    showcaseStatus: "Profiler Baseline",
    active: false,
    legacy: true,
    order: 10,
    sampleEntryPoints: [],
    visibleInToolsList: false
  },
  {
    id: "physics-sandbox",
    name: "Physics Sandbox",
    displayName: "Physics Sandbox",
    shortLabel: "Physics",
    path: "../archive/v1-v2/tools/old_Physics Sandbox",
    folderName: "old_Physics Sandbox",
    entryPoint: "../archive/v1-v2/tools/old_Physics Sandbox/index.html",
    description: "Minimal reusable physics helper sandbox for acceleration, drag, and integration previews.",
    showcaseTag: "Debug",
    showcaseStatus: "Physics Baseline",
    active: false,
    legacy: true,
    order: 11,
    sampleEntryPoints: [],
    visibleInToolsList: false
  },
  {
    id: "asset-pipeline",
    name: "Asset Pipeline",
    displayName: "Asset Pipeline",
    shortLabel: "Pipeline",
    path: "../archive/v1-v2/tools/old_Asset Pipeline",
    folderName: "old_Asset Pipeline",
    entryPoint: "../archive/v1-v2/tools/old_Asset Pipeline/index.html",
    description: "Launchable shared pipeline surface for load, validate, normalize, and emit contract checks.",
    showcaseTag: "Pipeline",
    showcaseStatus: "Pipeline Baseline",
    active: false,
    legacy: true,
    order: 12,
    sampleEntryPoints: [],
    visibleInToolsList: false
  },
  {
    id: "3d-json-payload",
    name: "3D JSON Payload",
    displayName: "3D JSON Payload",
    shortLabel: "3D JSON",
    path: "../archive/v1-v2/tools/old_3D JSON Payload",
    folderName: "old_3D JSON Payload",
    entryPoint: "../archive/v1-v2/tools/old_3D JSON Payload/index.html",
    description: "3D payload normalization utility for point/segment JSON documents with deterministic sanitized output.",
    showcaseTag: "3D",
    showcaseStatus: "3D Baseline",
    active: false,
    legacy: true,
    order: 14,
    sampleEntryPoints: [],
    visibleInToolsList: false
  },
  {
    id: "3d-asset-viewer",
    name: "3D Asset Viewer",
    displayName: "3D Asset Viewer",
    shortLabel: "3D View",
    path: "../archive/v1-v2/tools/old_3D Asset Viewer",
    folderName: "old_3D Asset Viewer",
    entryPoint: "../archive/v1-v2/tools/old_3D Asset Viewer/index.html",
    description: "Baseline 3D asset metadata viewer for vertices, bounds, and normalized runtime payload inspection.",
    showcaseTag: "3D",
    showcaseStatus: "3D Baseline",
    readOnly: true,
    active: false,
    legacy: true,
    order: 15,
    sampleEntryPoints: [],
    visibleInToolsList: false
  },
  {
    id: "3d-camera-path-editor",
    name: "3D Camera Path Editor",
    displayName: "3D Camera Path Editor",
    shortLabel: "3D Cam",
    path: "../archive/v1-v2/tools/old_3D Camera Path Editor",
    folderName: "old_3D Camera Path Editor",
    entryPoint: "../archive/v1-v2/tools/old_3D Camera Path Editor/index.html",
    description: "Baseline 3D camera path editor for waypoint timeline authoring and deterministic JSON export.",
    showcaseTag: "3D",
    showcaseStatus: "3D Baseline",
    active: false,
    legacy: true,
    order: 16,
    sampleEntryPoints: [],
    visibleInToolsList: false
  },
  {
    id: "sprite-editor-old-keep",
    name: "SpriteEditor_old_keep",
    displayName: "SpriteEditor_old_keep",
    shortLabel: "Legacy",
    path: "../archive/v1-v2/docs_build/archive/tools/SpriteEditor_old_keep",
    folderName: "SpriteEditor_old_keep",
    entryPoint: "../archive/v1-v2/docs_build/archive/tools/SpriteEditor_old_keep/index.html",
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
