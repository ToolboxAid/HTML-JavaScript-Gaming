import {
    PROJECT_WORKSPACE_MEMBER_ROLES,
    createProjectWorkspaceMockRepository
} from "./project-workspace/project-workspace-mock-repository.js";
import {
    TOOL_IMAGE_FALLBACK,
    getToolImageSource,
    getToolRegistry
} from "./toolRegistry.js";

(function () {
    const list = document.querySelector("[data-tools-accordion-list]");
    if (!list) {
        return;
    }

    const orderButton = document.querySelector("[data-tools-order]");
    const groupedButton = document.querySelector("[data-tools-sort='grouped']");
    const buildPathButton = document.querySelector("[data-tools-view='build-path']");
    const roleBanner = document.querySelector("[data-toolbox-role-banner]");
    const projectDataMenu = document.querySelector("[data-project-data-menu]");
    const projectDataStatus = document.querySelector("[data-project-data-status]");
    const toolCount = document.querySelector("[data-tools-count]");
    const searchParams = new URLSearchParams(window.location.search);
    const urlRole = searchParams.get("role");
    const toolboxRole = urlRole === "admin" ? "admin" : urlRole === "user" ? "creator" : "guest";
    const projectWorkspaceRepository = createProjectWorkspaceMockRepository();
    projectWorkspaceRepository.resetProjectData();
    const urlMemberRole = searchParams.get("memberRole");
    const defaultProjectMemberRole = "Owner";
    const projectMemberRole = PROJECT_WORKSPACE_MEMBER_ROLES.includes(urlMemberRole)
        ? urlMemberRole
        : defaultProjectMemberRole;
    let currentMode = searchParams.get("view") === "group" ? "grouped" : searchParams.get("view") === "build-path" ? "build-path" : "ascending";
    let targetGroupSlug = currentMode === "grouped" ? groupSlug(searchParams.get("group")) : "";
    const statusLabelMap = Object.freeze({
        complete: "Ready",
        ready: "Wireframe",
        "in-progress": "Under Construction",
        locked: "Planned"
    });
    const buildPathStatusIndicators = Object.freeze({
        complete: "🟢 Complete",
        "in-progress": "🟡 In Progress",
        "not-started": "🔴 Not Started",
        "not-applicable": "⚪ N/A"
    });
    const buildPathAlwaysRequired = Object.freeze([
        "Project Workspace",
        "Game Design",
        "Game Configuration",
        "Build Game",
        "Game Testing",
        "Publish"
    ]);
    const progressRequirements = Object.freeze({
        "Game Design": ["Project Workspace"],
        "Game Configuration": ["Game Design"],
        "Build Game": ["Game Configuration"],
        "Game Testing": ["Build Game"],
        Publish: ["Game Testing"],
        Marketplace: ["Publish"],
        Community: ["Publish"],
        Languages: ["Publish"],
        Cloud: ["Publish"]
    });
    const roleFocusTools = Object.freeze({
        Owner: null,
        Designer: ["Project Workspace", "Game Design", "Game Configuration", "Objects", "Worlds", "Characters", "Colors", "Assets"],
        "World Builder": ["Worlds", "Objects", "Assets", "Colors", "Animations"],
        Artist: ["Assets", "Colors", "Fonts", "Sprites", "Characters", "Objects", "Animations"],
        "Audio Creator": ["Audio", "Music", "Voices", "MIDI", "Audio Effects", "Voice Capture", "Voice Output", "Assets"],
        Translator: ["Languages", "Voices", "Voice Capture", "Voice Output"],
        Tester: ["Game Testing", "Controls", "Hitboxes", "Debug", "Performance", "Events"],
        Publisher: ["Publish", "Marketplace", "Community", "Cloud", "Languages"],
        Viewer: ["Project Workspace", "Game Design", "Game Configuration", "Objects", "Worlds", "Assets", "Colors", "Audio", "Publish", "Marketplace", "Community", "Languages", "Achievements", "Ratings"]
    });
    const registryToolsByTitle = new Map(getToolRegistry().map((tool) => [tool.displayName || tool.name, tool]));
    const toolGroups = [
        {
                "group": "Create",
                "tools": [
                        {
                                "title": "Objects",
                                "href": "../toolbox/objects/index.html",
                                "description": "Design reusable game objects and object-ready assets.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ],
                                "capabilityLabel": "Planned object types",
                                "childCapabilities": [
                                        "Vector",
                                        "Sprite",
                                        "Character",
                                        "Enemy",
                                        "Interactive"
                                ]
                        },
                        {
                                "title": "Characters",
                                "href": "../toolbox/characters/index.html",
                                "description": "Plan player, NPC, and character asset workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "in-progress",
                                "progressChecklist": [
                                        "Valid Game Design handoff required",
                                        "Configuration sections required before Build Game",
                                        "Ready configuration recommends Assets"
                                ]
                        },
                        {
                                "title": "Worlds",
                                "href": "../toolbox/worlds/index.html",
                                "description": "Shape world layouts, maps, terrain, and scene geometry.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "in-progress",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ],
                                "capabilityLabel": "Planned world types",
                                "childCapabilities": [
                                        "Vector",
                                        "Tilemap",
                                        "Isometric",
                                        "Hex"
                                ]
                        },
                        {
                                "title": "Animations",
                                "href": "../toolbox/animations/index.html",
                                "description": "Plan character and object animation states.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": false,
                                "status": "in-progress",
                                "progressChecklist": [
                                        "Project purpose context required",
                                        "Game type, genre, and play style required",
                                        "Validation overlay hands off to Game Configuration"
                                ]
                        },
                        {
                                "title": "AI Assistant",
                                "href": "../toolbox/ai-assistant/index.html",
                                "description": "Get guided technical help for game creation workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        }
                ]
        },
        {
                "group": "Build",
                "tools": [
                        {
                                "title": "Project Workspace",
                                "href": "../toolbox/project-workspace/index.html",
                                "description": "Coordinate Build, Play, and Share readiness for one game project.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "in-progress",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Game Design",
                                "href": "../toolbox/game-design/index.html",
                                "description": "Plan gameplay, systems, rules, and player experience.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "in-progress",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Game Configuration",
                                "href": "../toolbox/game-configuration/index.html",
                                "description": "Plan release profile, debug visibility, and playable readiness gates.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Build Game",
                                "href": "../toolbox/build-game/index.html",
                                "description": "Plan build packaging and playable output readiness.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "locked",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Custom Extensions",
                                "href": "../toolbox/code/index.html",
                                "description": "Hidden capability shell for approved extension hooks and creator-private custom logic.",
                                "role": "Hidden Preview",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "subgroup": "Hidden planned",
                                "adminOnly": false,
                                "hidden": true,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Hidden planned capability",
                                        "Static wireframe text only"
                                ]
                        }
                ]
        },
        {
                "group": "Content",
                "tools": [
                        {
                                "title": "Assets",
                                "href": "../toolbox/assets/index.html",
                                "description": "Create sprites, animations, vectors, and palettes.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "in-progress",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Colors",
                                "href": "../toolbox/colors/index.html",
                                "description": "Craft and manage color palettes for your games.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "complete",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Fonts",
                                "href": "../toolbox/fonts/index.html",
                                "description": "Plan game typography, font loading, and readable text choices.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Sprites",
                                "href": "../toolbox/sprites/index.html",
                                "description": "Plan sprite creation, review, and game-ready export workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        }
                ]
        },
        {
                "group": "Media",
                "tools": [
                        {
                                "title": "Audio",
                                "href": "../toolbox/audio/index.html",
                                "description": "Plan game audio, effects, and playback readiness.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "bot",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Music",
                                "href": "../toolbox/music/index.html",
                                "description": "Plan reusable music and soundtrack workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "bot",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Voices",
                                "href": "../toolbox/voices/index.html",
                                "description": "Plan character voice, spoken output, and voice review workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "bot",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Videos",
                                "href": "../toolbox/videos/index.html",
                                "description": "Plan trailer, cutscene, and video asset workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "bot",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "MIDI",
                                "href": "../toolbox/midi/index.html",
                                "description": "Hidden capability shell for MIDI-driven audio and music interaction flows.",
                                "role": "Hidden Preview",
                                "mascot": "foundry-bot",
                                "theme": "bot",
                                "subgroup": "Hidden planned",
                                "adminOnly": false,
                                "hidden": true,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Hidden planned capability",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Particles",
                                "href": "../toolbox/particles/index.html",
                                "description": "Hidden capability shell for visual effects and particle workflows.",
                                "role": "Hidden Preview",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "subgroup": "Hidden planned",
                                "adminOnly": false,
                                "hidden": true,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Hidden planned capability",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Audio Effects",
                                "href": "../toolbox/audio-effects/index.html",
                                "description": "Hidden capability shell for reusable game effect audio workflows.",
                                "role": "Hidden Preview",
                                "mascot": "foundry-bot",
                                "theme": "bot",
                                "subgroup": "Hidden planned",
                                "adminOnly": false,
                                "hidden": true,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Hidden planned capability",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Voice Capture",
                                "href": "../toolbox/speech-to-text/index.html",
                                "description": "Hidden capability shell for spoken input and transcription workflows.",
                                "role": "Hidden Preview",
                                "mascot": "foundry-bot",
                                "theme": "bot",
                                "subgroup": "Hidden planned",
                                "adminOnly": false,
                                "hidden": true,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Hidden planned capability",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Voice Output",
                                "href": "../toolbox/text-to-speech/index.html",
                                "description": "Hidden capability shell for generated narration and spoken output workflows.",
                                "role": "Hidden Preview",
                                "mascot": "foundry-bot",
                                "theme": "bot",
                                "subgroup": "Hidden planned",
                                "adminOnly": false,
                                "hidden": true,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Hidden planned capability",
                                        "Static wireframe text only"
                                ]
                        }
                ]
        },
        {
                "group": "Test",
                "tools": [
                        {
                                "title": "Game Testing",
                                "href": "../toolbox/game-testing/index.html",
                                "description": "Plan test passes, release checks, and playable validation.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "locked",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Controls",
                                "href": "../toolbox/controls/index.html",
                                "description": "Map keyboard, mouse, gamepad, and touch controls.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Hitboxes",
                                "href": "../toolbox/hitboxes/index.html",
                                "description": "Plan collision, hurtbox, and interaction region workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Debug",
                                "href": "../toolbox/debug/index.html",
                                "description": "Plan visible creator debug settings and release gating.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Performance",
                                "href": "../toolbox/performance/index.html",
                                "description": "Plan performance budgets, diagnostics, and readiness checks.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Events",
                                "href": "../toolbox/events/index.html",
                                "description": "Plan gameplay events, triggers, and state transitions.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        }
                ]
        },
        {
                "group": "Share",
                "tools": [
                        {
                                "title": "Publish",
                                "href": "../toolbox/publish/index.html",
                                "description": "Prepare publishing workflows and release-ready game packages.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": true,
                                "status": "locked",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Marketplace",
                                "href": "../toolbox/marketplace/index.html",
                                "description": "Plan marketplace listing, asset, and discovery workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Community",
                                "href": "../toolbox/community/index.html",
                                "description": "Plan creator community, tutorials, sharing, and feedback workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Languages",
                                "href": "../toolbox/languages/index.html",
                                "description": "Plan game language coverage and translation review workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Cloud",
                                "href": "../toolbox/cloud/index.html",
                                "description": "Hidden capability shell for connected storage, sync, and publishing support.",
                                "role": "Hidden Preview",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "subgroup": "Hidden planned",
                                "adminOnly": false,
                                "hidden": true,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Hidden planned capability",
                                        "Static wireframe text only"
                                ]
                        }
                ]
        },
        {
                "group": "Account",
                "tools": [
                        {
                                "title": "Saved Data",
                                "href": "../toolbox/saved-data/index.html",
                                "description": "Inspect and manage saves, local storage, and game data.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "complete",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Achievements",
                                "href": "../toolbox/achievements/index.html",
                                "description": "Plan achievement definitions and creator-facing unlock review.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Ratings",
                                "href": "../toolbox/ratings/index.html",
                                "description": "Plan player ratings, review signals, and quality feedback.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        }
                ]
        }
];
    const groupClassMap = {
        "AI": "tool-group-ai",
        "Audio": "tool-group-audio",
        "Build/Create": "tool-group-build-create",
        "Design": "tool-group-design",
        "Marketplace": "tool-group-marketplace",
        "Platform": "tool-group-platform",
        "Play": "tool-group-play"
};
    const groupSwatchMap = {
        "AI": "swatch-purple",
        "Audio": "swatch-orange",
        "Build/Create": "swatch-red",
        "Design": "swatch-pink",
        "Marketplace": "swatch-gold",
        "Platform": "swatch-blue",
        "Play": "swatch-green"
};
    const toolColorGroups = {
        "AI Assistant": "AI",
        "Audio": "Audio",
        "Audio Effects": "Audio",
        "MIDI": "Audio",
        "Music": "Audio",
        "Particles": "Audio",
        "Voice Capture": "Audio",
        "Voice Output": "Audio",
        "Voices": "Audio",
        "Videos": "Audio",
        "Build Game": "Build/Create",
        "Custom Extensions": "Build/Create",
        "Game Configuration": "Build/Create",
        "Project Workspace": "Build/Create",
        "Animations": "Design",
        "Assets": "Design",
        "Characters": "Design",
        "Colors": "Design",
        "Fonts": "Design",
        "Game Design": "Design",
        "Objects": "Design",
        "Sprites": "Design",
        "Worlds": "Design",
        "Community": "Marketplace",
        "Marketplace": "Marketplace",
        "Publish": "Marketplace",
        "Cloud": "Platform",
        "Controls": "Platform",
        "Debug": "Platform",
        "Events": "Platform",
        "Hitboxes": "Platform",
        "Languages": "Platform",
        "Performance": "Platform",
        "Saved Data": "Platform",
        "Achievements": "Play",
        "Game Testing": "Play",
        "Ratings": "Play"
};
    const defaultProgress = {
        requiredForTestable: false,
        requiredForPublish: false,
        status: "ready",
        progressChecklist: ["Review readiness"]
    };
    function getProjectProgressSummary() {
        const activeProject = projectWorkspaceRepository.getActiveProject();
        const progress = projectWorkspaceRepository.getProjectProgress();
        return {
            activeProjectName: activeProject?.name || "No active project",
            projectProgress: progress.projectProgress,
            publishingProgress: progress.publishingProgress,
            currentFocus: progress.currentFocus,
            recommendedNextTool: progress.recommendedNextTool
        };
    }
    const progressModel = {
        "AI Assistant": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Project Workspace": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "in-progress",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Game Design": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "in-progress",
                "progressChecklist": [
                        "Project purpose context required",
                        "Game type, genre, and play style required",
                        "Validation overlay hands off to Game Configuration"
                ]
        },
        "Game Configuration": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "in-progress",
                "progressChecklist": [
                        "Valid Game Design handoff required",
                        "Configuration sections required before Build Game",
                        "Ready configuration recommends Assets"
                ]
        },
        "Assets": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "in-progress",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Colors": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "complete",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Fonts": {
                "requiredForTestable": false,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Sprites": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Characters": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Objects": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Worlds": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "in-progress",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Animations": {
                "requiredForTestable": true,
                "requiredForPublish": false,
                "status": "in-progress",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Audio": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Music": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Voices": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Videos": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Build Game": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "locked",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Game Testing": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "locked",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Controls": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Hitboxes": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Saved Data": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "complete",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Debug": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Performance": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Events": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Publish": {
                "requiredForTestable": false,
                "requiredForPublish": true,
                "status": "locked",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Marketplace": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Community": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Languages": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Achievements": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Ratings": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Cloud": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Hidden planned capability",
                        "Static wireframe text only"
                ]
        },
        "Custom Extensions": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Hidden planned capability",
                        "Static wireframe text only"
                ]
        },
        "MIDI": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Hidden planned capability",
                        "Static wireframe text only"
                ]
        },
        "Particles": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Hidden planned capability",
                        "Static wireframe text only"
                ]
        },
        "Audio Effects": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Hidden planned capability",
                        "Static wireframe text only"
                ]
        },
        "Voice Capture": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Hidden planned capability",
                        "Static wireframe text only"
                ]
        },
        "Voice Output": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Hidden planned capability",
                        "Static wireframe text only"
                ]
        }
};
    const buildPathGroups = [
        {
                "title": "Project Workspace",
                "groupClass": "tool-group-build-create",
                "note": "Start with the single project surface that coordinates current focus, readiness, and recommended next tool.",
                "tools": [
                        "Project Workspace"
                ]
        },
        {
                "title": "Game Design",
                "groupClass": "tool-group-design",
                "note": "Define gameplay, rules, player experience, and the requirements that shape the build path.",
                "tools": [
                        "Game Design"
                ]
        },
        {
                "title": "Game Configuration",
                "groupClass": "tool-group-build-create",
                "note": "Complete playable setup from a valid Game Design handoff before Assets and Build Game readiness.",
                "tools": [
                        "Game Configuration"
                ]
        },
        {
                "title": "Required Tool Path",
                "groupClass": "tool-group-design",
                "note": "Use readiness fields to identify creator-facing blockers before a playable build.",
                "tools": [
                        "Colors",
                        "Controls",
                        "Assets",
                        "Sprites",
                        "Characters",
                        "Objects",
                        "Worlds",
                        "Animations",
                        "Audio"
                ]
        },
        {
                "title": "Build Game",
                "groupClass": "tool-group-build-create",
                "note": "Build Game is the package and playable-output checkpoint for this wireframe.",
                "tools": [
                        "Build Game"
                ]
        },
        {
                "title": "Game Testing",
                "groupClass": "tool-group-play",
                "note": "Game Testing collects test readiness, hitboxes, debug policy, performance checks, and event review.",
                "tools": [
                        "Game Testing",
                        "Hitboxes",
                        "Debug",
                        "Performance",
                        "Events"
                ]
        },
        {
                "title": "Publish",
                "groupClass": "tool-group-marketplace",
                "note": "Publish is required for public release; Marketplace, Community, Languages, Achievements, and Ratings support Share readiness.",
                "tools": [
                        "Publish",
                        "Marketplace",
                        "Community",
                        "Languages",
                        "Achievements",
                        "Ratings"
                ]
        }
];
    function compareByTitle(left, right) {
        return left.title.localeCompare(right.title);
    }

    function compareByGroup(left, right) {
        return left.group.localeCompare(right.group);
    }

    function colorGroupForTool(tool) {
        return toolColorGroups[tool.title] || "Platform";
    }

    function normalizeToolStatus(tool) {
        if (tool.status === "Deprecated") {
            return "Deprecated";
        }
        if (tool.hidden === true) {
            return "Hidden";
        }
        return statusLabelMap[tool.status] || tool.status || "Wireframe";
    }

    function baseVisibleForCreator(tool) {
        return tool.adminOnly !== true && tool.hidden !== true && tool.planned !== true;
    }

    function activeRoleFocus() {
        if (toolboxRole === "admin") {
            return "Owner";
        }
        return projectMemberRole;
    }

    function isFocusedRoleView() {
        return toolboxRole !== "admin" && activeRoleFocus() !== "Owner";
    }

    function isVisibleForRole(tool) {
        if (toolboxRole === "admin") {
            return true;
        }

        const focusedTools = roleFocusTools[activeRoleFocus()];

        if (!focusedTools) {
            return baseVisibleForCreator(tool);
        }

        if (!focusedTools.includes(tool.title)) {
            return false;
        }

        if (activeRoleFocus() === "Viewer") {
            return baseVisibleForCreator(tool);
        }

        return tool.adminOnly !== true;
    }

    function unavailableToolNamesForFocus() {
        if (!isFocusedRoleView()) {
            return [];
        }

        const visibleTitles = new Set(roleAwareTools().map((tool) => tool.title));
        return toolGroups
            .flatMap((group) => group.tools)
            .filter((tool) => tool.adminOnly !== true)
            .map((tool) => tool.title)
            .filter((title, index, titles) => titles.indexOf(title) === index)
            .filter((title) => !visibleTitles.has(title))
            .sort((left, right) => left.localeCompare(right));
    }

    function visibleToolGroups() {
        const groups = new Map();
        toolGroups.flatMap((toolGroup) => toolGroup.tools).filter(isVisibleForRole).forEach((tool) => {
            const groupName = colorGroupForTool(tool);
            if (!groups.has(groupName)) {
                groups.set(groupName, []);
            }
            groups.get(groupName).push({
                ...tool,
                group: groupName
            });
        });
        return Array.from(groups.entries()).map(([group, tools]) => ({
            group,
            tools: tools.sort(compareByTitle)
        })).sort(compareByGroup);
    }

    function roleAwareTools() {
        return visibleToolGroups().flatMap((group) => group.tools.map((tool) => {
            const progress = progressModel[tool.title] || defaultProgress;
            const mergedTool = {
                ...tool,
                group: group.group,
                ...progress
            };
            return {
                ...mergedTool,
                requires: progressRequirements[tool.title] || [],
                status: normalizeToolStatus(mergedTool)
            };
        }));
    }

    function configureRoleBanner() {
        if (!roleBanner) {
            return;
        }
        const nextRole = toolboxRole === "admin" ? "user" : toolboxRole === "creator" ? "admin" : "user";
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set("role", nextRole);
        roleBanner.href = nextUrl.pathname + nextUrl.search + nextUrl.hash;
        if (projectDataMenu) {
            projectDataMenu.hidden = toolboxRole !== "admin";
            if (toolboxRole !== "admin") {
                projectDataMenu.removeAttribute("open");
            }
        }
        if (toolboxRole === "admin") {
            roleBanner.textContent = "ADMIN VIEW • Planned tools visible • Switch to Creator View";
        } else if (toolboxRole === "creator") {
            roleBanner.textContent = "CREATOR VIEW • Project tools enabled • Switch to Admin View";
        } else {
            roleBanner.textContent = "GUEST VIEW • Preview only • Sign in to create";
        }
    }

    function configureProjectDataActions() {
        if (!projectDataMenu || toolboxRole !== "admin") {
            return;
        }

        projectDataMenu.addEventListener("click", (event) => {
            const actionButton = event.target.closest("[data-project-data-action]");
            if (!actionButton) {
                return;
            }

            let actionLabel = "Project Data updated";

            if (actionButton.dataset.projectDataAction === "reset") {
                projectWorkspaceRepository.resetProjectData();
                actionLabel = "Project Data reset";
            } else if (actionButton.dataset.projectDataAction === "seed") {
                projectWorkspaceRepository.seedDemoProject();
                actionLabel = "Demo projects seeded";
            } else if (actionButton.dataset.projectDataAction === "clear") {
                projectWorkspaceRepository.clearTestData();
                actionLabel = "Test data cleared";
            }

            if (projectDataStatus) {
                const activeProject = projectWorkspaceRepository.getActiveProject();
                projectDataStatus.textContent = `${actionLabel}. Active project: ${activeProject?.name || "none"}.`;
            }

            render(currentMode);
        });
    }

    function groupClass(groupName) {
        return groupClassMap[groupName] || "";
    }

    function groupSwatch(groupName) {
        return groupSwatchMap[groupName] || "swatch-orange";
    }

    function groupSlug(groupName) {
        return String(groupName || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function setActiveButton(mode) {
        if (orderButton) {
            orderButton.setAttribute("aria-pressed", String(mode === "ascending" || mode === "descending"));
            orderButton.textContent = `Order ${orderButton.dataset.toolsOrder === "ascending" ? "A-Z" : "Z-A"}`;
        }
        if (groupedButton) {
            groupedButton.setAttribute("aria-pressed", String(mode === "grouped"));
        }
        if (buildPathButton) {
            buildPathButton.setAttribute("aria-pressed", String(mode === "build-path"));
        }
    }

    function getOrderedTools(mode) {
        const tools = roleAwareTools();
        tools.sort((left, right) => left.title.localeCompare(right.title));
        if (mode === "descending") {
            tools.reverse();
        }
        return tools;
    }

    function getGroupedTools() {
        return visibleToolGroups().map((toolGroup) => ({
            title: toolGroup.group,
            tools: toolGroup.tools.map((tool) => ({
                ...tool,
                group: toolGroup.group
            })),
            groupClass: groupClass(toolGroup.group)
        }));
    }

    function sourceToolByTitle(title) {
        for (const group of toolGroups) {
            const tool = group.tools.find((candidate) => candidate.title === title);
            if (tool) {
                const progress = progressModel[tool.title] || defaultProgress;
                const mergedTool = {
                    ...tool,
                    group: colorGroupForTool(tool),
                    ...progress
                };
                return {
                    ...mergedTool,
                    requires: progressRequirements[tool.title] || [],
                    status: normalizeToolStatus(mergedTool)
                };
            }
        }
        return null;
    }

    function isRequiredForCurrentBuildPath(tool) {
        if (tool.title === "Publish") {
            return true;
        }
        if (buildPathAlwaysRequired.includes(tool.title)) {
            return true;
        }
        if (!isFocusedRoleView()) {
            return true;
        }
        const focusTools = roleFocusTools[activeRoleFocus()];
        return !Array.isArray(focusTools) || focusTools.includes(tool.title);
    }

    function buildPathStatusForTool(tool, activeProject) {
        if (!isRequiredForCurrentBuildPath(tool)) {
            return "not-applicable";
        }
        if (tool.title === "Project Workspace") {
            return activeProject ? "complete" : "not-started";
        }
        if (!activeProject) {
            return "not-started";
        }
        if (tool.status === "Complete") {
            return "complete";
        }
        if (tool.status === "Ready" || tool.status === "Wireframe" || tool.status === "Under Construction") {
            return "in-progress";
        }
        return "not-started";
    }

    function buildPathCompleteLabel(status) {
        if (status === "complete") {
            return "Yes";
        }
        if (status === "not-applicable") {
            return "N/A";
        }
        return "No";
    }

    function getBuildPathRows() {
        const activeProject = projectWorkspaceRepository.getActiveProject();
        let order = 0;
        return buildPathGroups.flatMap((group) => group.tools.map((title) => {
            const tool = sourceToolByTitle(title);
            if (!tool) {
                return null;
            }
            const status = buildPathStatusForTool(tool, activeProject);
            order += 1;
            return {
                complete: buildPathCompleteLabel(status),
                order,
                status,
                statusLabel: buildPathStatusIndicators[status],
                tool
            };
        }).filter(Boolean));
    }

    function createBuildPathSummary() {
        const projectProgressSummary = getProjectProgressSummary();
        const article = document.createElement("article");
        article.className = "callout";

        const title = document.createElement("h3");
        title.textContent = "Build Path Guidance";

        const activeProject = document.createElement("p");
        activeProject.textContent = "Active Project: " + projectProgressSummary.activeProjectName;

        const nextAction = document.createElement("p");
        nextAction.textContent = "What should I do next? " + projectProgressSummary.recommendedNextTool;

        const projectCompletion = document.createElement("p");
        projectCompletion.textContent = "Project Completion: " + projectProgressSummary.projectProgress;

        const publishingProgress = document.createElement("p");
        publishingProgress.textContent = "Publishing Progress: " + projectProgressSummary.publishingProgress;

        const currentFocus = document.createElement("p");
        currentFocus.textContent = "Current Focus: " + projectProgressSummary.currentFocus;

        const direction = document.createElement("p");
        direction.textContent = "Work top-to-bottom and left-to-right through the workflow table.";

        article.append(title, activeProject, nextAction, projectCompletion, publishingProgress, currentFocus, direction);
        return article;
    }

    function createTableCell(tagName, text) {
        const cell = document.createElement(tagName);
        cell.textContent = text;
        return cell;
    }

    function createBuildPathTable() {
        const wrapper = document.createElement("div");
        wrapper.className = "table-wrapper";
        wrapper.dataset.buildPathTable = "workflow";

        const table = document.createElement("table");
        table.className = "data-table";
        table.setAttribute("aria-label", "Build Path workflow status");

        const caption = document.createElement("caption");
        caption.textContent = "Project Build Path";

        const head = document.createElement("thead");
        const headRow = document.createElement("tr");
        ["Order", "Tool", "Status", "Complete"].forEach((heading) => {
            headRow.append(createTableCell("th", heading));
        });
        head.append(headRow);

        const body = document.createElement("tbody");
        getBuildPathRows().forEach((row) => {
            const tableRow = document.createElement("tr");
            tableRow.dataset.buildPathTool = row.tool.title;
            tableRow.dataset.buildPathStatus = row.statusLabel;
            tableRow.dataset.buildPathComplete = row.complete;
            tableRow.append(
                createTableCell("td", String(row.order)),
                createTableCell("td", row.tool.title),
                createTableCell("td", row.statusLabel),
                createTableCell("td", row.complete)
            );
            body.append(tableRow);
        });

        table.append(caption, head, body);
        wrapper.append(table);
        return wrapper;
    }

    function createRoleFocusSummary() {
        if (!isFocusedRoleView()) {
            return null;
        }

        const unavailableTools = unavailableToolNamesForFocus();
        const article = document.createElement("article");
        article.className = "callout";
        article.dataset.toolboxRoleFocus = activeRoleFocus();

        const title = document.createElement("h3");
        title.textContent = "Role Focus: " + activeRoleFocus();

        const summary = document.createElement("p");
        summary.textContent = activeRoleFocus() === "Viewer"
            ? "Viewer focus shows preview-safe read-only tiles only."
            : "This wireframe focuses the Toolbox on tools this project role can work on.";

        const explanation = document.createElement("p");
        explanation.textContent = unavailableTools.length
            ? "Unavailable tools are hidden by role focus, not by security enforcement."
            : "All tools for this role are visible.";

        article.append(title, summary, explanation);
        return article;
    }

    function renderWithRoleFocus(...children) {
        const roleFocusSummary = createRoleFocusSummary();
        list.replaceChildren(...(roleFocusSummary ? [roleFocusSummary, ...children] : children));
    }

    function updateToolCount() {
        if (!toolCount) {
            return;
        }
        const visibleCount = roleAwareTools().length;
        const totalCount = toolGroups.flatMap((group) => group.tools).length;
        toolCount.textContent = `Tool Count: ${visibleCount}/${totalCount}`;
    }

    function createGroupLabel(groupName, visibleText = groupName) {
        const label = document.createElement("span");
        label.className = "content-cluster";

        const swatch = document.createElement("span");
        swatch.className = "brand-color-swatch " + groupSwatch(groupName);
        swatch.setAttribute("role", "img");
        swatch.setAttribute("aria-label", groupName + " group color");
        swatch.title = groupName + " color";

        const text = document.createElement("span");
        text.textContent = visibleText;

        label.append(swatch, text);
        return label;
    }

    function createChildCapabilities(tool) {
        if (!Array.isArray(tool.childCapabilities) || tool.childCapabilities.length === 0) {
            return null;
        }
        const capabilities = document.createElement("div");
        capabilities.className = "content-stack content-stack--compact";
        capabilities.dataset.childCapabilities = tool.title;

        const label = document.createElement("p");
        label.textContent = tool.capabilityLabel || "Planned child capabilities";

        const list = document.createElement("ul");
        list.setAttribute("aria-label", tool.title + " child capabilities");
        tool.childCapabilities.forEach((capability) => {
            const item = document.createElement("li");
            item.textContent = capability;
            list.append(item);
        });

        capabilities.append(label, list);
        return capabilities;
    }

    function registryToolForCard(tool) {
        return registryToolsByTitle.get(tool.title) || null;
    }

    function registryImageSource(registryTool, kind) {
        return registryTool ? getToolImageSource(registryTool, kind) : TOOL_IMAGE_FALLBACK;
    }

    function createToolCard(tool, options = {}) {
        const registryTool = registryToolForCard(tool);
        const article = document.createElement("article");
        article.className = `control-card ${groupClass(tool.group)}`;
        article.dataset.mascot = tool.mascot;
        article.dataset.toolboxRole = tool.adminOnly ? "admin" : tool.hidden ? "hidden" : tool.planned ? "planned" : "creator";

        const media = document.createElement("div");
        media.className = "card-media";
        const mediaLink = document.createElement("a");
        mediaLink.className = "card-media-link";
        mediaLink.href = tool.href;
        mediaLink.setAttribute("aria-label", "Open " + tool.title);
        const image = document.createElement("img");
        image.src = registryImageSource(registryTool, "tool");
        image.alt = tool.title + " preview";
        mediaLink.append(image);
        media.append(mediaLink);

        const body = document.createElement("div");
        body.className = "card-body";

        const categoryText = tool.subgroup ? `${tool.group} - ${tool.subgroup}` : tool.group;
        const badgeCluster = createGroupLabel(tool.group, categoryText);
        const badge = document.createElement("object");
        badge.data = registryImageSource(registryTool, "badge");
        badge.type = "image/png";
        badge.width = 48;
        badge.height = 48;
        badge.setAttribute("aria-label", tool.title + " badge");
        badge.textContent = tool.title + " badge";
        badgeCluster.append(badge);

        const readiness = document.createElement("span");
        readiness.className = "pill";
        readiness.dataset.toolboxReadiness = tool.status;
        readiness.textContent = tool.status;

        const title = document.createElement("h3");
        title.textContent = tool.title;

        const description = document.createElement("p");
        description.textContent = tool.description;
        const childCapabilities = createChildCapabilities(tool);

        const link = document.createElement("a");
        link.className = "btn";
        link.href = tool.href;
        link.textContent = tool.href.indexOf("toolbox/") === 0 || tool.href.indexOf("../toolbox/") === 0 ? "Open Tool" : "Open Page";

        if (options.showReadiness) {
            const requirements = document.createElement("p");
            requirements.textContent = `requiredForTestable: ${tool.requiredForTestable ? "yes" : "no"} | requiredForPublish: ${tool.requiredForPublish ? "yes" : "no"}`;

            const requires = document.createElement("p");
            requires.textContent = `requires: ${tool.requires.length ? tool.requires.join(", ") : "none"}`;

            const checklist = document.createElement("ul");
            tool.progressChecklist.forEach((item) => {
                const entry = document.createElement("li");
                entry.textContent = item;
                checklist.append(entry);
            });

            const progressParts = [readiness, title, description];
            if (childCapabilities) {
                progressParts.push(childCapabilities);
            }
            progressParts.push(requirements, requires, checklist, link, badgeCluster);
            body.append(...progressParts);
        } else {
            const cardParts = [title, description];
            if (childCapabilities) {
                cardParts.push(childCapabilities);
            }
            cardParts.push(link, badgeCluster);
            body.append(...cardParts);
        }
        article.append(media, body);
        return article;
    }

    function createAccordion(group, isOpen, options = {}) {
        const details = document.createElement("details");
        details.className = `vertical-accordion ${group.groupClass}`;
        details.dataset.toolsAccordion = group.title;
        details.open = isOpen;

        const summary = document.createElement("summary");
        summary.append(createGroupLabel(group.title));

        const body = document.createElement("div");
        body.className = "accordion-body";

        if (group.note) {
            const note = document.createElement("p");
            note.textContent = group.note;
            body.append(note);
        }

        const grid = document.createElement("div");
        grid.className = "card-grid";

        group.tools.forEach((tool) => {
            grid.append(createToolCard(tool, options));
        });

        if (group.tools.length) {
            body.append(grid);
        }
        details.append(summary, body);
        return details;
    }

    function createToolGrid(tools) {
        const grid = document.createElement("div");
        grid.className = "card-grid";
        tools.forEach((tool) => {
            grid.append(createToolCard(tool));
        });
        return grid;
    }

    function render(mode) {
        if (mode === "grouped") {
            const accordions = getGroupedTools().map((group, position) => {
                const groupIsTargeted = targetGroupSlug ? groupSlug(group.title) === targetGroupSlug : position === 0;
                return createAccordion(group, groupIsTargeted);
            });
            renderWithRoleFocus(...accordions);
        } else if (mode === "build-path") {
            targetGroupSlug = "";
            renderWithRoleFocus(createBuildPathSummary(), createBuildPathTable());
        } else {
            targetGroupSlug = "";
            renderWithRoleFocus(createToolGrid(getOrderedTools(mode)));
        }
        currentMode = mode;
        setActiveButton(mode);
        updateToolCount();
    }

    if (orderButton) {
        orderButton.addEventListener("click", () => {
            const nextOrder = currentMode === "grouped"
                ? orderButton.dataset.toolsOrder
                : orderButton.dataset.toolsOrder === "ascending" ? "descending" : "ascending";
            orderButton.dataset.toolsOrder = nextOrder;
            render(nextOrder);
        });
    }

    if (groupedButton) {
        groupedButton.addEventListener("click", () => {
            targetGroupSlug = "";
            render("grouped");
        });
    }

    if (buildPathButton) {
        buildPathButton.addEventListener("click", () => {
            render("build-path");
        });
    }

    configureRoleBanner();
    configureProjectDataActions();
    render(currentMode);
}());
