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
    id: "animation",
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
    id: "assets",
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
    id: "cloud",
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
    id: "code",
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
    id: "game-design",
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
    id: "input",
    name: "Input Mapping",
    displayName: "Input Mapping",
    shortDescription: "Map keyboard, mouse, gamepad and touch controls.",
    shortLabel: "Input Map",
    path: "input",
    folderName: "input",
    entryPoint: "input/index.html",
    description: "Map keyboard, mouse, gamepad and touch controls.",
    active: true,
    order: 7,
    visibleInToolsList: true
  },
  {
    id: "localization",
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
    id: "midi",
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
    id: "object-vector",
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
    id: "palette",
    name: "Palette / Colors",
    displayName: "Palette / Colors",
    shortDescription: "Craft and manage color palettes for your games.",
    shortLabel: "Colors",
    path: "palette",
    folderName: "palette",
    entryPoint: "palette/index.html",
    description: "Craft and manage color palettes for your games.",
    active: true,
    order: 11,
    visibleInToolsList: true
  },
  {
    id: "particles",
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
    id: "publish",
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
    id: "sound",
    name: "Audio",
    displayName: "Audio",
    shortDescription: "Design and edit audio for immersive play.",
    shortLabel: "Audio",
    path: "sound",
    folderName: "sound",
    entryPoint: "sound/index.html",
    description: "Design and edit sound effects for immersive audio.",
    active: true,
    order: 14,
    visibleInToolsList: true
  },
  {
    id: "storage",
    name: "Storage",
    displayName: "Storage",
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
    id: "world-vector",
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
  },
  {
    id: "text-to-speech",
    name: "Text to Speech",
    displayName: "Text to Speech",
    shortDescription: "Plan generated narration and spoken output workflows.",
    shortLabel: "TTS",
    path: "text-to-speech",
    folderName: "text-to-speech",
    entryPoint: "text-to-speech/index.html",
    description: "Plan generated narration and spoken output workflows.",
    active: true,
    order: 19,
    visibleInToolsList: true
  },
  {
    id: "speech-to-text",
    name: "Speech to Text",
    displayName: "Speech to Text",
    shortDescription: "Plan spoken input and transcription workflows.",
    shortLabel: "STT",
    path: "speech-to-text",
    folderName: "speech-to-text",
    entryPoint: "speech-to-text/index.html",
    description: "Plan spoken input and transcription workflows.",
    active: true,
    order: 20,
    visibleInToolsList: true
  },
  {
    id: "voice",
    name: "Voice",
    displayName: "Voice",
    shortDescription: "Plan character voice, capture, and review workflows.",
    shortLabel: "Voice",
    path: "voice",
    folderName: "voice",
    entryPoint: "voice/index.html",
    description: "Plan character voice, capture, and review workflows.",
    active: true,
    order: 21,
    visibleInToolsList: true
  },
  {
    id: "sound-effects",
    name: "Sound Effects",
    displayName: "Sound Effects",
    shortDescription: "Plan reusable game effect audio workflows.",
    shortLabel: "SFX",
    path: "sound-effects",
    folderName: "sound-effects",
    entryPoint: "sound-effects/index.html",
    description: "Plan reusable game effect audio workflows.",
    active: true,
    order: 22,
    visibleInToolsList: true
  },
  {
    id: "music-library",
    name: "Music Library",
    displayName: "Music Library",
    shortDescription: "Plan reusable music library and soundtrack workflows.",
    shortLabel: "Music",
    path: "music-library",
    folderName: "music-library",
    entryPoint: "music-library/index.html",
    description: "Plan reusable music library and soundtrack workflows.",
    active: true,
    order: 23,
    visibleInToolsList: true
  },
  {
    id: "fonts",
    name: "Fonts",
    displayName: "Fonts",
    shortDescription: "Plan game typography, font loading, and readable text choices.",
    shortLabel: "Fonts",
    path: "fonts",
    folderName: "fonts",
    entryPoint: "fonts/index.html",
    description: "Plan game typography, font loading, and readable text choices.",
    active: true,
    order: 24,
    visibleInToolsList: true
  },
  {
    id: "settings",
    name: "Settings",
    displayName: "Settings",
    shortDescription: "Plan visible creator settings for future configurable tool behavior.",
    shortLabel: "Settings",
    path: "settings",
    folderName: "settings",
    entryPoint: "settings/index.html",
    description: "Plan visible creator settings for future configurable tool behavior.",
    active: true,
    order: 25,
    visibleInToolsList: true
  },
  {
    id: "learn",
    name: "Learn",
    displayName: "Learn",
    shortDescription: "Plan tutorials, guidance, and learning resources for creators.",
    shortLabel: "Learn",
    path: "learn",
    folderName: "learn",
    entryPoint: "learn/index.html",
    description: "Plan tutorials, guidance, and learning resources for creators.",
    active: true,
    order: 26,
    visibleInToolsList: true
  },
  {
    id: "marketplace",
    name: "Marketplace",
    displayName: "Marketplace",
    shortDescription: "Plan marketplace listing, asset, and discovery workflows.",
    shortLabel: "Market",
    path: "marketplace",
    folderName: "marketplace",
    entryPoint: "marketplace/index.html",
    description: "Plan marketplace listing, asset, and discovery workflows.",
    active: true,
    order: 27,
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
