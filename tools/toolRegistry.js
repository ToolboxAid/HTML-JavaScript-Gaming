const TOOL_NAME_SUFFIX_PATTERN = /(?:^|[\s_-])(v2|v3|new|final|copy)(?:$|[\s_-])/i;

export const TOOL_REGISTRY = Object.freeze([
  {
    id: "vector-map-editor",
    name: "Vector Map Editor",
    displayName: "Vector Map Editor",
    shortLabel: "Map",
    path: "Vector Map Editor",
    folderName: "Vector Map Editor",
    entryPoint: "Vector Map Editor/index.html",
    description: "Vector geometry authoring tool for map layout, collision review, and runtime export workflows.",
    showcaseTag: "Geometry",
    showcaseStatus: "Deterministic Runtime Ready",
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
    id: "vector-asset-studio",
    name: "Vector Asset Studio",
    displayName: "Vector Asset Studio",
    shortLabel: "Asset",
    path: "Vector Asset Studio",
    folderName: "Vector Asset Studio",
    entryPoint: "Vector Asset Studio/index.html",
    description: "Vector authoring studio for SVG-first asset work and first-class vector output for the platform.",
    showcaseTag: "Vector Assets",
    showcaseStatus: "SVG Contract Ready",
    active: true,
    legacy: false,
    order: 2,
    sampleEntryPoints: [
      {
        label: "Sample Manifest",
        path: "Vector Asset Studio/samples/sample-manifest.json"
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
        label: "Sample Manifest",
        path: "Tilemap Studio/samples/sample-manifest.json"
      },
      {
        label: "Sample 1208 - Tool Formatted Tiles Parallax",
        path: "../samples/phase-12/1208/index.html"
      }
    ],
    visibleInToolsList: true
  },
  {
    id: "parallax-editor",
    name: "Parallax Scene Studio",
    displayName: "Parallax Scene Studio",
    shortLabel: "Parallax",
    path: "Parallax Scene Studio",
    folderName: "Parallax Scene Studio",
    entryPoint: "Parallax Scene Studio/index.html",
    description: "Parallax composition studio for layered scene depth, sample loading, simulation, and export flows.",
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
    id: "asset-browser",
    name: "Asset Browser / Import Hub",
    displayName: "Asset Browser / Import Hub",
    shortLabel: "Import",
    path: "Asset Browser",
    folderName: "Asset Browser",
    entryPoint: "Asset Browser/index.html",
    description: "Approved asset browsing and non-destructive import planning surface for vectors, palettes, parallax, tilemaps, and sprite workflow assets.",
    showcaseTag: "Asset Workflow",
    showcaseStatus: "Import Planning Ready",
    active: true,
    legacy: false,
    order: 6,
    sampleEntryPoints: [
      {
        label: "README",
        path: "Asset Browser/README.md"
      }
    ],
    visibleInToolsList: true
  },
  {
    id: "palette-browser",
    name: "Palette Browser / Manager",
    displayName: "Palette Browser / Manager",
    shortLabel: "Palette",
    path: "Palette Browser",
    folderName: "Palette Browser",
    entryPoint: "Palette Browser/index.html",
    description: "Shared palette browsing and management surface for engine palettes and local editable palette workflows.",
    showcaseTag: "Palettes",
    showcaseStatus: "Shared Contract Ready",
    active: true,
    legacy: false,
    order: 7,
    sampleEntryPoints: [
      {
        label: "README",
        path: "Palette Browser/README.md"
      }
    ],
    visibleInToolsList: true
  },
  {
    id: "state-inspector",
    name: "State Inspector",
    displayName: "State Inspector",
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

export function getToolRegistry() {
  return TOOL_REGISTRY.map((tool) => ({
    ...tool,
    sampleEntryPoints: Array.isArray(tool.sampleEntryPoints) ? tool.sampleEntryPoints.map((entry) => ({ ...entry })) : []
  }));
}

export function getToolById(toolId) {
  return getToolRegistry().find((tool) => tool.id === toolId) ?? null;
}

export function getActiveToolRegistry() {
  return getToolRegistry()
    .filter((tool) => tool.active === true)
    .sort((left, right) => (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER));
}

export function getVisibleActiveToolRegistry() {
  return getActiveToolRegistry().filter((tool) => tool.visibleInToolsList === true);
}
