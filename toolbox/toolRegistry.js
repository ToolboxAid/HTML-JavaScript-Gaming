import { getVisibleToolsProgressSource } from "../admin/tools-progress-source.js";

const TOOL_NAME_SUFFIX_PATTERN = /(?:^|[\s_-])(v2|v3|new|final|copy)(?:$|[\s_-])/i;

export const TOOL_REGISTRY = Object.freeze([
  {
    "id": "ai-assistant",
    "name": "AI Assistant",
    "displayName": "AI Assistant",
    "shortDescription": "Get guided technical help for game creation workflows.",
    "shortLabel": "AI Assistant",
    "path": "ai-assistant",
    "folderName": "ai-assistant",
    "entryPoint": "ai-assistant/index.html",
    "badge": "/assets/theme-v2/images/badges/ai-assistant.png",
    "tool": "/assets/theme-v2/images/tools/ai-assistant.png",
    "description": "Get guided technical help for game creation workflows.",
    "category": "AI",
    "colorGroup": "tool-group-ai",
    "active": true,
    "order": 1,
  },
  {
    "id": "project-workspace",
    "name": "Project Workspace",
    "displayName": "Project Workspace",
    "shortDescription": "Coordinate Build, Play, and Share readiness for one game project.",
    "shortLabel": "Project Workspace",
    "path": "project-workspace",
    "folderName": "project-workspace",
    "entryPoint": "project-workspace/index.html",
    "badge": "/assets/theme-v2/images/badges/project-workspace.png",
    "tool": "/assets/theme-v2/images/tools/project-workspace.png",
    "description": "Coordinate Build, Play, and Share readiness for one game project.",
    "category": "Build/Create",
    "colorGroup": "tool-group-build",
    "active": true,
    "order": 2,
  },
  {
    "id": "game-design",
    "name": "Game Design",
    "displayName": "Game Design",
    "shortDescription": "Plan gameplay, systems, rules, and player experience.",
    "shortLabel": "Game Design",
    "path": "game-design",
    "folderName": "game-design",
    "entryPoint": "game-design/index.html",
    "badge": "/assets/theme-v2/images/badges/game-design.png",
    "tool": "/assets/theme-v2/images/tools/game-design.png",
    "description": "Plan gameplay, systems, rules, and player experience.",
    "category": "Design",
    "colorGroup": "tool-group-design",
    "active": true,
    "order": 3,
  },
  {
    "id": "game-configuration",
    "name": "Game Configuration",
    "displayName": "Game Configuration",
    "shortDescription": "Plan release profile, debug visibility, and playable readiness gates.",
    "shortLabel": "Game Configuration",
    "path": "game-configuration",
    "folderName": "game-configuration",
    "entryPoint": "game-configuration/index.html",
    "badge": "/assets/theme-v2/images/badges/game-configuration.png",
    "tool": "/assets/theme-v2/images/tools/game-configuration.png",
    "description": "Plan release profile, debug visibility, and playable readiness gates.",
    "category": "Build/Create",
    "colorGroup": "tool-group-build",
    "active": true,
    "order": 4,
    "navigation": {
      "nextGroup": "Design",
      "nextToolIds": [
        "assets",
        "colors",
        "fonts",
        "sprites",
        "characters",
        "objects",
        "worlds",
        "animations"
      ]
    }
  },
  {
    "id": "assets",
    "name": "Assets",
    "displayName": "Assets",
    "shortDescription": "Create sprites, animations, vectors, and palettes.",
    "shortLabel": "Assets",
    "path": "assets",
    "folderName": "assets",
    "entryPoint": "assets/index.html",
    "badge": "/assets/theme-v2/images/badges/assets.png",
    "tool": "/assets/theme-v2/images/tools/assets.png",
    "description": "Create sprites, animations, vectors, and palettes.",
    "category": "Design",
    "colorGroup": "tool-group-design",
    "active": true,
    "order": 5,
  },
  {
    "id": "colors",
    "name": "Colors",
    "displayName": "Colors",
    "shortDescription": "Craft and manage color palettes for your games.",
    "shortLabel": "Colors",
    "path": "colors",
    "folderName": "colors",
    "entryPoint": "colors/index.html",
    "badge": "/assets/theme-v2/images/badges/colors.png",
    "tool": "/assets/theme-v2/images/tools/colors.png",
    "description": "Craft and manage color palettes for your games.",
    "category": "Design",
    "colorGroup": "tool-group-design",
    "active": true,
    "order": 6,
  },
  {
    "id": "fonts",
    "name": "Fonts",
    "displayName": "Fonts",
    "shortDescription": "Plan game typography, font loading, and readable text choices.",
    "shortLabel": "Fonts",
    "path": "fonts",
    "folderName": "fonts",
    "entryPoint": "fonts/index.html",
    "badge": "/assets/theme-v2/images/badges/fonts.png",
    "tool": "/assets/theme-v2/images/tools/fonts.png",
    "description": "Plan game typography, font loading, and readable text choices.",
    "category": "Design",
    "colorGroup": "tool-group-design",
    "active": true,
    "order": 7,
  },
  {
    "id": "sprites",
    "name": "Sprites",
    "displayName": "Sprites",
    "shortDescription": "Plan sprite creation, review, and game-ready export workflows.",
    "shortLabel": "Sprites",
    "path": "sprites",
    "folderName": "sprites",
    "entryPoint": "sprites/index.html",
    "badge": "/assets/theme-v2/images/badges/sprites.png",
    "tool": "/assets/theme-v2/images/tools/sprites.png",
    "description": "Plan sprite creation, review, and game-ready export workflows.",
    "category": "Design",
    "colorGroup": "tool-group-design",
    "active": true,
    "order": 8,
  },
  {
    "id": "characters",
    "name": "Characters",
    "displayName": "Characters",
    "shortDescription": "Plan player, NPC, and character asset workflows.",
    "shortLabel": "Characters",
    "path": "characters",
    "folderName": "characters",
    "entryPoint": "characters/index.html",
    "badge": "/assets/theme-v2/images/badges/characters.png",
    "tool": "/assets/theme-v2/images/tools/characters.png",
    "description": "Plan player, NPC, and character asset workflows.",
    "category": "Design",
    "colorGroup": "tool-group-design",
    "active": true,
    "order": 9,
  },
  {
    "id": "objects",
    "name": "Objects",
    "displayName": "Objects",
    "shortDescription": "Design reusable game objects and object-ready assets.",
    "shortLabel": "Objects",
    "path": "objects",
    "folderName": "objects",
    "entryPoint": "objects/index.html",
    "badge": "/assets/theme-v2/images/badges/objects.png",
    "tool": "/assets/theme-v2/images/tools/objects.png",
    "description": "Design reusable game objects and object-ready assets.",
    "category": "Design",
    "colorGroup": "tool-group-design",
    "active": true,
    "order": 10,
  },
  {
    "id": "worlds",
    "name": "Worlds",
    "displayName": "Worlds",
    "shortDescription": "Shape world layouts, maps, terrain, and scene geometry.",
    "shortLabel": "Worlds",
    "path": "worlds",
    "folderName": "worlds",
    "entryPoint": "worlds/index.html",
    "badge": "/assets/theme-v2/images/badges/worlds.png",
    "tool": "/assets/theme-v2/images/tools/worlds.png",
    "description": "Shape world layouts, maps, terrain, and scene geometry.",
    "category": "Design",
    "colorGroup": "tool-group-design",
    "active": true,
    "order": 11,
  },
  {
    "id": "animations",
    "name": "Animations",
    "displayName": "Animations",
    "shortDescription": "Plan character and object animation states.",
    "shortLabel": "Animations",
    "path": "animations",
    "folderName": "animations",
    "entryPoint": "animations/index.html",
    "badge": "/assets/theme-v2/images/badges/animations.png",
    "tool": "/assets/theme-v2/images/tools/animation.png",
    "description": "Plan character and object animation states.",
    "category": "Design",
    "colorGroup": "tool-group-design",
    "active": true,
    "order": 12,
  },
  {
    "id": "audio",
    "name": "Audio",
    "displayName": "Audio",
    "shortDescription": "Plan game audio, effects, and playback readiness.",
    "shortLabel": "Audio",
    "path": "audio",
    "folderName": "audio",
    "entryPoint": "audio/index.html",
    "badge": "/assets/theme-v2/images/badges/audio.png",
    "tool": "/assets/theme-v2/images/tools/audio.png",
    "description": "Plan game audio, effects, and playback readiness.",
    "category": "Audio",
    "colorGroup": "tool-group-audio",
    "active": true,
    "order": 13,
  },
  {
    "id": "music",
    "name": "Music",
    "displayName": "Music",
    "shortDescription": "Plan reusable music and soundtrack workflows.",
    "shortLabel": "Music",
    "path": "music",
    "folderName": "music",
    "entryPoint": "music/index.html",
    "badge": "/assets/theme-v2/images/badges/music.png",
    "tool": "/assets/theme-v2/images/tools/music.png",
    "description": "Plan reusable music and soundtrack workflows.",
    "category": "Audio",
    "colorGroup": "tool-group-audio",
    "active": true,
    "order": 14,
  },
  {
    "id": "voices",
    "name": "Voices",
    "displayName": "Voices",
    "shortDescription": "Plan character voice, spoken output, and voice review workflows.",
    "shortLabel": "Voices",
    "path": "voices",
    "folderName": "voices",
    "entryPoint": "voices/index.html",
    "badge": "/assets/theme-v2/images/badges/voices.png",
    "tool": "/assets/theme-v2/images/tools/voices.png",
    "description": "Plan character voice, spoken output, and voice review workflows.",
    "category": "Audio",
    "colorGroup": "tool-group-audio",
    "active": true,
    "order": 15,
  },
  {
    "id": "videos",
    "name": "Videos",
    "displayName": "Videos",
    "shortDescription": "Plan trailer, cutscene, and video asset workflows.",
    "shortLabel": "Videos",
    "path": "videos",
    "folderName": "videos",
    "entryPoint": "videos/index.html",
    "badge": "/assets/theme-v2/images/badges/videos.png",
    "tool": "/assets/theme-v2/images/tools/videos.png",
    "description": "Plan trailer, cutscene, and video asset workflows.",
    "category": "Audio",
    "colorGroup": "tool-group-audio",
    "active": true,
    "order": 16,
  },
  {
    "id": "build-game",
    "name": "Build Game",
    "displayName": "Build Game",
    "shortDescription": "Plan build packaging and playable output readiness.",
    "shortLabel": "Build Game",
    "path": "build-game",
    "folderName": "build-game",
    "entryPoint": "build-game/index.html",
    "badge": "/assets/theme-v2/images/badges/build-game.png",
    "tool": "/assets/theme-v2/images/tools/build-game.png",
    "description": "Plan build packaging and playable output readiness.",
    "category": "Build/Create",
    "colorGroup": "tool-group-build",
    "active": true,
    "order": 17,
  },
  {
    "id": "game-testing",
    "name": "Game Testing",
    "displayName": "Game Testing",
    "shortDescription": "Plan test passes, release checks, and playable validation.",
    "shortLabel": "Game Testing",
    "path": "game-testing",
    "folderName": "game-testing",
    "entryPoint": "game-testing/index.html",
    "badge": "/assets/theme-v2/images/badges/game-testing.png",
    "tool": "/assets/theme-v2/images/tools/game-testing.png",
    "description": "Plan test passes, release checks, and playable validation.",
    "category": "Play",
    "colorGroup": "tool-group-play",
    "active": true,
    "order": 18,
  },
  {
    "id": "controls",
    "name": "Controls",
    "displayName": "Controls",
    "shortDescription": "Map keyboard, mouse, gamepad, and touch controls.",
    "shortLabel": "Controls",
    "path": "controls",
    "folderName": "controls",
    "entryPoint": "controls/index.html",
    "badge": "/assets/theme-v2/images/badges/controls.png",
    "tool": "/assets/theme-v2/images/tools/controls.png",
    "description": "Map keyboard, mouse, gamepad, and touch controls.",
    "category": "Platform",
    "colorGroup": "tool-group-platform",
    "active": true,
    "order": 19,
  },
  {
    "id": "hitboxes",
    "name": "Hitboxes",
    "displayName": "Hitboxes",
    "shortDescription": "Plan collision, hurtbox, and interaction region workflows.",
    "shortLabel": "Hitboxes",
    "path": "hitboxes",
    "folderName": "hitboxes",
    "entryPoint": "hitboxes/index.html",
    "badge": "/assets/theme-v2/images/badges/hitboxes.png",
    "tool": "/assets/theme-v2/images/tools/hitboxes.png",
    "description": "Plan collision, hurtbox, and interaction region workflows.",
    "category": "Platform",
    "colorGroup": "tool-group-platform",
    "active": true,
    "order": 20,
  },
  {
    "id": "saved-data",
    "name": "Saved Data",
    "displayName": "Saved Data",
    "shortDescription": "Inspect and manage saves, local storage, and game data.",
    "shortLabel": "Saved Data",
    "path": "saved-data",
    "folderName": "saved-data",
    "entryPoint": "saved-data/index.html",
    "badge": "/assets/theme-v2/images/badges/saved-data.png",
    "tool": "/assets/theme-v2/images/tools/saved-data.png",
    "description": "Inspect and manage saves, local storage, and game data.",
    "category": "Platform",
    "colorGroup": "tool-group-platform",
    "active": true,
    "order": 21,
  },
  {
    "id": "debug",
    "name": "Debug",
    "displayName": "Debug",
    "shortDescription": "Plan visible creator debug settings and release gating.",
    "shortLabel": "Debug",
    "path": "debug",
    "folderName": "debug",
    "entryPoint": "debug/index.html",
    "badge": "/assets/theme-v2/images/badges/debug.png",
    "tool": "/assets/theme-v2/images/tools/debug.png",
    "description": "Plan visible creator debug settings and release gating.",
    "category": "Platform",
    "colorGroup": "tool-group-platform",
    "active": true,
    "order": 22,
  },
  {
    "id": "performance",
    "name": "Performance",
    "displayName": "Performance",
    "shortDescription": "Plan performance budgets, diagnostics, and readiness checks.",
    "shortLabel": "Performance",
    "path": "performance",
    "folderName": "performance",
    "entryPoint": "performance/index.html",
    "badge": "/assets/theme-v2/images/badges/performance.png",
    "tool": "/assets/theme-v2/images/tools/performance.png",
    "description": "Plan performance budgets, diagnostics, and readiness checks.",
    "category": "Platform",
    "colorGroup": "tool-group-platform",
    "active": true,
    "order": 23,
  },
  {
    "id": "events",
    "name": "Events",
    "displayName": "Events",
    "shortDescription": "Plan gameplay events, triggers, and state transitions.",
    "shortLabel": "Events",
    "path": "events",
    "folderName": "events",
    "entryPoint": "events/index.html",
    "badge": "/assets/theme-v2/images/badges/events.png",
    "tool": "/assets/theme-v2/images/tools/events.png",
    "description": "Plan gameplay events, triggers, and state transitions.",
    "category": "Platform",
    "colorGroup": "tool-group-platform",
    "active": true,
    "order": 24,
  },
  {
    "id": "publish",
    "name": "Publish",
    "displayName": "Publish",
    "shortDescription": "Prepare publishing workflows and release-ready game packages.",
    "shortLabel": "Publish",
    "path": "publish",
    "folderName": "publish",
    "entryPoint": "publish/index.html",
    "badge": "/assets/theme-v2/images/badges/publish.png",
    "tool": "/assets/theme-v2/images/tools/publish.png",
    "description": "Prepare publishing workflows and release-ready game packages.",
    "category": "Marketplace",
    "colorGroup": "tool-group-marketplace",
    "active": true,
    "order": 25,
  },
  {
    "id": "marketplace",
    "name": "Marketplace",
    "displayName": "Marketplace",
    "shortDescription": "Plan marketplace listing, asset, and discovery workflows.",
    "shortLabel": "Marketplace",
    "path": "marketplace",
    "folderName": "marketplace",
    "entryPoint": "marketplace/index.html",
    "badge": "/assets/theme-v2/images/badges/marketplace.png",
    "tool": "/assets/theme-v2/images/tools/marketplace.png",
    "description": "Plan marketplace listing, asset, and discovery workflows.",
    "category": "Marketplace",
    "colorGroup": "tool-group-marketplace",
    "active": true,
    "order": 26,
  },
  {
    "id": "community",
    "name": "Community",
    "displayName": "Community",
    "shortDescription": "Plan creator community, tutorials, sharing, and feedback workflows.",
    "shortLabel": "Community",
    "path": "community",
    "folderName": "community",
    "entryPoint": "community/index.html",
    "badge": "/assets/theme-v2/images/badges/community.png",
    "tool": "/assets/theme-v2/images/tools/community.png",
    "description": "Plan creator community, tutorials, sharing, and feedback workflows.",
    "category": "Marketplace",
    "colorGroup": "tool-group-marketplace",
    "active": true,
    "order": 27,
  },
  {
    "id": "languages",
    "name": "Languages",
    "displayName": "Languages",
    "shortDescription": "Plan game language coverage and translation review workflows.",
    "shortLabel": "Languages",
    "path": "languages",
    "folderName": "languages",
    "entryPoint": "languages/index.html",
    "badge": "/assets/theme-v2/images/badges/languages.png",
    "tool": "/assets/theme-v2/images/tools/languages.png",
    "description": "Plan game language coverage and translation review workflows.",
    "category": "Platform",
    "colorGroup": "tool-group-platform",
    "active": true,
    "order": 28,
  },
  {
    "id": "achievements",
    "name": "Achievements",
    "displayName": "Achievements",
    "shortDescription": "Plan achievement definitions and creator-facing unlock review.",
    "shortLabel": "Achievements",
    "path": "achievements",
    "folderName": "achievements",
    "entryPoint": "achievements/index.html",
    "badge": "/assets/theme-v2/images/badges/achievement.png",
    "tool": "/assets/theme-v2/images/tools/achievement.png",
    "description": "Plan achievement definitions and creator-facing unlock review.",
    "category": "Play",
    "colorGroup": "tool-group-play",
    "active": true,
    "order": 29,
  },
  {
    "id": "ratings",
    "name": "Ratings",
    "displayName": "Ratings",
    "shortDescription": "Plan player ratings, review signals, and quality feedback.",
    "shortLabel": "Ratings",
    "path": "ratings",
    "folderName": "ratings",
    "entryPoint": "ratings/index.html",
    "badge": "/assets/theme-v2/images/badges/ratings.png",
    "tool": "/assets/theme-v2/images/tools/ratings.png",
    "description": "Plan player ratings, review signals, and quality feedback.",
    "category": "Play",
    "colorGroup": "tool-group-play",
    "active": true,
    "order": 30,
  },
  {
    "id": "cloud",
    "name": "Cloud",
    "displayName": "Cloud",
    "shortDescription": "Hidden capability shell for connected storage, sync, and publishing support.",
    "shortLabel": "Cloud",
    "path": "cloud",
    "folderName": "cloud",
    "entryPoint": "cloud/index.html",
    "badge": "/assets/theme-v2/images/badges/cloud.png",
    "tool": "/assets/theme-v2/images/tools/cloud.png",
    "description": "Hidden capability shell for connected storage, sync, and publishing support.",
    "category": "Platform",
    "colorGroup": "tool-group-platform",
    "active": true,
    "order": 31,
  },
  {
    "id": "code",
    "name": "Custom Extensions",
    "displayName": "Custom Extensions",
    "shortDescription": "Hidden capability shell for approved extension hooks and creator-private custom logic.",
    "shortLabel": "Custom Extensions",
    "path": "code",
    "folderName": "code",
    "entryPoint": "code/index.html",
    "badge": "/assets/theme-v2/images/badges/code.png",
    "tool": "/assets/theme-v2/images/tools/code.png",
    "description": "Hidden capability shell for approved extension hooks and creator-private custom logic.",
    "category": "Build/Create",
    "colorGroup": "tool-group-build",
    "active": true,
    "order": 32,
  },
  {
    "id": "midi",
    "name": "MIDI",
    "displayName": "MIDI",
    "shortDescription": "Hidden capability shell for MIDI-driven audio and music interaction flows.",
    "shortLabel": "MIDI",
    "path": "midi",
    "folderName": "midi",
    "entryPoint": "midi/index.html",
    "badge": "/assets/theme-v2/images/badges/midi.png",
    "tool": "/assets/theme-v2/images/tools/midi.png",
    "description": "Hidden capability shell for MIDI-driven audio and music interaction flows.",
    "category": "Audio",
    "colorGroup": "tool-group-audio",
    "active": true,
    "order": 34,
  },
  {
    "id": "particles",
    "name": "Particles",
    "displayName": "Particles",
    "shortDescription": "Hidden capability shell for visual effects and particle workflows.",
    "shortLabel": "Particles",
    "path": "particles",
    "folderName": "particles",
    "entryPoint": "particles/index.html",
    "badge": "/assets/theme-v2/images/badges/particles.png",
    "tool": "/assets/theme-v2/images/tools/particles.png",
    "description": "Hidden capability shell for visual effects and particle workflows.",
    "category": "Audio",
    "colorGroup": "tool-group-audio",
    "active": true,
    "order": 35,
  },
  {
    "id": "audio-effects",
    "name": "Audio Effects",
    "displayName": "Audio Effects",
    "shortDescription": "Hidden capability shell for reusable game effect audio workflows.",
    "shortLabel": "Audio Effects",
    "path": "audio-effects",
    "folderName": "audio-effects",
    "entryPoint": "audio-effects/index.html",
    "badge": "/assets/theme-v2/images/badges/audio-effects.png",
    "tool": "/assets/theme-v2/images/tools/audio-effects.png",
    "description": "Hidden capability shell for reusable game effect audio workflows.",
    "category": "Audio",
    "colorGroup": "tool-group-audio",
    "active": true,
    "order": 36,
  },
  {
    "id": "speech-to-text",
    "name": "Voice Capture",
    "displayName": "Voice Capture",
    "shortDescription": "Hidden capability shell for spoken input and transcription workflows.",
    "shortLabel": "Voice Capture",
    "path": "speech-to-text",
    "folderName": "speech-to-text",
    "entryPoint": "speech-to-text/index.html",
    "badge": "/assets/theme-v2/images/badges/speech-to-text.png",
    "tool": "/assets/theme-v2/images/tools/speech-to-text.png",
    "description": "Hidden capability shell for spoken input and transcription workflows.",
    "category": "Audio",
    "colorGroup": "tool-group-audio",
    "active": true,
    "order": 37,
  },
  {
    "id": "text-to-speech",
    "name": "Voice Output",
    "displayName": "Voice Output",
    "shortDescription": "Hidden capability shell for generated narration and spoken output workflows.",
    "shortLabel": "Voice Output",
    "path": "text-to-speech",
    "folderName": "text-to-speech",
    "entryPoint": "text-to-speech/index.html",
    "badge": "/assets/theme-v2/images/badges/text-to-speech.png",
    "tool": "/assets/theme-v2/images/tools/text-to-speech.png",
    "description": "Hidden capability shell for generated narration and spoken output workflows.",
    "category": "Audio",
    "colorGroup": "tool-group-audio",
    "active": true,
    "order": 38,
  },
  {
    "id": "users",
    "name": "Users",
    "displayName": "Users",
    "shortDescription": "Plan admin-only user management workflows.",
    "shortLabel": "Users",
    "path": "users",
    "folderName": "users",
    "entryPoint": "users/index.html",
    "badge": "/assets/theme-v2/images/badges/users.png",
    "tool": "/assets/theme-v2/images/tools/users.png",
    "description": "Plan admin-only user management workflows.",
    "category": "Platform",
    "colorGroup": "tool-group-platform",
    "active": true,
    "order": 39,
  },
  {
    "id": "environments",
    "name": "Environments",
    "displayName": "Environments",
    "shortDescription": "Plan admin-only environment and deployment controls.",
    "shortLabel": "Environments",
    "path": "environments",
    "folderName": "environments",
    "entryPoint": "environments/index.html",
    "badge": "/assets/theme-v2/images/badges/environments.png",
    "tool": "/assets/theme-v2/images/tools/environments.png",
    "description": "Plan admin-only environment and deployment controls.",
    "category": "Platform",
    "colorGroup": "tool-group-platform",
    "active": true,
    "order": 40,
  },
  {
    "id": "game-migration",
    "name": "Game Migration",
    "displayName": "Game Migration",
    "shortDescription": "Plan admin-only migration support for older game data.",
    "shortLabel": "Game Migration",
    "path": "game-migration",
    "folderName": "game-migration",
    "entryPoint": "game-migration/index.html",
    "badge": "/assets/theme-v2/images/badges/game-migration.png",
    "tool": "/assets/theme-v2/images/tools/game-migration.png",
    "description": "Plan admin-only migration support for older game data.",
    "category": "Platform",
    "colorGroup": "tool-group-platform",
    "active": true,
    "order": 41,
  },
  {
    "id": "platform-settings",
    "name": "Platform Settings",
    "displayName": "Platform Settings",
    "shortDescription": "Plan admin-only platform settings and feature flags.",
    "shortLabel": "Platform Settings",
    "path": "platform-settings",
    "folderName": "platform-settings",
    "entryPoint": "platform-settings/index.html",
    "badge": "/assets/theme-v2/images/badges/platform-settings.png",
    "tool": "/assets/theme-v2/images/tools/platform-settings.png",
    "description": "Plan admin-only platform settings and feature flags.",
    "category": "Platform",
    "colorGroup": "tool-group-platform",
    "active": true,
    "order": 42,
  }
]);

