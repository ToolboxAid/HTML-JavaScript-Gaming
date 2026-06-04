const TOOL_NAME_SUFFIX_PATTERN = /(?:^|[\s_-])(v2|v3|new|final|copy)(?:$|[\s_-])/i;

export const TOOL_REGISTRY = Object.freeze([
  {
    id: "ai-assistant",
    name: "AI Assistant",
    displayName: "AI Assistant",
    shortDescription: "Get AI help with code, assets, logic and design.",
    shortLabel: "AI",
    path: "ai-assistant",
    folderName: "ai-assistant",
    entryPoint: "ai-assistant/index.html",
    description: "Get AI help with code, assets, logic and design.",
    active: true,
    order: 1,
    visibleInToolsList: true
  },
  {
    id: "animation-studio",
    name: "Animation",
    displayName: "Animation",
    shortDescription: "Animate characters and bring games to life.",
    shortLabel: "Animation",
    path: "animation",
    folderName: "animation",
    entryPoint: "animation/index.html",
    description: "Animate characters and bring games to life.",
    active: true,
    order: 2,
    visibleInToolsList: true
  },
  {
    id: "asset-studio",
    name: "Assets",
    displayName: "Assets",
    shortDescription: "Create sprites, animations, vectors and palettes.",
    shortLabel: "Assets",
    path: "assets",
    folderName: "assets",
    entryPoint: "assets/index.html",
    description: "Create sprites, animations, vectors and palettes.",
    active: true,
    order: 3,
    visibleInToolsList: true
  },
  {
    id: "cloud-studio",
    name: "Cloud",
    displayName: "Cloud",
    shortDescription: "Plan connected storage, sync, versioning, and publishing support for Toolbox workflows.",
    shortLabel: "Cloud",
    path: "cloud",
    folderName: "cloud",
    entryPoint: "cloud/index.html",
    description: "Plan connected storage, sync, versioning, and publishing support for Toolbox workflows.",
    active: true,
    order: 4,
    visibleInToolsList: true
  },
  {
    id: "code-studio",
    name: "Custom Extensions",
    displayName: "Custom Extensions",
    shortDescription: "Register approved Engine V2 extension hooks and creator-private custom logic.",
    shortLabel: "Code",
    path: "code",
    folderName: "code",
    entryPoint: "code/index.html",
    description: "Register approved Engine V2 extension hooks and creator-private custom logic.",
    active: true,
    order: 5,
    visibleInToolsList: true
  },
  {
    id: "game-design-studio",
    name: "Game Design",
    displayName: "Game Design",
    shortDescription: "Plan gameplay, systems, rules, and player experience.",
    shortLabel: "Design",
    path: "game-design",
    folderName: "game-design",
    entryPoint: "game-design/index.html",
    description: "Plan gameplay, systems, rules, and player experience.",
    active: true,
    order: 6,
    visibleInToolsList: true
  },
  {
    id: "game-configuration",
    name: "Game Configuration",
    displayName: "Game Configuration",
    shortDescription: "Plan release profile, debug visibility, and playable readiness gates.",
    shortLabel: "Config",
    path: "game-configuration",
    folderName: "game-configuration",
    entryPoint: "game-configuration/index.html",
    description: "Plan release profile, debug visibility, and playable readiness gates.",
    active: true,
    order: 17,
    visibleInToolsList: true
  },
  {
    id: "input-studio",
    name: "Input",
    displayName: "Input",
    shortDescription: "Map keyboard, mouse, gamepad and touch controls.",
    shortLabel: "Input",
    path: "input",
    folderName: "input",
    entryPoint: "input/index.html",
    description: "Map keyboard, mouse, gamepad and touch controls.",
    active: true,
    order: 7,
    visibleInToolsList: true
  },
  {
    id: "localization-studio",
    name: "Localization",
    displayName: "Localization",
    shortDescription: "Plan translation, language coverage, contributor review, and future localization workflows.",
    shortLabel: "Localization",
    path: "localization",
    folderName: "localization",
    entryPoint: "localization/index.html",
    description: "Plan translation, language coverage, contributor review, and future localization workflows.",
    active: true,
    order: 8,
    visibleInToolsList: true
  },
  {
    id: "midi-studio-v2",
    name: "MIDI",
    displayName: "MIDI",
    shortDescription: "Compose game music using MIDI tools and instruments.",
    shortLabel: "MIDI",
    path: "midi",
    folderName: "midi",
    entryPoint: "midi/index.html",
    description: "Compose game music using MIDI tools and instruments.",
    active: true,
    order: 9,
    visibleInToolsList: true
  },
  {
    id: "object-vector-studio-v2",
    name: "Object Vector",
    displayName: "Object Vector",
    shortDescription: "Design scalable objects and vector shapes with precision.",
    shortLabel: "Object",
    path: "object-vector",
    folderName: "object-vector",
    entryPoint: "object-vector/index.html",
    description: "Design scalable objects and vector shapes with precision.",
    active: true,
    order: 10,
    visibleInToolsList: true
  },
  {
    id: "palette-manager-v2",
    name: "Palette Manager",
    displayName: "Palette Manager",
    shortDescription: "Craft and manage color palettes for your games.",
    shortLabel: "Palette",
    path: "palette",
    folderName: "palette",
    entryPoint: "palette/index.html",
    description: "Craft and manage color palettes for your games.",
    active: true,
    order: 11,
    visibleInToolsList: true
  },
  {
    id: "particle-studio",
    name: "Particles",
    displayName: "Particles",
    shortDescription: "Create particles, fire, smoke, sparks and visual effects.",
    shortLabel: "Particles",
    path: "particles",
    folderName: "particles",
    entryPoint: "particles/index.html",
    description: "Create particles, fire, smoke, sparks and visual effects.",
    active: true,
    order: 12,
    visibleInToolsList: true
  },
  {
    id: "publish-studio",
    name: "Publish",
    displayName: "Publish",
    shortDescription: "Prepare publishing workflows and release-ready game packages.",
    shortLabel: "Publish",
    path: "publish",
    folderName: "publish",
    entryPoint: "publish/index.html",
    description: "Prepare publishing workflows and release-ready game packages.",
    active: true,
    order: 13,
    visibleInToolsList: true
  },
  {
    id: "project-workspace",
    name: "Project Workspace",
    displayName: "Project Workspace",
    shortDescription: "Coordinate Build, Play, and Share readiness for one game project.",
    shortLabel: "Workspace",
    path: "project-workspace",
    folderName: "project-workspace",
    entryPoint: "project-workspace/index.html",
    description: "Coordinate Build, Play, and Share readiness for one game project.",
    active: true,
    order: 18,
    visibleInToolsList: true
  },
  {
    id: "sound-studio",
    name: "Sound",
    displayName: "Sound",
    shortDescription: "Design and edit sound effects for immersive audio.",
    shortLabel: "Sound",
    path: "sound",
    folderName: "sound",
    entryPoint: "sound/index.html",
    description: "Design and edit sound effects for immersive audio.",
    active: true,
    order: 14,
    visibleInToolsList: true
  },
  {
    id: "storage-inspector-v2",
    name: "Storage Inspector",
    displayName: "Storage Inspector",
    shortDescription: "Inspect and manage saves, local storage and game data.",
    shortLabel: "Storage",
    path: "storage",
    folderName: "storage",
    entryPoint: "storage/index.html",
    description: "Inspect and manage saves, local storage and game data.",
    active: true,
    order: 15,
    visibleInToolsList: true
  },
  {
    id: "world-vector-studio-v2",
    name: "World Vector",
    displayName: "World Vector",
    shortDescription: "Build worlds, maps and levels with powerful tools.",
    shortLabel: "World",
    path: "world-vector",
    folderName: "world-vector",
    entryPoint: "world-vector/index.html",
    description: "Build worlds, maps and levels with powerful tools.",
    active: true,
    order: 16,
    visibleInToolsList: true
  }
]);

export { TOOL_NAME_SUFFIX_PATTERN };

export function resolveToolIdAlias(toolId) {
  const normalizedToolId = typeof toolId === "string" ? toolId.trim() : "";
  return normalizedToolId;
}

export function getToolRegistry() {
  return TOOL_REGISTRY.map((tool) => ({ ...tool }));
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
