const TOOL_NAME_SUFFIX_PATTERN = /(?:^|[\s_-])(v2|v3|new|final|copy)(?:$|[\s_-])/i;

export const ACTIVE_TOOL_SURFACE_IDS = Object.freeze([
  "vector-map-editor",
  "vector-asset-studio",
  "tile-map-editor",
  "parallax-editor"
]);

export const TOOL_REGISTRY = Object.freeze([
  {
    id: "vector-map-editor",
    displayName: "Vector Map Editor",
    shortLabel: "Map",
    folderName: "Vector Map Editor",
    entryPoint: "Vector Map Editor/index.html",
    description: "Vector geometry authoring tool for map layout, collision review, and runtime export workflows.",
    showcaseTag: "Geometry",
    showcaseStatus: "Deterministic Runtime Ready",
    sampleEntryPoints: [
      {
        label: "How To Use",
        path: "Vector Map Editor/how_to_use.html"
      }
    ],
    status: "active",
    visibleInToolsList: true
  },
  {
    id: "vector-asset-studio",
    displayName: "Vector Asset Studio",
    shortLabel: "Asset",
    folderName: "Vector Asset Studio",
    entryPoint: "Vector Asset Studio/index.html",
    description: "Vector authoring studio for SVG-first asset work and first-class vector output for the platform.",
    showcaseTag: "Vector Assets",
    showcaseStatus: "SVG Contract Ready",
    sampleEntryPoints: [
      {
        label: "Sample Manifest",
        path: "Vector Asset Studio/samples/sample-manifest.json"
      }
    ],
    status: "active",
    visibleInToolsList: true
  },
  {
    id: "tile-map-editor",
    displayName: "Tile Map Editor",
    shortLabel: "Tile",
    folderName: "Tilemap Studio",
    entryPoint: "Tilemap Studio/index.html",
    description: "Tile map layout studio for layered map authoring, sample playback, simulation, and packaging flows.",
    showcaseTag: "Tile Maps",
    showcaseStatus: "Sample Loading Ready",
    sampleEntryPoints: [
      {
        label: "Sample Manifest",
        path: "Tilemap Studio/samples/sample-manifest.json"
      }
    ],
    status: "active",
    visibleInToolsList: true
  },
  {
    id: "parallax-editor",
    displayName: "Parallax Editor",
    shortLabel: "Parallax",
    folderName: "Parallax Scene Studio",
    entryPoint: "Parallax Scene Studio/index.html",
    description: "Parallax composition studio for layered scene depth, sample loading, simulation, and export flows.",
    showcaseTag: "Parallax",
    showcaseStatus: "Scene Preview Ready",
    sampleEntryPoints: [
      {
        label: "Sample Manifest",
        path: "Parallax Scene Studio/samples/sample-manifest.json"
      }
    ],
    status: "active",
    visibleInToolsList: true
  },
  {
    id: "sprite-editor",
    displayName: "Sprite Editor",
    shortLabel: "Sprite",
    folderName: "Sprite Editor",
    entryPoint: "Sprite Editor/index.html",
    description: "Preserved sprite workspace that remains available on disk but is intentionally excluded from the first-class active tool surface.",
    status: "preserved",
    visibleInToolsList: false
  },
  {
    id: "sprite-editor-legacy",
    displayName: "Sprite Editor Legacy",
    shortLabel: "Legacy",
    folderName: "SpriteEditor_old_keep",
    entryPoint: "SpriteEditor_old_keep/index.html",
    description: "Preserved historical sprite editor kept on disk for legacy reference only.",
    status: "legacy",
    visibleInToolsList: false
  }
]);

export { TOOL_NAME_SUFFIX_PATTERN };

export function getToolRegistry() {
  return TOOL_REGISTRY.map((tool) => ({ ...tool }));
}

export function getToolById(toolId) {
  return getToolRegistry().find((tool) => tool.id === toolId) ?? null;
}

export function getActiveToolRegistry() {
  return ACTIVE_TOOL_SURFACE_IDS.map((toolId) => getToolById(toolId)).filter(Boolean);
}

export function getVisibleActiveToolRegistry() {
  return getActiveToolRegistry().filter((tool) => tool.visibleInToolsList === true);
}
