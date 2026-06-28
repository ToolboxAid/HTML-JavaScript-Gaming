const TOOL_NAME_SUFFIX_PATTERN = /(?:^|[\s_-])(v2|v3|new|final|copy)(?:$|[\s_-])/i;

export const TOOL_STATUS_MODEL = Object.freeze([
  "Ready",
  "Wireframe",
  "Under Construction",
  "Planned",
  "Hidden",
  "Deprecated",
  "beta"
]);

export const TOOL_RELEASE_CHANNELS = Object.freeze([
  "planned",
  "wireframe",
  "beta",
  "complete",
  "deprecated"
]);

export const TOOL_RELEASE_CHANNEL_LABELS = Object.freeze({
  planned: "Planned",
  wireframe: "Wireframe",
  beta: "Beta",
  complete: "Complete",
  deprecated: "Deprecated"
});

export const TOOL_RELEASE_CHANNEL_HELP_TEXT = Object.freeze({
  planned: "Not designed yet.\nNo meaningful UI.\nNo ownership defined.",
  wireframe: "Tool exists.\nUser can understand workflow.\nData ownership is defined.\nNot functionally usable.",
  beta: "Functionally usable.\nCan be used in a real game.\nMay still contain incomplete workflows, placeholder data, UI cleanup issues, unused fields, missing validation, or incomplete code review.",
  complete: "Functionally usable.\nCode reviewed.\nDead code removed.\nInvalid fields removed.\nUI cleaned up.\nNo known placeholder data.\nNo known invalid controls.\nReady for long-term support.",
  deprecated: "Tool remains supported but is not recommended for new workflows.\nMust remain deprecated before removal."
});

export const TOOL_REGISTRY_REQUIRED_METADATA_FIELDS = Object.freeze([
  "adminOnly",
  "deferred",
  "hidden",
  "progressChecklist",
  "requiredForPlayable",
  "requiredForPublish",
  "requiredForTestable",
  "requires",
  "status",
  "visibleInToolsList"
]);

const READINESS_BY_STATUS = Object.freeze({
  Ready: "Yes",
  Wireframe: "No",
  "Under Construction": "No",
  Planned: "No",
  Hidden: "No",
  Deprecated: "No",
  beta: "Yes"
});

const RELEASE_CHANNEL_BY_STATUS = Object.freeze({
  Ready: "beta",
  Wireframe: "planned",
  "Under Construction": "beta",
  Planned: "planned",
  Hidden: "planned",
  Deprecated: "deprecated",
  beta: "beta"
});