export const TOOL_IMAGE_BADGE_ROOT = "/assets/theme-v2/images/badges/";
export const TOOL_IMAGE_TOOL_ROOT = "/assets/theme-v2/images/tools/";
export const TOOL_IMAGE_FALLBACK = "/assets/theme-v2/images/image-missing.svg";
export const TOOL_IMAGE_SIZE_SUFFIX_PATTERN = /(?:-64|-1024|-\d+x\d+)(?=\.[a-z0-9]+(?:[?#].*)?$)/i;

const AVAILABLE_TOOL_IMAGE_PATHS = Object.freeze([
  "/assets/theme-v2/images/badges/achievement.png",
  "/assets/theme-v2/images/badges/ai-assistant.png",
  "/assets/theme-v2/images/badges/animation-studio.png",
  "/assets/theme-v2/images/badges/animations.png",
  "/assets/theme-v2/images/badges/arcade.png",
  "/assets/theme-v2/images/badges/asset-studio.png",
  "/assets/theme-v2/images/badges/assets.png",
  "/assets/theme-v2/images/badges/audio-effects.png",
  "/assets/theme-v2/images/badges/audio.png",
  "/assets/theme-v2/images/badges/build-game.png",
  "/assets/theme-v2/images/badges/characters.png",
  "/assets/theme-v2/images/badges/cloud-studio.png",
  "/assets/theme-v2/images/badges/cloud.png",
  "/assets/theme-v2/images/badges/code-studio.png",
  "/assets/theme-v2/images/badges/code.png",
  "/assets/theme-v2/images/badges/colors.png",
  "/assets/theme-v2/images/badges/community.png",
  "/assets/theme-v2/images/badges/configuration-admin.png",
  "/assets/theme-v2/images/badges/controls.png",
  "/assets/theme-v2/images/badges/debug.png",
  "/assets/theme-v2/images/badges/environments.png",
  "/assets/theme-v2/images/badges/events.png",
  "/assets/theme-v2/images/badges/fonts.png",
  "/assets/theme-v2/images/badges/game-builder.png",
  "/assets/theme-v2/images/badges/game-configuration.png",
  "/assets/theme-v2/images/badges/game-design-studio.png",
  "/assets/theme-v2/images/badges/game-design.png",
  "/assets/theme-v2/images/badges/game-migration.png",
  "/assets/theme-v2/images/badges/game-testing.png",
  "/assets/theme-v2/images/badges/hitboxes.png",
  "/assets/theme-v2/images/badges/index.png",
  "/assets/theme-v2/images/badges/input-studio.png",
  "/assets/theme-v2/images/badges/languages.png",
  "/assets/theme-v2/images/badges/learn-studio.png",
  "/assets/theme-v2/images/badges/learn.png",
  "/assets/theme-v2/images/badges/localization-studio.png",
  "/assets/theme-v2/images/badges/marketplace.png",
  "/assets/theme-v2/images/badges/midi-studio.png",
  "/assets/theme-v2/images/badges/midi.png",
  "/assets/theme-v2/images/badges/music.png",
  "/assets/theme-v2/images/badges/object-vector-studio.png",
  "/assets/theme-v2/images/badges/objects.png",
  "/assets/theme-v2/images/badges/palette-manager.png",
  "/assets/theme-v2/images/badges/particle-studio.png",
  "/assets/theme-v2/images/badges/particles.png",
  "/assets/theme-v2/images/badges/performance.png",
  "/assets/theme-v2/images/badges/platform-settings.png",
  "/assets/theme-v2/images/badges/project-workspace.png",
  "/assets/theme-v2/images/badges/publish-studio.png",
  "/assets/theme-v2/images/badges/publish.png",
  "/assets/theme-v2/images/badges/ratings.png",
  "/assets/theme-v2/images/badges/saved-data.png",
  "/assets/theme-v2/images/badges/settings-studio.png",
  "/assets/theme-v2/images/badges/sound-studio.png",
  "/assets/theme-v2/images/badges/speech-to-text.png",
  "/assets/theme-v2/images/badges/sprites.png",
  "/assets/theme-v2/images/badges/storage-inspector.png",
  "/assets/theme-v2/images/badges/text-to-speech.png",
  "/assets/theme-v2/images/badges/users.png",
  "/assets/theme-v2/images/badges/videos.png",
  "/assets/theme-v2/images/badges/voices.png",
  "/assets/theme-v2/images/badges/world-vector-studio.png",
  "/assets/theme-v2/images/badges/worlds.png",
  "/assets/theme-v2/images/tools/achievement.png",
  "/assets/theme-v2/images/tools/ai-assistant.png",
  "/assets/theme-v2/images/tools/animation.png",
  "/assets/theme-v2/images/tools/arcade.png",
  "/assets/theme-v2/images/tools/asset-studio.png",
  "/assets/theme-v2/images/tools/assets.png",
  "/assets/theme-v2/images/tools/audio-effects.png",
  "/assets/theme-v2/images/tools/audio.png",
  "/assets/theme-v2/images/tools/build-game.png",
  "/assets/theme-v2/images/tools/characters.png",
  "/assets/theme-v2/images/tools/cloud-studio.png",
  "/assets/theme-v2/images/tools/cloud.png",
  "/assets/theme-v2/images/tools/code-studio.png",
  "/assets/theme-v2/images/tools/code.png",
  "/assets/theme-v2/images/tools/colors.png",
  "/assets/theme-v2/images/tools/community.png",
  "/assets/theme-v2/images/tools/controls.png",
  "/assets/theme-v2/images/tools/debug.png",
  "/assets/theme-v2/images/tools/environments.png",
  "/assets/theme-v2/images/tools/events.png",
  "/assets/theme-v2/images/tools/fonts.png",
  "/assets/theme-v2/images/tools/game-builder.png",
  "/assets/theme-v2/images/tools/game-configuration.png",
  "/assets/theme-v2/images/tools/game-design-studio.png",
  "/assets/theme-v2/images/tools/game-design.png",
  "/assets/theme-v2/images/tools/game-migration.png",
  "/assets/theme-v2/images/tools/game-testing.png",
  "/assets/theme-v2/images/tools/hitboxes.png",
  "/assets/theme-v2/images/tools/input-studio.png",
  "/assets/theme-v2/images/tools/languages.png",
  "/assets/theme-v2/images/tools/learn-studio.png",
  "/assets/theme-v2/images/tools/learn.png",
  "/assets/theme-v2/images/tools/localization-studio.png",
  "/assets/theme-v2/images/tools/localizaton.png",
  "/assets/theme-v2/images/tools/marketplace.png",
  "/assets/theme-v2/images/tools/match_format.png",
  "/assets/theme-v2/images/tools/midi-studio.png",
  "/assets/theme-v2/images/tools/midi.png",
  "/assets/theme-v2/images/tools/music.png",
  "/assets/theme-v2/images/tools/object-vector-studio.png",
  "/assets/theme-v2/images/tools/objects.png",
  "/assets/theme-v2/images/tools/palette-manager.png",
  "/assets/theme-v2/images/tools/particle-studio.png",
  "/assets/theme-v2/images/tools/particles.png",
  "/assets/theme-v2/images/tools/performance.png",
  "/assets/theme-v2/images/tools/platform-settings.png",
  "/assets/theme-v2/images/tools/project-workspace.png",
  "/assets/theme-v2/images/tools/publish-studio.png",
  "/assets/theme-v2/images/tools/publish.png",
  "/assets/theme-v2/images/tools/ratings.png",
  "/assets/theme-v2/images/tools/saved-data.png",
  "/assets/theme-v2/images/tools/settings-studio.png",
  "/assets/theme-v2/images/tools/sound-studio.png",
  "/assets/theme-v2/images/tools/speech-to-text.png",
  "/assets/theme-v2/images/tools/sprites.png",
  "/assets/theme-v2/images/tools/storage-inspector.png",
  "/assets/theme-v2/images/tools/text-to-speech.png",
  "/assets/theme-v2/images/tools/users.png",
  "/assets/theme-v2/images/tools/videos.png",
  "/assets/theme-v2/images/tools/voices.png",
  "/assets/theme-v2/images/tools/world-vector-studio.png",
  "/assets/theme-v2/images/tools/worlds.png"
]);

function normalizeToolImagePath(imagePath) {
  if (typeof imagePath !== "string") {
    return "";
  }
  const [withoutHash] = imagePath.trim().replace(/\\/g, "/").split("#");
  const [withoutQuery] = withoutHash.split("?");
  if (!withoutQuery) {
    return "";
  }
  return withoutQuery.startsWith("/") ? withoutQuery : "/" + withoutQuery.replace(/^\/+/, "");
}

export function toolImagePathExists(imagePath) {
  const normalizedPath = normalizeToolImagePath(imagePath);
  return AVAILABLE_TOOL_IMAGE_PATHS.includes(normalizedPath);
}

export function isApprovedToolImagePath(imagePath, kind) {
  const normalizedPath = normalizeToolImagePath(imagePath);
  if (kind === "badge") {
    return normalizedPath.startsWith(TOOL_IMAGE_BADGE_ROOT);
  }
  if (kind === "tool") {
    return normalizedPath.startsWith(TOOL_IMAGE_TOOL_ROOT);
  }
  return false;
}

export function toolImageUsesFallback(tool, kind) {
  if (!tool || (kind !== "badge" && kind !== "tool")) {
    return true;
  }
  return !isApprovedToolImagePath(tool[kind], kind) || !toolImagePathExists(tool[kind]);
}

export function getToolImageSource(tool, kind) {
  if (!tool || (kind !== "badge" && kind !== "tool")) {
    return TOOL_IMAGE_FALLBACK;
  }
  const normalizedPath = normalizeToolImagePath(tool[kind]);
  return isApprovedToolImagePath(normalizedPath, kind) && toolImagePathExists(normalizedPath)
    ? normalizedPath
    : TOOL_IMAGE_FALLBACK;
}

function toolImageDiagnostic(tool, kind) {
  const label = kind === "badge" ? "Badge" : "Tool";
  if (!tool) {
    return `${label} image registry entry missing; fallback shown.`;
  }

  const normalizedPath = normalizeToolImagePath(tool[kind]);
  if (!normalizedPath) {
    return `${label} image path missing; fallback shown.`;
  }

  if (!isApprovedToolImagePath(normalizedPath, kind)) {
    return `${label} image path is outside approved Theme V2 ${kind} assets; fallback shown.`;
  }

  if (!toolImagePathExists(normalizedPath)) {
    return `${label} image missing; fallback shown.`;
  }

  return "";
}

export function getToolImageDiagnostics(tool) {
  return ["badge", "tool"]
    .map((kind) => toolImageDiagnostic(tool, kind))
    .filter(Boolean);
}

export function getToolImageCoverage() {
  return getToolRegistry().map((tool) => ({
    badgeExists: toolImagePathExists(tool.badge),
    badgeFallbackUsed: toolImageUsesFallback(tool, "badge"),
    badgePath: normalizeToolImagePath(tool.badge),
    id: tool.id,
    label: tool.displayName || tool.name,
    toolExists: toolImagePathExists(tool.tool),
    toolFallbackUsed: toolImageUsesFallback(tool, "tool"),
    toolPath: normalizeToolImagePath(tool.tool)
  }));
}

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
  return getVisibleToolsProgressSource(getActiveToolRegistry());
}

export function getToolRoute(tool) {
  if (!tool || typeof tool.entryPoint !== "string" || tool.entryPoint.trim() === "") {
    return "";
  }
  return `toolbox/${tool.entryPoint.trim().replace(/^\/+/, "")}`;
}

export function getToolBySlug(toolSlug) {
  const normalizedToolSlug = typeof toolSlug === "string" ? toolSlug.trim() : "";
  if (!normalizedToolSlug) {
    return null;
  }
  return getToolRegistry().find((tool) => (
    tool.id === normalizedToolSlug
    || tool.path === normalizedToolSlug
    || tool.folderName === normalizedToolSlug
  )) ?? null;
}

export function toToolGroupSlug(groupName) {
  return String(groupName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function navigationCandidateIds(tool, direction, activeTools) {
  const configuredIds = tool.navigation?.[`${direction}ToolIds`];
  if (Array.isArray(configuredIds) && configuredIds.length > 0) {
    return configuredIds;
  }

  const currentIndex = activeTools.findIndex((candidate) => candidate.id === tool.id);
  const adjacentIndex = direction === "previous" ? currentIndex - 1 : currentIndex + 1;
  return activeTools[adjacentIndex] ? [activeTools[adjacentIndex].id] : [];
}

function disabledToolTarget(label) {
  return {
    disabled: true,
    group: "",
    href: "",
    kind: "disabled",
    label
  };
}

function resolvedToolTarget(tool) {
  const route = getToolRoute(tool);
  if (!route) {
    return disabledToolTarget(`${tool.displayName || tool.name || "Tool"} planned`);
  }
  return {
    disabled: false,
    group: "",
    href: route,
    kind: "tool",
    label: tool.displayName || tool.name
  };
}

function groupedToolTarget(groupName) {
  const groupSlug = toToolGroupSlug(groupName);
  return {
    disabled: !groupSlug,
    group: groupSlug,
    href: groupSlug ? `toolbox/index.html?view=group&group=${groupSlug}` : "",
    kind: "group",
    label: groupName ? `${groupName} Tools` : "Toolbox Group"
  };
}

function navigationTarget(tool, direction, activeTools) {
  const candidates = navigationCandidateIds(tool, direction, activeTools)
    .map((candidateId) => getToolById(candidateId))
    .filter(Boolean);

  if (candidates.length === 0) {
    return disabledToolTarget(direction === "previous" ? "No previous tool" : "No next tool");
  }

  if (candidates.length === 1) {
    return resolvedToolTarget(candidates[0]);
  }

  const configuredGroup = tool.navigation?.[`${direction}Group`];
  return groupedToolTarget(configuredGroup || candidates[0].category);
}

export function getToolNavigationTargets(toolSlug) {
  const tool = getToolBySlug(toolSlug);
  const activeTools = getActiveToolRegistry();
  if (!tool || !activeTools.some((candidate) => candidate.id === tool.id)) {
    return {
      next: disabledToolTarget("No next tool"),
      previous: disabledToolTarget("No previous tool"),
      tool: null
    };
  }

  return {
    next: navigationTarget(tool, "next", activeTools),
    previous: navigationTarget(tool, "previous", activeTools),
    tool
  };
}
