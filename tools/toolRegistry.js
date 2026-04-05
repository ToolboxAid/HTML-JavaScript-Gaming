const TOOL_NAME_SUFFIX_PATTERN = /(?:^|[\s_-])(v2|v3|new|final|copy)(?:$|[\s_-])/i;

export const TOOL_REGISTRY = Object.freeze([
  {
    id: "vector-map-editor",
    displayName: "Vector Map Editor",
    folderName: "Vector Map Editor",
    entryPoint: "Vector Map Editor/index.html",
    description: "Vector geometry authoring tool for map layout, collision review, and runtime export workflows.",
    status: "active",
    visibleInToolsList: true
  },
  {
    id: "vector-asset-studio",
    displayName: "Vector Asset Studio",
    folderName: "Vector Asset Studio",
    entryPoint: "Vector Asset Studio/index.html",
    description: "Vector authoring studio for SVG-first asset work and first-class vector output for the platform.",
    status: "active",
    visibleInToolsList: true
  },
  {
    id: "tile-map-editor",
    displayName: "Tile Map Editor",
    folderName: "Tilemap Studio",
    entryPoint: "Tilemap Studio/index.html",
    description: "Tile map layout studio for layered map authoring, sample playback, simulation, and packaging flows.",
    status: "active",
    visibleInToolsList: true
  },
  {
    id: "parallax-editor",
    displayName: "Parallax Editor",
    folderName: "Parallax Scene Studio",
    entryPoint: "Parallax Scene Studio/index.html",
    description: "Parallax composition studio for layered scene depth, sample loading, simulation, and export flows.",
    status: "active",
    visibleInToolsList: true
  },
  {
    id: "sprite-editor",
    displayName: "Sprite Editor",
    folderName: "Sprite Editor",
    entryPoint: "Sprite Editor/index.html",
    description: "Pixel-art authoring editor for palette-locked sprites, frames, and registry-aware project work.",
    status: "active",
    visibleInToolsList: true
  },
  {
    id: "sprite-editor-legacy",
    displayName: "Sprite Editor Legacy",
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

export function getActiveToolRegistry() {
  return getToolRegistry().filter((tool) => tool.status === "active");
}

export function getVisibleActiveToolRegistry() {
  return getActiveToolRegistry().filter((tool) => tool.visibleInToolsList === true);
}