export const TOOL_REGISTRY = Object.freeze([
  {
    "id": "idea-board",
    "name": "Idea Board",
    "displayName": "Idea Board",
    "shortDescription": "Capture, compare, and shape game ideas.",
    "shortLabel": "Idea Board",
    "path": "idea-board",
    "folderName": "idea-board",
    "entryPoint": "idea-board/index.html",
    "badge": "/assets/theme-v2/images/badges/game-design.png",
    "tool": "/assets/theme-v2/images/tools/game-design.png",
    "description": "Capture, compare, and shape game ideas.",
    "category": "Idea",
    "colorGroup": "tool-group-idea",
    "active": true,
    "order": 45,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Ready",
    "releaseChannel": "complete",
    "progressChecklist": [
      "Idea table workflow visible",
      "Add Idea and Add Note actions remain inline",
      "Ready ideas show project actions in their row"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Create"
  },
  {
    "id": "ai-assistant",
    "name": "AI Command Center",
    "displayName": "AI Command Center",
    "shortDescription": "Learn AI, review creator examples, and plan Foundry Bot help across tools.",
    "shortLabel": "AI Command Center",
    "path": "ai-assistant",
    "folderName": "ai-assistant",
    "entryPoint": "ai-assistant/index.html",
    "badge": "/assets/theme-v2/images/badges/ai-assistant.png",
    "tool": "/assets/theme-v2/images/tools/ai-assistant.png",
    "description": "Learn AI, review creator examples, and plan Foundry Bot help across tools.",
    "category": "AI",
    "colorGroup": "tool-group-ai",
    "active": true,
    "order": 15,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static planned text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Create"
  },
  {
    "id": "game-hub",
    "name": "Game Hub",
    "displayName": "Game Hub",
    "shortDescription": "Coordinate Build, Play, and Share readiness for one game project.",
    "shortLabel": "Game Hub",
    "path": "game-hub",
    "folderName": "game-hub",
    "entryPoint": "game-hub/index.html",
    "badge": "/assets/theme-v2/images/badges/game-hub.png",
    "tool": "/assets/theme-v2/images/tools/game-hub.png",
    "description": "Coordinate Build, Play, and Share readiness for one game project.",
    "category": "Build/Create",
    "colorGroup": "tool-group-build",
    "active": true,
    "order": 1,
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Ready",
    "releaseChannel": "complete",
    "progressChecklist": [
      "Review readiness",
      "Static planned text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Build"
  },
  {
    "id": "game-journey",
    "name": "Game Journey",
    "displayName": "Game Journey",
    "shortDescription": "Track game notes, nested work rows, status counts, and suggested toolbox handoffs.",
    "shortLabel": "Game Journey",
    "path": "game-journey",
    "folderName": "game-journey",
    "entryPoint": "game-journey/index.html",
    "badge": "/assets/theme-v2/images/badges/game-hub.png",
    "tool": "/assets/theme-v2/images/tools/game-hub.png",
    "description": "Track game notes, nested work rows, status counts, and suggested toolbox handoffs.",
    "category": "Build/Create",
    "colorGroup": "tool-group-build",
    "active": true,
    "order": 14,
    "requiredForPlayable": false,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [
      "game-hub"
    ],
    "status": "beta",
    "releaseChannel": "beta",
    "progressChecklist": [
      "Open Game Hub",
      "Review game-scoped notes",
      "Track open journey rows"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Build"
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
    "order": 2,
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [
      "game-hub"
    ],
    "status": "Ready",
    "releaseChannel": "beta",
    "progressChecklist": [
      "Review readiness",
      "Static planned text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Build"
  },
  {
    "id": "messages",
    "name": "Message Studio",
    "displayName": "Message Studio",
    "shortDescription": "Create and manage reusable game text and future speech content.",
    "shortLabel": "Message Studio",
    "path": "messages",
    "folderName": "messages",
    "entryPoint": "messages/index.html",
    "badge": "/assets/theme-v2/images/badges/game-design.png",
    "tool": "/assets/theme-v2/images/tools/game-design.png",
    "description": "Create, organize, and manage game dialog, narration, quest text, tutorials, notifications, and future Text To Speech content.",
    "category": "Design",
    "colorGroup": "tool-group-design",
    "active": true,
    "order": 3,
    "requiredForPlayable": false,
    "requiredForTestable": true,
    "requiredForPublish": false,
    "requires": [
      "game-design"
    ],
    "status": "beta",
    "releaseChannel": "beta",
    "progressChecklist": [
      "Message Studio Local API available",
      "Emotion profiles seed server-side",
      "Message text persists exactly as entered"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Content"
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
    "order": 5,
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [
      "game-design"
    ],
    "status": "Ready",
    "releaseChannel": "beta",
    "progressChecklist": [
      "Review readiness",
      "Static planned text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "navigation": {
      "nextGroup": "Design",
      "nextToolIds": [
        "assets",
        "tags",
        "colors",
        "fonts",
        "sprites",
        "characters",
        "objects",
        "worlds",
        "animations"
      ]
    },
    "toolboxGroup": "Build"
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
    "order": 4,
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [
      "game-configuration"
    ],
    "status": "Ready",
    "releaseChannel": "beta",
    "progressChecklist": [
      "Game Configuration handoff checked",
      "Mock asset library available",
      "Import preview workflow validates path-based asset records"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Content"
  },
  {
    "id": "tags",
    "name": "Tags",
    "displayName": "Tags",
    "shortDescription": "Manage shared Game Hub tags for assets and tool records.",
    "shortLabel": "Tags",
    "path": "tags",
    "folderName": "tags",
    "entryPoint": "tags/index.html",
    "badge": "/assets/theme-v2/images/badges/tags.png",
    "tool": "/assets/theme-v2/images/tools/tags.png",
    "description": "Manage shared Game Hub tags for assets and tool records.",
    "category": "Design",
    "colorGroup": "tool-group-design",
    "active": true,
    "order": 13,
    "requiredForPlayable": false,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [
      "game-hub"
    ],
    "status": "beta",
    "releaseChannel": "beta",
    "progressChecklist": [
      "Shared workspace tag table available",
      "Usage count references asset records",
      "Assets consume tag references from shared Tags"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Content"
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
    "order": 3,
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Ready",
    "releaseChannel": "complete",
    "progressChecklist": [
      "Project palette runtime available",
      "Curated collection/type/variant swatches available",
      "Palette generator controls render live preview",
      "Project palette tag batching available"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Content"
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
    "order": 16,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": true,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static planned text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Content"
  },
  {
    "id": "sprites",
    "name": "Sprite Creator",
    "displayName": "Sprite Creator",
    "shortDescription": "Shape game-ready sprites with a focused workspace for drawing, details, and animation planning.",
    "shortLabel": "Sprites",
    "path": "sprites",
    "folderName": "sprites",
    "entryPoint": "sprites/index.html",
    "badge": "/assets/theme-v2/images/badges/sprites.png",
    "tool": "/assets/theme-v2/images/tools/sprites.png",
    "description": "Shape game-ready sprites with a focused workspace for drawing, details, and animation planning.",
    "category": "Design",
    "colorGroup": "tool-group-design",
    "active": true,
    "order": 17,
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Sprite Creator shell visible",
      "Drawing tools panel visible",
      "Pixel work area visible",
      "Details and animation panel visible"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Content"
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
    "order": 18,
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static planned text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Create"
  },
  {
    "id": "objects",
    "name": "Objects",
    "displayName": "Objects",
    "shortDescription": "Create game objects with types, state, and sprite assets.",
    "shortLabel": "Objects",
    "path": "objects",
    "folderName": "objects",
    "entryPoint": "objects/index.html",
    "badge": "/assets/theme-v2/images/badges/objects.png",
    "tool": "/assets/theme-v2/images/tools/objects.png",
    "description": "Create game objects with types, state, and sprite assets.",
    "category": "Design",
    "colorGroup": "tool-group-design",
    "active": true,
    "order": 6,
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "beta",
    "releaseChannel": "beta",
    "progressChecklist": [
      "Editable object table available",
      "Inline row add, save, cancel, edit, and trash actions available",
      "Sprite asset linking available for saved Sprite rows"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Create",
    "capabilityLabel": "Object types",
    "childCapabilities": [
      "Static",
      "Dynamic",
      "Collectible",
      "Hazard",
      "Goal"
    ]
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
    "order": 19,
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Not implemented yet",
      "Static shell exists for planning review"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Create",
    "capabilityLabel": "Planned world types",
    "childCapabilities": [
      "Vector",
      "Tilemap",
      "Isometric",
      "Hex"
    ]
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
    "order": 20,
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": false,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Not implemented yet",
      "Static shell exists for planning review"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Create"
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
    "order": 21,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static planned text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Media"
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
    "order": 22,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static planned text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Media"
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
    "order": 23,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static planned text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Media"
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
    "order": 24,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static planned text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Media"
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
    "order": 25,
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [
      "game-configuration"
    ],
    "status": "Deprecated",
    "releaseChannel": "deprecated",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Build"
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
    "order": 12,
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [
      "build-game"
    ],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Test"
  },
  {
    "id": "controls",
    "name": "Controls",
    "displayName": "Controls",
    "shortDescription": "Define game controls with normalized actions.",
    "shortLabel": "Controls",
    "path": "controls",
    "folderName": "controls",
    "entryPoint": "controls/index.html",
    "badge": "/assets/theme-v2/images/badges/controls.png",
    "tool": "/assets/theme-v2/images/tools/controls.png",
    "description": "Define game controls with normalized actions and event timing.",
    "category": "Platform",
    "colorGroup": "tool-group-platform",
    "active": true,
    "order": 7,
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Wireframe",
    "releaseChannel": "wireframe",
    "progressChecklist": [
      "Define normalized game controls",
      "Keep physical input profiles in Account User Controls",
      "Persist game mappings through shared DB adapter"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Test"
  },
  {
    "id": "input-mapping-v2",
    "name": "Input Mapping V2",
    "displayName": "Input Mapping V2",
    "shortDescription": "Deprecated route that now points creators to Controls.",
    "shortLabel": "Input Mapping V2",
    "path": "input-mapping-v2",
    "folderName": "input-mapping-v2",
    "entryPoint": "input-mapping-v2/index.html",
    "badge": "/assets/theme-v2/images/badges/controls.png",
    "tool": "/assets/theme-v2/images/tools/controls.png",
    "description": "Deprecated route. Controls is the authoritative tool for input mappings, controller profiles, device detection, and mapping persistence.",
    "category": "Platform",
    "colorGroup": "tool-group-platform",
    "active": true,
    "order": 44,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [
      "controls"
    ],
    "status": "Deprecated",
    "releaseChannel": "deprecated",
    "progressChecklist": [
      "Deprecated route retained",
      "Launch Controls for current editing",
      "Remove route in a future removal PR"
    ],
    "deferred": false,
    "hidden": true,
    "adminOnly": false,
    "visibleInToolsList": false,
    "toolboxGroup": "Test"
  },
  {
    "id": "hitboxes",
    "name": "Hitboxes",
    "displayName": "Hitboxes",
    "shortDescription": "Define collision, hurtbox, and interaction region workflows.",
    "shortLabel": "Hitboxes",
    "path": "hitboxes",
    "folderName": "hitboxes",
    "entryPoint": "hitboxes/index.html",
    "badge": "/assets/theme-v2/images/badges/hitboxes.png",
    "tool": "/assets/theme-v2/images/tools/hitboxes.png",
    "description": "Define collision, hurtbox, and interaction region workflows.",
    "category": "Platform",
    "colorGroup": "tool-group-platform",
    "active": true,
    "order": 8,
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Under Construction",
    "releaseChannel": "beta",
    "progressChecklist": [
      "Theme V2 page shell",
      "External JS foundation",
      "Local API contract placeholders",
      "Drawing and editing deferred"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Test"
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
    "order": 10,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Wireframe",
    "releaseChannel": "wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Account"
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
    "order": 11,
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Test"
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
    "order": 26,
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Test"
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
    "order": 9,
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static planned text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Test"
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
    "order": 13,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": true,
    "requires": [
      "game-testing"
    ],
    "status": "Planned",
    "progressChecklist": [
      "Review readiness",
      "Static planned text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Share"
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
    "order": 27,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [
      "publish"
    ],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static planned text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Share"
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
    "order": 28,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [
      "publish"
    ],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static planned text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Share"
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
    "order": 29,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [
      "publish"
    ],
    "status": "Wireframe",
    "releaseChannel": "wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static planned text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Share"
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
    "order": 30,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Wireframe",
    "releaseChannel": "wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static planned text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Account"
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
    "order": 31,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static planned text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Account"
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
    "order": 32,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [
      "publish"
    ],
    "status": "Hidden",
    "progressChecklist": [
      "Hidden planned capability",
      "Static planned text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Share",
    "subgroup": "Hidden planned"
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
    "order": 33,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Hidden",
    "progressChecklist": [
      "Hidden planned capability",
      "Static planned text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Build",
    "subgroup": "Hidden planned"
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
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Hidden",
    "progressChecklist": [
      "Hidden planned capability",
      "Static planned text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Media",
    "subgroup": "Hidden planned"
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
    "category": "Design",
    "colorGroup": "tool-group-design",
    "active": true,
    "order": 35,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Hidden",
    "progressChecklist": [
      "Hidden planned capability",
      "Static planned text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Content",
    "subgroup": "Hidden planned"
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
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Hidden",
    "progressChecklist": [
      "Hidden planned capability",
      "Static planned text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Media",
    "subgroup": "Hidden planned"
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
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Hidden",
    "progressChecklist": [
      "Hidden planned capability",
      "Static planned text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Media",
    "subgroup": "Hidden planned"
  },
  {
    "id": "text-to-speech",
    "name": "Text To Speech",
    "displayName": "Text To Speech",
    "shortDescription": "Preview spoken game text with local browser speech synthesis.",
    "shortLabel": "Text To Speech",
    "path": "text-to-speech",
    "folderName": "text-to-speech",
    "entryPoint": "text-to-speech/index.html",
    "badge": "/assets/theme-v2/images/badges/text-to-speech.png",
    "tool": "/assets/theme-v2/images/tools/text-to-speech.png",
    "description": "Preview spoken game text with local browser speech synthesis, selectable browser voices, and rate, pitch, and volume controls.",
    "category": "Audio",
    "colorGroup": "tool-group-audio",
    "active": true,
    "order": 38,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "beta",
    "releaseChannel": "beta",
    "progressChecklist": [
      "Browser Web Speech API preview",
      "Creator text entry",
      "Browser voice selection",
      "Rate, pitch, and volume controls",
      "Speak and Stop actions"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Audio",
    "subgroup": "Voice"
  },
  {
    "id": "learn",
    "name": "Creator Learning",
    "displayName": "Creator Learning",
    "shortDescription": "Plan tutorials, examples, docs, and creator guidance workflows.",
    "shortLabel": "Creator Learning",
    "path": "learn",
    "folderName": "learn",
    "entryPoint": "learn/index.html",
    "route": "learn/index.html",
    "badge": "/assets/theme-v2/images/badges/learn.png",
    "tool": "/assets/theme-v2/images/tools/learn.png",
    "description": "Plan tutorials, examples, docs, and creator guidance workflows.",
    "category": "Marketplace",
    "colorGroup": "tool-group-marketplace",
    "active": true,
    "order": 39,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Planned",
    "progressChecklist": [
      "Creator learning hub available",
      "Static planned text only"
    ],
    "deferred": true,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Share",
    "subgroup": "Planned"
  },
  {
    "id": "users",
    "name": "Game Crew",
    "displayName": "Game Crew",
    "shortDescription": "Plan game-level crew assignments for the active game.",
    "shortLabel": "Game Crew",
    "path": "game-crew",
    "folderName": "game-crew",
    "entryPoint": "game-crew/index.html",
    "badge": "/assets/theme-v2/images/badges/users.png",
    "tool": "/assets/theme-v2/images/tools/users.png",
    "description": "Plan game-level crew assignments for the active game. Studio Team remains the account-level roster.",
    "category": "Create",
    "colorGroup": "tool-group-game-create",
    "active": true,
    "order": 40,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Planned",
    "progressChecklist": [
      "Game-level crew assignment planning",
      "Static planned text only"
    ],
    "deferred": true,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true,
    "toolboxGroup": "Create",
    "subgroup": "Game crew planning"
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
    "order": 41,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Planned",
    "progressChecklist": [
      "Admin-only planned capability",
      "Static planned text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": true,
    "visibleInToolsList": false,
    "toolboxGroup": "Admin",
    "subgroup": "Admin planned"
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
    "order": 42,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Planned",
    "progressChecklist": [
      "Admin-only planned capability",
      "Static planned text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": true,
    "visibleInToolsList": false,
    "toolboxGroup": "Admin",
    "subgroup": "Admin planned"
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
    "order": 43,
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Planned",
    "progressChecklist": [
      "Admin-only planned capability",
      "Static planned text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": true,
    "visibleInToolsList": false,
    "toolboxGroup": "Admin",
    "subgroup": "Admin planned"
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
  "/assets/theme-v2/images/badges/game-hub.png",
  "/assets/theme-v2/images/badges/publish-studio.png",
  "/assets/theme-v2/images/badges/publish.png",
  "/assets/theme-v2/images/badges/ratings.png",
  "/assets/theme-v2/images/badges/saved-data.png",
  "/assets/theme-v2/images/badges/settings-studio.png",
  "/assets/theme-v2/images/badges/sound-studio.png",
  "/assets/theme-v2/images/badges/speech-to-text.png",
  "/assets/theme-v2/images/badges/sprites.png",
  "/assets/theme-v2/images/badges/storage-inspector.png",
  "/assets/theme-v2/images/badges/tags.png",
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
  "/assets/theme-v2/images/tools/game-hub.png",
  "/assets/theme-v2/images/tools/publish-studio.png",
  "/assets/theme-v2/images/tools/publish.png",
  "/assets/theme-v2/images/tools/ratings.png",
  "/assets/theme-v2/images/tools/saved-data.png",
  "/assets/theme-v2/images/tools/settings-studio.png",
  "/assets/theme-v2/images/tools/sound-studio.png",
  "/assets/theme-v2/images/tools/speech-to-text.png",
  "/assets/theme-v2/images/tools/sprites.png",
  "/assets/theme-v2/images/tools/storage-inspector.png",
  "/assets/theme-v2/images/tools/tags.png",
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

function cloneToolRegistryEntry(tool) {
  const cloned = {
    ...tool,
    progressChecklist: Array.isArray(tool.progressChecklist) ? [...tool.progressChecklist] : [],
    requires: Array.isArray(tool.requires) ? [...tool.requires] : [],
    visibility: {
      adminOnly: tool.adminOnly === true,
      deferred: tool.deferred === true,
      hidden: tool.hidden === true,
      visibleInToolsList: tool.visibleInToolsList === true
    }
  };

  if (tool.navigation) {
    cloned.navigation = {
      ...tool.navigation,
      previousToolIds: Array.isArray(tool.navigation.previousToolIds) ? [...tool.navigation.previousToolIds] : tool.navigation.previousToolIds,
      nextToolIds: Array.isArray(tool.navigation.nextToolIds) ? [...tool.navigation.nextToolIds] : tool.navigation.nextToolIds
    };
  }

  return applyToolRegistryMetadata(cloned);
}

export function getToolProgressReadiness(status) {
  return READINESS_BY_STATUS[status] || "No";
}

export function getToolReleaseChannel(toolOrChannel) {
  if (typeof toolOrChannel === "string") {
    const normalizedChannel = toolOrChannel.trim().toLowerCase();
    return TOOL_RELEASE_CHANNELS.includes(normalizedChannel) ? normalizedChannel : "planned";
  }
  const explicitChannel = typeof toolOrChannel?.releaseChannel === "string"
    ? toolOrChannel.releaseChannel.trim().toLowerCase()
    : "";
  if (TOOL_RELEASE_CHANNELS.includes(explicitChannel)) {
    return explicitChannel;
  }
  return RELEASE_CHANNEL_BY_STATUS[toolOrChannel?.status] || "planned";
}

export function getToolReleaseChannelLabel(toolOrChannel) {
  return TOOL_RELEASE_CHANNEL_LABELS[getToolReleaseChannel(toolOrChannel)] || TOOL_RELEASE_CHANNEL_LABELS.planned;
}

export function getToolReleaseChannelHelpText(toolOrChannel) {
  return TOOL_RELEASE_CHANNEL_HELP_TEXT[getToolReleaseChannel(toolOrChannel)] || TOOL_RELEASE_CHANNEL_HELP_TEXT.planned;
}

export function getMissingToolRegistryFields(tool) {
  if (!tool) {
    return [...TOOL_REGISTRY_REQUIRED_METADATA_FIELDS];
  }

  return TOOL_REGISTRY_REQUIRED_METADATA_FIELDS.filter((field) => {
    if (field === "progressChecklist" || field === "requires") {
      return !Array.isArray(tool[field]);
    }
    if (field === "status") {
      return !TOOL_STATUS_MODEL.includes(tool.status);
    }
    return typeof tool[field] !== "boolean";
  });
}

export function applyToolRegistryMetadata(tool) {
  const missingFields = getMissingToolRegistryFields(tool);
  const hasMissingMetadata = missingFields.length > 0;
  const releaseChannel = getToolReleaseChannel(tool);
  return {
    ...tool,
    adminOnly: tool?.adminOnly === true || hasMissingMetadata,
    deferred: tool?.deferred === true || hasMissingMetadata,
    hidden: tool?.hidden === true || hasMissingMetadata,
    missingStatusFields: missingFields,
    missingStatusMetadata: hasMissingMetadata,
    progressChecklist: Array.isArray(tool?.progressChecklist) ? [...tool.progressChecklist] : [],
    readiness: getToolProgressReadiness(tool?.status),
    releaseChannel,
    releaseChannelHelpText: getToolReleaseChannelHelpText(releaseChannel),
    releaseChannelLabel: getToolReleaseChannelLabel(releaseChannel),
    requiredForPlayable: tool?.requiredForPlayable === true,
    requiredForPublish: tool?.requiredForPublish === true,
    requiredForTestable: tool?.requiredForTestable === true,
    requiredRole: typeof tool?.requiredRole === "string" ? tool.requiredRole.trim().toLowerCase() : "",
    requires: Array.isArray(tool?.requires) ? [...tool.requires] : [],
    status: TOOL_STATUS_MODEL.includes(tool?.status) ? tool.status : "Missing Metadata",
    visibility: {
      adminOnly: tool?.adminOnly === true || hasMissingMetadata,
      deferred: tool?.deferred === true || hasMissingMetadata,
      hidden: tool?.hidden === true || hasMissingMetadata,
      visibleInToolsList: tool?.visibleInToolsList === true && !hasMissingMetadata
    },
    visibleInToolsList: tool?.visibleInToolsList === true && !hasMissingMetadata
  };
}

export function toolRegistryMetadataDiagnostic(tool) {
  if (!tool?.missingStatusMetadata) {
    return "";
  }

  const fields = Array.isArray(tool.missingStatusFields) && tool.missingStatusFields.length
    ? tool.missingStatusFields.join(", ")
    : "status metadata";
  return `Missing Toolbox registry metadata: ${fields}.`;
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
  return TOOL_REGISTRY.map(cloneToolRegistryEntry);
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

export function getToolRoute(tool) {
  if (typeof tool?.route === "string" && tool.route.trim() !== "") {
    return tool.route.trim().replace(/^\/+/, "");
  }
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
